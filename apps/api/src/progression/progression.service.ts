import { Injectable, NotFoundException } from '@nestjs/common'
import { StatsService } from '../stats/stats.service'
import { PrismaService } from '../prisma/prisma.service'

// ── Stage definitions ──────────────────────────────────────────────────────

export interface StageDefinition {
  id: string
  label: string
  description: string
  rank: number
  minHands: number
  minBbPer100: number | null
}

const STAGES: StageDefinition[] = [
  { id: 'discovery', label: 'Découverte', description: 'Commence ton voyage', rank: 0, minHands: 0, minBbPer100: null },
  { id: 'apprentice', label: 'Apprenti', description: 'Les bases prennent forme', rank: 1, minHands: 100, minBbPer100: null },
  { id: 'regular', label: 'Régulier', description: 'Tu maîtrises les fondamentaux', rank: 2, minHands: 500, minBbPer100: -5 },
  { id: 'solid', label: 'Solide', description: 'Jeu équilibré et rentable', rank: 3, minHands: 1000, minBbPer100: 0 },
  { id: 'winner', label: 'Gagnant', description: 'Tu bats régulièrement les stakes', rank: 4, minHands: 2500, minBbPer100: 3 },
  { id: 'semi_pro', label: 'Semi-Pro', description: 'Prêt pour les stakes supérieurs', rank: 5, minHands: 5000, minBbPer100: 8 },
]

// ── Category definitions ───────────────────────────────────────────────────

interface StatEntry {
  key: string
  label: string
  value: number
  range: [number, number]
  inRange: boolean
}

export interface CategoryInfo {
  id: string
  label: string
  mastery: number
  stats: StatEntry[]
}

const RANGES: Record<string, [number, number]> = {
  vpip_pct: [20, 28],
  pfr_pct: [15, 22],
  wwsf_pct: [46, 54],
  fold_3bet_pct: [48, 68],
  cbet_pct: [52, 72],
  fold_cbet_pct: [35, 55],
}

type StatsValues = Record<keyof typeof RANGES, number>

// ── Response shape ─────────────────────────────────────────────────────────

interface ProgressionCriteria {
  label: string
  required: number
  current: number
  met: boolean
}

export interface ProgressionProfile {
  currentStage: StageDefinition
  nextStage: (StageDefinition & { criteria: ProgressionCriteria[] }) | null
  progressPct: number
  totalHands: number
  bbPer100: number
  categories: CategoryInfo[]
}

@Injectable()
export class ProgressionService {
  constructor(
    private statsService: StatsService,
    private prisma: PrismaService,
  ) {}

  async getProfile(userId: string): Promise<ProgressionProfile> {
    const totalHands = await this.prisma.main.count({ where: { utilisateurId: userId } })

    let bbPer100 = 0
    let statsValues: StatsValues = {
      vpip_pct: 0, pfr_pct: 0, wwsf_pct: 0,
      fold_3bet_pct: 0, cbet_pct: 0, fold_cbet_pct: 0,
    }

    if (totalHands > 0) {
      try {
        const summary = await this.statsService.obtenirSummary(userId, {})
        bbPer100 = summary.stats.bb_par_100
        statsValues = {
          vpip_pct: summary.stats.vpip_pct,
          pfr_pct: summary.stats.pfr_pct,
          wwsf_pct: summary.stats.wwsf_pct,
          fold_3bet_pct: summary.stats.fold_3bet_pct,
          cbet_pct: summary.stats.cbet_pct,
          fold_cbet_pct: summary.stats.fold_cbet_pct,
        }
      } catch (e) {
        if (!(e instanceof NotFoundException)) throw e
      }
    }

    const currentStage = this.resolveStage(totalHands, bbPer100)
    const nextStageDef = STAGES[currentStage.rank + 1] ?? null

    let nextStage: ProgressionProfile['nextStage'] = null
    if (nextStageDef) {
      const criteria: ProgressionCriteria[] = [
        {
          label: 'Mains jouées',
          required: nextStageDef.minHands,
          current: totalHands,
          met: totalHands >= nextStageDef.minHands,
        },
      ]
      if (nextStageDef.minBbPer100 !== null) {
        criteria.push({
          label: 'Winrate (bb/100)',
          required: nextStageDef.minBbPer100,
          current: Math.round(bbPer100 * 100) / 100,
          met: bbPer100 >= nextStageDef.minBbPer100,
        })
      }
      nextStage = { ...nextStageDef, criteria }
    }

    return {
      currentStage,
      nextStage,
      progressPct: this.calcProgress(currentStage, nextStage, totalHands, bbPer100),
      totalHands,
      bbPer100,
      categories: this.calcCategories(statsValues),
    }
  }

  private resolveStage(hands: number, bb: number): StageDefinition {
    let reached = STAGES[0]
    for (const stage of STAGES) {
      const handsOk = hands >= stage.minHands
      const bbOk = stage.minBbPer100 === null || bb >= stage.minBbPer100
      if (handsOk && bbOk) reached = stage
    }
    return reached
  }

  private calcProgress(
    current: StageDefinition,
    next: ProgressionProfile['nextStage'],
    hands: number,
    bb: number,
  ): number {
    if (!next) return 100

    const handsPct = Math.min(100, (hands / next.minHands) * 100)
    if (next.minBbPer100 === null) return Math.round(handsPct)

    const bbFloor = current.minBbPer100 ?? -20
    const bbRange = next.minBbPer100 - bbFloor
    const bbPct = bbRange <= 0 ? 100 : Math.min(100, Math.max(0, ((bb - bbFloor) / bbRange) * 100))

    return Math.round(Math.min(handsPct, bbPct))
  }

  private calcCategories(vals: StatsValues): CategoryInfo[] {
    const defs = [
      { id: 'preflop_selection', label: 'Sélection Préflop', keys: ['vpip_pct', 'pfr_pct'], labels: ['VPIP', 'PFR'] },
      { id: 'aggression', label: 'Agressivité', keys: ['pfr_pct', 'cbet_pct'], labels: ['PFR', 'C-bet'] },
      { id: 'defense', label: 'Défense', keys: ['fold_3bet_pct', 'fold_cbet_pct'], labels: ['Fold to 3bet', 'Fold to C-bet'] },
      { id: 'postflop', label: 'Postflop', keys: ['wwsf_pct'], labels: ['WWSF'] },
    ]

    return defs.map((def) => {
      const stats: StatEntry[] = def.keys.map((key, i) => {
        const value = vals[key as keyof StatsValues] ?? 0
        const range = RANGES[key]
        return { key, label: def.labels[i], value, range, inRange: value >= range[0] && value <= range[1] }
      })
      return {
        id: def.id,
        label: def.label,
        mastery: Math.round((stats.filter((s) => s.inRange).length / stats.length) * 100),
        stats,
      }
    })
  }
}
