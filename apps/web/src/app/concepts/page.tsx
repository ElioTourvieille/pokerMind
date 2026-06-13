'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { get } from '@/lib/api'
import { CheckCircle2, BookOpen, ChevronRight, X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

type Category = 'all' | 'preflop' | 'aggression' | 'defense' | 'postflop'

interface ConceptSummary {
  id: string
  title: string
  summary: string
  category: string
  difficulty: 1 | 2 | 3
  relatedLeaks: string[]
  mastered: boolean
  bestScore: number
  attempts: number
}

// ── Config ─────────────────────────────────────────────────────────────────

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'preflop', label: 'Préflop' },
  { id: 'aggression', label: 'Agressivité' },
  { id: 'defense', label: 'Défense' },
  { id: 'postflop', label: 'Postflop' },
]

const CATEGORY_COLORS: Record<string, string> = {
  preflop: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  aggression: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  defense: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  postflop: 'bg-green-500/15 text-green-400 border-green-500/30',
}

const CATEGORY_LABELS: Record<string, string> = {
  preflop: 'Préflop',
  aggression: 'Agressivité',
  defense: 'Défense',
  postflop: 'Postflop',
}

const LEAK_LABELS: Record<string, string> = {
  vpip_haut: 'VPIP trop élevé',
  vpip_bas: 'VPIP trop bas',
  pfr_bas: 'PFR trop bas',
  pfr_haut: 'PFR trop élevé',
  wwsf_bas: 'WWSF trop bas',
  wwsf_haut: 'WWSF trop élevé',
  fold_3bet_haut: 'Fold to 3bet trop élevé',
  fold_3bet_bas: 'Fold to 3bet trop bas',
  cbet_bas: 'C-bet trop bas',
  cbet_haut: 'C-bet trop élevé',
  fold_cbet_haut: 'Fold to C-bet trop élevé',
  fold_cbet_bas: 'Fold to C-bet trop bas',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((d) => (
        <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= level ? 'bg-primary' : 'bg-muted'}`} />
      ))}
    </div>
  )
}

function MasteryBadge({ mastered, bestScore, attempts, total }: {
  mastered: boolean; bestScore: number; attempts: number; total: number
}) {
  if (mastered) return (
    <span className="flex items-center gap-1 text-xs font-medium text-primary">
      <CheckCircle2 className="w-3.5 h-3.5" />Maîtrisé
    </span>
  )
  if (attempts > 0) return (
    <span className="text-xs text-amber-400 font-medium">{bestScore}/{total} au mieux</span>
  )
  return <span className="text-xs text-muted-foreground">Pas commencé</span>
}

function ConceptCard({ concept }: { concept: ConceptSummary }) {
  const colorClass = CATEGORY_COLORS[concept.category] ?? 'bg-muted text-muted-foreground'
  const drillTotal = concept.difficulty <= 2 ? 3 : 2

  return (
    <Link
      href={`/concepts/${concept.id}`}
      className={`group bg-card border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors ${
        concept.mastered ? 'border-primary/20' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${colorClass}`}>
          {CATEGORY_LABELS[concept.category] ?? concept.category}
        </span>
        <DifficultyDots level={concept.difficulty} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
          {concept.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
          {concept.summary}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <MasteryBadge mastered={concept.mastered} bestScore={concept.bestScore} attempts={concept.attempts} total={drillTotal} />
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}

// ── Inner page (uses useSearchParams) ──────────────────────────────────────

function ConceptsInner() {
  const searchParams = useSearchParams()
  const leakFilter = searchParams.get('leak')

  const [concepts, setConcepts] = useState<ConceptSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setError('Non connecté'); setLoading(false); return }

    const url = leakFilter ? `/concepts?leak=${leakFilter}` : '/concepts'
    get<ConceptSummary[]>(url, token)
      .then(setConcepts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [leakFilter])

  const filtered =
    activeCategory === 'all'
      ? concepts
      : concepts.filter((c) => c.category === activeCategory)

  const masteredCount = concepts.filter((c) => c.mastered).length

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="text-muted-foreground animate-pulse">Chargement…</div>
    </div>
  )

  if (error) return (
    <div className="p-8">
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-muted-foreground">{error}</p>
        {error === 'Non connecté' && (
          <a href="/auth/connexion" className="mt-4 inline-block text-primary hover:underline text-sm">Se connecter</a>
        )}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Concepts
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Théorie, exemples et drills pour corriger tes fuites
          </p>
        </div>
        {!leakFilter && concepts.length > 0 && (
          <div className="bg-card border border-border rounded-lg px-4 py-2.5 text-right">
            <div className="text-2xl font-bold tabular-nums text-primary">
              {masteredCount}<span className="text-muted-foreground text-base font-normal">/{concepts.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">maîtrisés</div>
          </div>
        )}
      </div>

      {/* Bandeau filtre par fuite */}
      {leakFilter && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5">
          <span className="text-xs text-amber-400 font-medium">
            Filtrés pour : <span className="font-bold">{LEAK_LABELS[leakFilter] ?? leakFilter}</span>
          </span>
          <Link href="/concepts" className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />Voir tous
          </Link>
        </div>
      )}

      {/* Barre de progression globale (hors filtre fuite) */}
      {!leakFilter && concepts.length > 0 && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.round((masteredCount / concepts.length) * 100)}%` }}
          />
        </div>
      )}

      {/* Filtres catégories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all' ? concepts.length : concepts.filter((c) => c.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              {cat.label}
              <span className={`ml-1.5 text-xs ${activeCategory === cat.id ? 'opacity-70' : 'opacity-50'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Aucun concept dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((concept) => <ConceptCard key={concept.id} concept={concept} />)}
        </div>
      )}
    </div>
  )
}

// ── Page (Suspense boundary for useSearchParams) ───────────────────────────

export default function ConceptsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">Chargement…</div>
      </div>
    }>
      <ConceptsInner />
    </Suspense>
  )
}
