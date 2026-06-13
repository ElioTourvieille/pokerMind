import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CONCEPTS, ConceptDefinition } from './concepts.data'

export interface ConceptSummary {
  id: string
  title: string
  summary: string
  category: string
  difficulty: number
  relatedLeaks: string[]
  mastered: boolean
  bestScore: number
  attempts: number
}

export interface ConceptDetail extends ConceptSummary {
  content: string
  drill: ConceptDefinition['drill']
}

export interface DrillSubmission {
  answers: number[]
}

export interface DrillResult {
  score: number
  total: number
  mastered: boolean
  feedback: { questionId: string; correct: boolean; explanation: string }[]
}

@Injectable()
export class ConceptsService {
  constructor(private prisma: PrismaService) {}

  async listConcepts(userId: string): Promise<ConceptSummary[]> {
    const progress = await this.prisma.conceptProgress.findMany({
      where: { userId },
    })
    const progressMap = new Map(progress.map((p) => [p.conceptId, p]))

    return CONCEPTS.map((c) => {
      const p = progressMap.get(c.id)
      return {
        id: c.id,
        title: c.title,
        summary: c.summary,
        category: c.category,
        difficulty: c.difficulty,
        relatedLeaks: c.relatedLeaks,
        mastered: p?.mastered ?? false,
        bestScore: p?.bestScore ?? 0,
        attempts: p?.attempts ?? 0,
      }
    })
  }

  async getConcept(userId: string, conceptId: string): Promise<ConceptDetail> {
    const concept = CONCEPTS.find((c) => c.id === conceptId)
    if (!concept) throw new NotFoundException(`Concept "${conceptId}" introuvable`)

    const progress = await this.prisma.conceptProgress.findUnique({
      where: { userId_conceptId: { userId, conceptId } },
    })

    return {
      id: concept.id,
      title: concept.title,
      summary: concept.summary,
      category: concept.category,
      difficulty: concept.difficulty,
      relatedLeaks: concept.relatedLeaks,
      content: concept.content,
      drill: concept.drill,
      mastered: progress?.mastered ?? false,
      bestScore: progress?.bestScore ?? 0,
      attempts: progress?.attempts ?? 0,
    }
  }

  async submitDrill(userId: string, conceptId: string, dto: DrillSubmission): Promise<DrillResult> {
    const concept = CONCEPTS.find((c) => c.id === conceptId)
    if (!concept) throw new NotFoundException(`Concept "${conceptId}" introuvable`)

    const feedback = concept.drill.map((q, i) => ({
      questionId: q.id,
      correct: dto.answers[i] === q.correctIndex,
      explanation: q.explanation,
    }))

    const score = feedback.filter((f) => f.correct).length
    const total = concept.drill.length
    const mastered = score === total

    const existing = await this.prisma.conceptProgress.findUnique({
      where: { userId_conceptId: { userId, conceptId } },
    })

    await this.prisma.conceptProgress.upsert({
      where: { userId_conceptId: { userId, conceptId } },
      create: {
        userId,
        conceptId,
        attempts: 1,
        bestScore: score,
        mastered,
        lastAttempt: new Date(),
      },
      update: {
        attempts: { increment: 1 },
        bestScore: Math.max(score, existing?.bestScore ?? 0),
        ...(mastered && { mastered: true }),
        lastAttempt: new Date(),
      },
    })

    return { score, total, mastered, feedback }
  }

  async getConceptsByLeak(userId: string, leakKey: string): Promise<ConceptSummary[]> {
    const all = await this.listConcepts(userId)
    return all.filter((c) => c.relatedLeaks.includes(leakKey))
  }
}
