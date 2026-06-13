'use client'

import { useState, useCallback } from 'react'
import {
  RANKS,
  POSITIONS,
  RANGES,
  POSITION_LABELS,
  cellToHand,
  rangeStats,
  type Position,
} from '@/lib/preflop-ranges'
import { CheckCircle2, XCircle, RefreshCw, BarChart2, Brain } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

type Mode = 'view' | 'quiz'

interface QuizHand {
  row: number
  col: number
  hand: string
  answered: boolean
  wasCorrect: boolean | null
}

interface Score {
  correct: number
  total: number
}

// ── Grid ───────────────────────────────────────────────────────────────────

function RangeGrid({
  position,
  highlight,
}: {
  position: Position
  highlight?: { row: number; col: number }
}) {
  const range = RANGES[position]

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 460 }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '26px repeat(13, 32px)', gap: 2, marginBottom: 4 }}>
          <div />
          {RANKS.map((r) => (
            <div key={r} className="text-[10px] font-bold text-muted-foreground text-center">{r}</div>
          ))}
        </div>

        {/* Rows */}
        {RANKS.map((_, ri) => (
          <div
            key={ri}
            style={{ display: 'grid', gridTemplateColumns: '26px repeat(13, 32px)', gap: 2, marginBottom: 2 }}
          >
            <div className="text-[10px] font-bold text-muted-foreground flex items-center justify-end pr-1.5">
              {RANKS[ri]}
            </div>
            {RANKS.map((_, ci) => {
              const hand = cellToHand(ri, ci)
              const inRange = range.has(hand)
              const isHl = highlight?.row === ri && highlight?.col === ci
              const isPair = ri === ci
              const isSuited = ri < ci

              return (
                <div
                  key={ci}
                  title={hand}
                  className={`h-[28px] rounded-[3px] transition-all cursor-default select-none ${
                    isHl ? 'ring-2 ring-white ring-offset-1 ring-offset-background z-10 relative' : ''
                  } ${
                    inRange
                      ? isPair
                        ? 'bg-green-500'
                        : isSuited
                          ? 'bg-green-600'
                          : 'bg-green-900'
                      : 'bg-zinc-800'
                  }`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Visualizer ─────────────────────────────────────────────────────────────

function Visualizer({ position }: { position: Position }) {
  const stats = rangeStats(position)

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
          <div className="text-2xl font-bold text-primary">{stats.pct}%</div>
          <div className="text-xs text-muted-foreground">des mains</div>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
          <div className="text-2xl font-bold tabular-nums">{stats.hands}</div>
          <div className="text-xs text-muted-foreground">types de mains</div>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
          <div className="text-2xl font-bold tabular-nums">{stats.combos}</div>
          <div className="text-xs text-muted-foreground">combos / 1326</div>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          {POSITION_LABELS[position]} — range d'open 6-max cash game (approximation GTO).
        </p>
      </div>

      {/* Grid */}
      <RangeGrid position={position} />

      {/* Légende */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-500" />Paires
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-600" />Suited
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-900" />Offsuit
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-zinc-800" />Fold
        </div>
      </div>
    </div>
  )
}

// ── Quiz ───────────────────────────────────────────────────────────────────

function generateHand(): QuizHand {
  const row = Math.floor(Math.random() * 13)
  const col = Math.floor(Math.random() * 13)
  return { row, col, hand: cellToHand(row, col), answered: false, wasCorrect: null }
}

function handTypeLabel(hand: string): string {
  if (!hand.endsWith('s') && !hand.endsWith('o')) return 'paire'
  return hand.endsWith('s') ? 'suited' : 'offsuit'
}

function Quiz({ position }: { position: Position }) {
  const [current, setCurrent] = useState<QuizHand>(generateHand)
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 })
  const range = RANGES[position]

  const answer = useCallback(
    (action: 'open' | 'fold') => {
      if (current.answered) return
      const shouldOpen = range.has(current.hand)
      const correct = (action === 'open') === shouldOpen
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
      setCurrent((c) => ({ ...c, answered: true, wasCorrect: correct }))
    },
    [current, range],
  )

  const next = useCallback(() => setCurrent(generateHand()), [])

  const reset = useCallback(() => {
    setScore({ correct: 0, total: 0 })
    setCurrent(generateHand())
  }, [])

  const shouldOpen = range.has(current.hand)
  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : null

  return (
    <div className="space-y-5 max-w-lg">
      {/* Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Score :</span>
          <span className="font-bold tabular-nums">
            <span className="text-primary">{score.correct}</span>
            <span className="text-muted-foreground">/{score.total}</span>
          </span>
          {pct !== null && (
            <span className={`text-sm font-medium ${pct >= 70 ? 'text-primary' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              ({pct}%)
            </span>
          )}
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />Reset
        </button>
      </div>

      {/* Card de question */}
      <div className="bg-card border border-border rounded-xl p-6 text-center space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Position : <span className="text-foreground">{position}</span>
        </p>
        <div className="text-5xl font-bold tracking-tight py-2">{current.hand}</div>
        <p className="text-xs text-muted-foreground">{handTypeLabel(current.hand)}</p>
      </div>

      {/* Grille highlight */}
      {current.answered && (
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-2 text-center">Position dans la range :</p>
          <RangeGrid position={position} highlight={{ row: current.row, col: current.col }} />
        </div>
      )}

      {/* Feedback */}
      {current.answered && (
        <div className={`rounded-lg border p-4 flex items-start gap-3 ${
          current.wasCorrect
            ? 'bg-primary/10 border-primary/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          {current.wasCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="text-sm">
            <span className={`font-semibold ${current.wasCorrect ? 'text-primary' : 'text-red-400'}`}>
              {current.wasCorrect ? 'Correct !' : 'Incorrect'}
            </span>
            {' — '}
            <span className="text-muted-foreground">
              {current.hand} est{' '}
              {shouldOpen ? (
                <><span className="text-foreground font-medium">dans la range {position}</span> → Open raise</>
              ) : (
                <><span className="text-foreground font-medium">hors de la range {position}</span> → Fold</>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Boutons action / suivant */}
      {!current.answered ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => answer('open')}
            className="py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Open
          </button>
          <button
            onClick={() => answer('fold')}
            className="py-4 rounded-lg bg-muted text-muted-foreground font-bold text-lg hover:bg-muted/70 transition-colors"
          >
            Fold
          </button>
        </div>
      ) : (
        <button
          onClick={next}
          className="w-full py-3 rounded-lg bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          Main suivante →
        </button>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PreflopPage() {
  const [position, setPosition] = useState<Position>('BTN')
  const [mode, setMode] = useState<Mode>('view')

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Préflop Trainer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visualise les ranges par position et entraîne-toi au quiz Open / Fold
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Position selector */}
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosition(pos)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                position === pos
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="flex bg-muted rounded-lg p-1 gap-1 ml-auto">
          <button
            onClick={() => setMode('view')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'view'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Visualiser
          </button>
          <button
            onClick={() => setMode('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'quiz'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Quiz
          </button>
        </div>
      </div>

      {/* Position info */}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{position}</span> — {POSITION_LABELS[position]}
      </p>

      {/* Content */}
      {mode === 'view' ? <Visualizer position={position} /> : <Quiz position={position} />}
    </div>
  )
}
