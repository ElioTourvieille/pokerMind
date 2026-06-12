'use client'

import { useEffect, useState } from 'react'
import { get } from '@/lib/api'
import { Trophy, Lock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface Stage {
  id: string
  label: string
  description: string
  rank: number
  minHands: number
  minBbPer100: number | null
}

interface Criteria {
  label: string
  required: number
  current: number
  met: boolean
}

interface StatEntry {
  key: string
  label: string
  value: number
  range: [number, number]
  inRange: boolean
}

interface Category {
  id: string
  label: string
  mastery: number
  stats: StatEntry[]
}

interface ProgressionProfile {
  currentStage: Stage
  nextStage: (Stage & { criteria: Criteria[] }) | null
  progressPct: number
  totalHands: number
  bbPer100: number
  categories: Category[]
}

// ── Stage config ───────────────────────────────────────────────────────────

const ALL_STAGES = [
  { id: 'discovery', label: 'Découverte', rank: 0 },
  { id: 'apprentice', label: 'Apprenti', rank: 1 },
  { id: 'regular', label: 'Régulier', rank: 2 },
  { id: 'solid', label: 'Solide', rank: 3 },
  { id: 'winner', label: 'Gagnant', rank: 4 },
  { id: 'semi_pro', label: 'Semi-Pro', rank: 5 },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function masteryColor(pct: number) {
  if (pct === 100) return 'text-primary'
  if (pct >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function masteryBg(pct: number) {
  if (pct === 100) return 'bg-primary'
  if (pct >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}

function bbColor(bb: number) {
  if (bb > 0) return 'text-primary'
  if (bb < 0) return 'text-red-400'
  return 'text-muted-foreground'
}

// ── Components ─────────────────────────────────────────────────────────────

function StageRoadmap({ currentRank }: { currentRank: number }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Progression</h2>
      <div className="flex items-center gap-0">
        {ALL_STAGES.map((stage, i) => {
          const done = stage.rank < currentRank
          const active = stage.rank === currentRank
          const locked = stage.rank > currentRank

          return (
            <div key={stage.id} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? 'bg-primary border-primary text-primary-foreground'
                      : active
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : active ? (
                    <Trophy className="w-4 h-4" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight ${locked ? 'text-muted-foreground' : active ? 'text-primary' : 'text-foreground'}`}>
                  {stage.label}
                </span>
              </div>
              {i < ALL_STAGES.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded ${done ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <button className="w-full flex items-center gap-3 text-left" onClick={() => setOpen(!open)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{category.label}</span>
            <span className={`text-sm font-bold tabular-nums ${masteryColor(category.mastery)}`}>
              {category.mastery}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${masteryBg(category.mastery)}`}
              style={{ width: `${category.mastery}%` }}
            />
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {category.stats.map((stat) => (
            <div key={stat.key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{stat.label}</span>
              <div className="flex items-center gap-2">
                <span className="tabular-nums font-medium">{stat.value.toFixed(1)}%</span>
                {stat.inRange ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ProgressionPage() {
  const [profile, setProfile] = useState<ProgressionProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Non connecté')
      setLoading(false)
      return
    }
    get<ProgressionProfile>('/progression/profil', token)
      .then(setProfile)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">Chargement…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">{error}</p>
          {error === 'Non connecté' && (
            <a href="/auth/connexion" className="mt-4 inline-block text-primary hover:underline text-sm">
              Se connecter
            </a>
          )}
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Progression</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile.totalHands.toLocaleString('fr-FR')} mains jouées
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg px-5 py-3 text-right">
          <div className={`text-3xl font-bold tabular-nums ${bbColor(profile.bbPer100)}`}>
            {profile.bbPer100 > 0 ? '+' : ''}{profile.bbPer100.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">bb / 100 mains</div>
        </div>
      </div>

      {/* Stage actuel */}
      <div className="bg-card border border-primary/30 rounded-lg p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{profile.currentStage.label}</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Stage {profile.currentStage.rank + 1}/6</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{profile.currentStage.description}</p>
        </div>
      </div>

      {/* Roadmap */}
      <StageRoadmap currentRank={profile.currentStage.rank} />

      {/* Progression vers le prochain stage */}
      {profile.nextStage && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Vers {profile.nextStage.label}
            </h2>
            <span className="text-sm font-bold text-primary">{profile.progressPct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${profile.progressPct}%` }}
            />
          </div>
          <div className="space-y-2">
            {profile.nextStage.criteria.map((c) => (
              <div key={c.label} className="flex items-center gap-3 text-sm">
                {c.met ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span className={c.met ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
                <span className="ml-auto tabular-nums font-medium">
                  <span className={c.met ? 'text-primary' : 'text-foreground'}>{c.current}</span>
                  <span className="text-muted-foreground"> / {c.required}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!profile.nextStage && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-5 text-center">
          <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-primary font-semibold">Stage maximum atteint — niveau Semi-Pro !</p>
        </div>
      )}

      {/* Maîtrise par catégorie */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Maîtrise par catégorie
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>
    </div>
  )
}
