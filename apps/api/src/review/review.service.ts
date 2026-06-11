import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import Anthropic from '@anthropic-ai/sdk'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { StartReviewDto } from './dto/start-review.dto'
import { AnswerReviewDto } from './dto/answer-review.dto'

const TTL_REVIEW = 86400 // 24h

interface ParsedPlayer {
  nom: string
  position: string
  stack: number
  cartes?: string[]
}

interface StreetAction {
  joueur: string
  action: string
  montant?: number
}

interface ParsedStreet {
  cartes?: string[]
  actions: StreetAction[]
}

interface ParsedHand {
  hero?: string
  joueurs?: ParsedPlayer[]
  rues?: {
    preflop?: ParsedStreet
    flop?: ParsedStreet
    turn?: ParsedStreet
    river?: ParsedStreet
  }
  board?: string[]
  pot?: number
  gagnants?: string[]
  stakes?: string
}

interface RawRes {
  write: (data: string) => void
  end: () => void
}

@Injectable()
export class ReviewService {
  private readonly anthropic: Anthropic

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    this.anthropic = new Anthropic()
  }

  async startReview(userId: string, dto: StartReviewDto) {
    const cacheKey = `review:questions:${dto.mainId}`
    const cached = await this.redis.get<{ questions: string[] }>(cacheKey)
    if (cached) return cached

    const hand = await this.prisma.main.findFirst({
      where: { id: dto.mainId, utilisateurId: userId },
    })
    if (!hand) throw new NotFoundException('Main introuvable')

    const context = this.buildContext(hand.donneesParsees as unknown as ParsedHand)

    const message = await this.anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: this.socraticPrompt(context) }],
    })

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    const questions = this.extractQuestions(text)
    const result = { questions }
    await this.redis.set(cacheKey, result, TTL_REVIEW)
    return result
  }

  async validateForAnswer(userId: string, mainId: string) {
    const hand = await this.prisma.main.findFirst({
      where: { id: mainId, utilisateurId: userId },
      select: { id: true, donneesParsees: true },
    })
    if (!hand) throw new NotFoundException('Main introuvable')

    const cacheKey = `review:questions:${mainId}`
    const cached = await this.redis.get<{ questions: string[] }>(cacheKey)
    if (!cached) {
      throw new UnprocessableEntityException('Session expirée, relancer POST /review/start')
    }

    return { hand, questions: cached.questions }
  }

  async streamAnswer(
    hand: { id: string; donneesParsees: unknown },
    questions: string[],
    dto: AnswerReviewDto,
    res: RawRes,
  ) {
    const cacheKey = `review:final:${hand.id}`
    const cached = await this.redis.get<string>(cacheKey)
    if (cached) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: cached })}\n\n`)
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      res.end()
      return
    }

    const context = this.buildContext(hand.donneesParsees as unknown as ParsedHand)

    const stream = this.anthropic.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: this.finalAnalysisPrompt(context, questions, dto.answers) }],
    })

    let fullAnalysis = ''

    stream.on('text', (text: string) => {
      fullAnalysis += text
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: text })}\n\n`)
    })

    try {
      await stream.finalMessage()
      await this.redis.set(cacheKey, fullAnalysis, TTL_REVIEW)
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
    } catch {
      res.write(`data: ${JSON.stringify({ type: 'error', message: "Erreur lors de l'analyse" })}\n\n`)
    } finally {
      res.end()
    }
  }

  private buildContext(data: ParsedHand): string {
    const hero = data.hero ?? 'Hero'
    const heroPlayer = data.joueurs?.find((j) => j.nom === hero)

    let ctx = `=== CONTEXTE DE LA MAIN ===\n`
    if (data.stakes) ctx += `Stakes : ${data.stakes}\n`
    if (data.pot != null) ctx += `Pot final : ${data.pot} BB\n`

    if (heroPlayer) {
      ctx += `Hero (${hero}) — Position : ${heroPlayer.position}, Stack : ${heroPlayer.stack} BB\n`
      if (heroPlayer.cartes?.length) ctx += `Cartes : ${heroPlayer.cartes.join(' ')}\n`
    }

    if (data.joueurs?.length) {
      ctx += `\nJoueurs à la table :\n`
      for (const p of data.joueurs) {
        ctx += `  ${p.nom} (${p.position}) — Stack : ${p.stack} BB\n`
      }
    }

    const streets = data.rues ?? {}
    const streetOrder = [
      { name: 'Préflop', data: streets.preflop },
      { name: 'Flop', data: streets.flop },
      { name: 'Turn', data: streets.turn },
      { name: 'River', data: streets.river },
    ]

    for (const street of streetOrder) {
      if (!street.data?.actions?.length) continue
      ctx += `\n--- ${street.name}`
      if (street.data.cartes?.length) ctx += ` [${street.data.cartes.join(' ')}]`
      ctx += ` ---\n`
      for (const action of street.data.actions) {
        ctx += `  ${action.joueur} : ${action.action}`
        if (action.montant != null) ctx += ` ${action.montant} BB`
        ctx += '\n'
      }
    }

    if (data.board?.length) ctx += `\nBoard final : ${data.board.join(' ')}\n`
    if (data.gagnants?.length) ctx += `Gagnant(s) : ${data.gagnants.join(', ')}\n`

    return ctx
  }

  private extractQuestions(text: string): string[] {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    const questions = lines.filter((l) => l.endsWith('?') || /^\d[\.\)]\s/.test(l))
    if (questions.length >= 2) return questions.slice(0, 3)
    return lines.slice(0, 3)
  }

  private socraticPrompt(context: string): string {
    return `Tu es un coach poker expert. Voici le déroulé d'une main jouée par ton élève :

${context}

Ton rôle est de guider l'élève par la réflexion, pas de lui donner les réponses directement.

Pose 2 ou 3 questions précises pour comprendre son raisonnement aux moments clés : range adverse, sizing, pot odds, position, reads, etc.

Réponds uniquement avec les questions numérotées, sans analyse ni commentaire.`
  }

  private finalAnalysisPrompt(context: string, questions: string[], answers: string[]): string {
    const qa = questions
      .map((q, i) => `Question ${i + 1} : ${q}\nRéponse de l'élève : ${answers[i] ?? '(sans réponse)'}`)
      .join('\n\n')

    return `Tu es un coach poker expert. Voici le déroulé d'une main et les réponses de l'élève à tes questions.

${context}

=== QUESTIONS ET RÉPONSES ===
${qa}

Donne une analyse complète et pédagogique. Structure ta réponse ainsi :

**1. Évaluation du raisonnement** : valide ou corrige les réponses de l'élève
**2. Points forts** : ce qu'il a bien fait
**3. Fuites identifiées** : erreurs concrètes avec explication
**4. Ligne optimale** : comment aurait-il dû jouer et pourquoi
**5. À retenir** : 1 ou 2 principes clés à mémoriser

Sois direct, précis et pédagogue. Utilise les termes techniques du poker.`
  }
}
