'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { get, post } from '@/lib/api'
import { CheckCircle2, XCircle, ArrowLeft, Trophy } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface DrillQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface ConceptDetail {
  id: string
  title: string
  summary: string
  category: string
  difficulty: 1 | 2 | 3
  relatedLeaks: string[]
  content: string
  drill: DrillQuestion[]
  mastered: boolean
  bestScore: number
  attempts: number
}

interface DrillFeedback {
  questionId: string
  correct: boolean
  explanation: string
}

interface DrillResult {
  score: number
  total: number
  mastered: boolean
  feedback: DrillFeedback[]
}

// ── Config ─────────────────────────────────────────────────────────────────

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

// ── Markdown renderer ──────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') { i++; continue }

    // Table
    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const rows = tableLines.filter((l) => !/^\|[-| ]+\|$/.test(l.trim()))
      const parsed = rows.map((r) =>
        r.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map((c) => c.trim())
      )
      if (parsed.length > 0) {
        blocks.push(
          <div key={key++} className="overflow-x-auto my-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {parsed[0].map((cell, ci) => (
                    <th key={ci} className="text-left px-3 py-2 bg-muted text-muted-foreground font-medium border border-border text-xs uppercase tracking-wide">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-border">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 border border-border text-muted-foreground">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push(
        <ul key={key++} className="my-2 space-y-1 pl-4">
          {items.map((item, ii) => (
            <li key={ii} className="text-muted-foreground text-sm flex gap-2">
              <span className="text-primary mt-1.5 shrink-0">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      blocks.push(
        <ol key={key++} className="my-2 space-y-1 pl-4">
          {items.map((item, ii) => (
            <li key={ii} className="text-muted-foreground text-sm flex gap-2">
              <span className="text-primary font-medium shrink-0 tabular-nums">{ii + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Paragraph (accumulate consecutive non-special lines)
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('|') &&
      !lines[i].startsWith('- ') &&
      !lines[i].startsWith('* ') &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    blocks.push(
      <p key={key++} className="text-muted-foreground text-sm leading-relaxed my-2">
        {renderInline(paraLines.join(' '))}
      </p>
    )
  }

  return <div className="space-y-0.5">{blocks}</div>
}

// ── Drill ──────────────────────────────────────────────────────────────────

function DrillSection({
  questions,
  conceptId,
  token,
  onResult,
}: {
  questions: DrillQuestion[]
  conceptId: string
  token: string
  onResult: (r: DrillResult) => void
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null))
  const [submitting, setSubmitting] = useState(false)
  const allAnswered = answers.every((a) => a !== null)

  function select(qi: number, oi: number) {
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
  }

  async function submit() {
    if (!allAnswered) return
    setSubmitting(true)
    try {
      const result = await post<DrillResult>(
        `/concepts/${conceptId}/drill`,
        { answers: answers as number[] },
        token,
      )
      onResult(result)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={q.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium leading-snug">
            <span className="text-primary font-bold mr-2">Q{qi + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => select(qi, oi)}
                className={`w-full text-left text-sm px-3 py-2 rounded-md border transition-colors ${
                  answers[qi] === oi
                    ? 'bg-primary/10 border-primary/50 text-foreground'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                <span className="font-medium text-primary mr-2">{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={submit}
        disabled={!allAnswered || submitting}
        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-opacity disabled:opacity-40 hover:opacity-90"
      >
        {submitting ? 'Correction…' : 'Valider le drill'}
      </button>
    </div>
  )
}

function DrillResults({
  result,
  questions,
  onRetry,
}: {
  result: DrillResult
  questions: DrillQuestion[]
  onRetry: () => void
}) {
  const pct = Math.round((result.score / result.total) * 100)

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className={`rounded-lg border p-5 text-center ${result.mastered ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'}`}>
        {result.mastered && <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />}
        <div className={`text-4xl font-bold tabular-nums ${result.mastered ? 'text-primary' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
          {result.score}/{result.total}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {result.mastered
            ? 'Concept maîtrisé !'
            : pct >= 50
            ? 'Bien, quelques erreurs à revoir'
            : 'Relis le contenu et réessaie'}
        </p>
      </div>

      {/* Feedback par question */}
      <div className="space-y-3">
        {result.feedback.map((fb, i) => {
          const q = questions[i]
          return (
            <div
              key={fb.questionId}
              className={`rounded-lg border p-4 space-y-2 ${fb.correct ? 'border-primary/20 bg-primary/5' : 'border-red-500/20 bg-red-500/5'}`}
            >
              <div className="flex items-start gap-2">
                {fb.correct ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium leading-snug">{q.question}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                {fb.explanation}
              </p>
            </div>
          )
        })}
      </div>

      <button
        onClick={onRetry}
        className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
      >
        Réessayer
      </button>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1 items-center">
      <span className="text-xs text-muted-foreground mr-1">Difficulté</span>
      {[1, 2, 3].map((d) => (
        <div key={d} className={`w-2 h-2 rounded-full ${d <= level ? 'bg-primary' : 'bg-muted'}`} />
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ConceptPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [concept, setConcept] = useState<ConceptDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const [drillResult, setDrillResult] = useState<DrillResult | null>(null)
  const [drillKey, setDrillKey] = useState(0)

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { setError('Non connecté'); setLoading(false); return }
    setToken(t)
    get<ConceptDetail>(`/concepts/${id}`, t)
      .then(setConcept)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function handleResult(result: DrillResult) {
    setDrillResult(result)
    if (result.mastered && concept) {
      setConcept({ ...concept, mastered: true, bestScore: result.score })
    }
  }

  function handleRetry() {
    setDrillResult(null)
    setDrillKey((k) => k + 1)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">Chargement…</div>
      </div>
    )
  }

  if (error || !concept) {
    return (
      <div className="p-8">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">{error ?? 'Concept introuvable'}</p>
          <button onClick={() => router.push('/concepts')} className="mt-4 text-primary hover:underline text-sm">
            Retour aux concepts
          </button>
        </div>
      </div>
    )
  }

  const colorClass = CATEGORY_COLORS[concept.category] ?? 'bg-muted text-muted-foreground'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push('/concepts')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Concepts
      </button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${colorClass}`}>
            {CATEGORY_LABELS[concept.category] ?? concept.category}
          </span>
          <DifficultyDots level={concept.difficulty} />
          {concept.mastered && (
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Maîtrisé
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold">{concept.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{concept.summary}</p>
      </div>

      {/* Contenu */}
      <section className="bg-card border border-border rounded-lg p-5">
        <MarkdownContent text={concept.content} />
      </section>

      {/* Drill */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Drill</h2>
          <span className="text-xs text-muted-foreground">{concept.drill.length} question{concept.drill.length > 1 ? 's' : ''}</span>
          {concept.attempts > 0 && !concept.mastered && (
            <span className="ml-auto text-xs text-muted-foreground">
              Meilleur score : {concept.bestScore}/{concept.drill.length}
            </span>
          )}
        </div>

        {drillResult ? (
          <DrillResults result={drillResult} questions={concept.drill} onRetry={handleRetry} />
        ) : (
          token && (
            <DrillSection
              key={drillKey}
              questions={concept.drill}
              conceptId={concept.id}
              token={token}
              onResult={handleResult}
            />
          )
        )}
      </section>
    </div>
  )
}
