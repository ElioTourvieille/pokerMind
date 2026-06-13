'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { streamPost } from '@/lib/api'
import { Brain, CheckCircle2, ChevronRight, Clock, Loader2, Send } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

type ReviewStatus =
  | 'idle'
  | 'loading_questions'
  | 'answering'
  | 'streaming'
  | 'done'
  | 'error'

interface HandSummary {
  id: string
  site: string
  stakes: string
  typeJeu: string
  joueeLE: string
  reviewIA: { id: string } | null
}

interface HandsResponse {
  mains: HandSummary[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function renderMarkdownInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
      : part
  )
}

function AnalysisText({ text }: { text: string }) {
  const paragraphs = text.split('\n').filter(Boolean)
  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-muted-foreground">
          {renderMarkdownInline(p)}
        </p>
      ))}
    </div>
  )
}

// ── Hand selector ──────────────────────────────────────────────────────────

function HandSelector({
  token,
  onSelect,
}: {
  token: string
  onSelect: (id: string) => void
}) {
  const [hands, setHands] = useState<HandSummary[]>([])
  const [loading, setLoading] = useState(true)
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  useEffect(() => {
    fetch(`${apiBase}/mains?limite=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json() as Promise<HandsResponse>)
      .then((r) => setHands(r.mains))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground animate-pulse text-sm p-4">
      <Loader2 className="w-4 h-4 animate-spin" />Chargement des mains…
    </div>
  )

  if (hands.length === 0) return (
    <div className="bg-card border border-border rounded-lg p-6 text-center space-y-2">
      <p className="text-muted-foreground text-sm">Aucune main importée.</p>
      <a href="/hands" className="text-primary text-sm hover:underline">Importer des mains →</a>
    </div>
  )

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
      {hands.map((h) => (
        <button
          key={h.id}
          onClick={() => onSelect(h.id)}
          className="group w-full flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-muted-foreground uppercase">{h.site}</span>
              <span className="font-medium">{h.stakes}</span>
              <span className="text-xs text-muted-foreground">{h.typeJeu}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />{formatDate(h.joueeLE)}
            </div>
          </div>
          {h.reviewIA && (
            <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full shrink-0">
              Déjà analysée
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </button>
      ))}
    </div>
  )
}

// ── Review flow ────────────────────────────────────────────────────────────

function ReviewFlow({ mainId, token }: { mainId: string; token: string }) {
  const [status, setStatus] = useState<ReviewStatus>('idle')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState<string | null>(null)
  const analysisRef = useRef<HTMLDivElement>(null)
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  async function start() {
    setStatus('loading_questions')
    setError(null)
    try {
      const res = await fetch(`${apiBase}/review/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mainId }),
      })
      if (!res.ok) {
        const json = await res.json() as { message: string }
        throw new Error(json.message)
      }
      const data = await res.json() as { questions: string[] }
      setQuestions(data.questions)
      setAnswers(data.questions.map(() => ''))
      setStatus('answering')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du démarrage'
      setError(msg)
      toast.error(msg)
      setStatus('error')
    }
  }

  async function handleSubmit() {
    if (answers.some((a) => !a.trim())) return
    setStatus('streaming')
    setAnalysis('')

    await streamPost(
      '/review/answer',
      { mainId, answers },
      token,
      (chunk) => {
        setAnalysis((prev) => {
          const next = prev + chunk
          setTimeout(() => {
            analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
          }, 0)
          return next
        })
      },
      () => { setStatus('done'); toast.success('Analyse terminée') },
      (msg) => { setError(msg); toast.error(msg); setStatus('error') },
    )
  }

  // ── Render by state ───────────────────────────────────────────────────────

  if (status === 'idle') return (
    <div className="bg-card border border-border rounded-lg p-5 text-center space-y-3">
      <Brain className="w-8 h-8 text-primary mx-auto" />
      <div>
        <p className="font-medium">Prêt à analyser cette main</p>
        <p className="text-muted-foreground text-sm mt-1">
          Claude va d'abord te poser 2–3 questions sur ton raisonnement,<br />
          puis t'envoyer une analyse complète.
        </p>
      </div>
      <button
        onClick={start}
        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
      >
        Démarrer la review
      </button>
    </div>
  )

  if (status === 'loading_questions') return (
    <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Claude analyse la main…</span>
    </div>
  )

  if (status === 'answering') return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Questions de ton coach</h3>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="space-y-2">
            <p className="text-sm font-medium leading-snug">
              <span className="text-primary font-bold mr-1.5">Q{i + 1}.</span>
              {q}
            </p>
            <textarea
              rows={3}
              value={answers[i]}
              onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
              placeholder="Ton raisonnement…"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={answers.some((a) => !a.trim())}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        <Send className="w-4 h-4" />
        Envoyer mes réponses
      </button>
    </div>
  )

  if (status === 'streaming' || status === 'done') return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          {status === 'streaming' ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          )}
          <h3 className="font-semibold text-sm">
            {status === 'streaming' ? 'Analyse en cours…' : 'Analyse complète'}
          </h3>
        </div>

        <div ref={analysisRef}>
          <AnalysisText text={analysis} />
          {status === 'streaming' && (
            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>

      {status === 'done' && (
        <div className="flex gap-3">
          <a
            href="/concepts"
            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            Voir les concepts →
          </a>
          <button
            onClick={() => { setStatus('idle'); setAnalysis(''); setQuestions([]); setAnswers([]) }}
            className="flex-1 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Nouvelle review
          </button>
        </div>
      )}
    </div>
  )

  if (status === 'error') return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-5 text-sm text-red-400 space-y-2">
      <p className="font-medium">Erreur</p>
      <p>{error}</p>
      <button onClick={() => setStatus('idle')} className="text-xs underline opacity-70 hover:opacity-100">
        Réessayer
      </button>
    </div>
  )

  return null
}

// ── Inner page ─────────────────────────────────────────────────────────────

function ReviewInner() {
  const searchParams = useSearchParams()
  const mainIdParam = searchParams.get('mainId')

  const [token, setToken] = useState<string | null>(null)
  const [mainId, setMainId] = useState<string | null>(mainIdParam)

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { window.location.href = '/auth/connexion'; return }
    setToken(t)
  }, [])

  if (!token) return null

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Review
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Analyse Socratique guidée par Claude
        </p>
      </div>

      {!mainId ? (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Choisir une main
          </h2>
          <HandSelector token={token} onSelect={setMainId} />
        </section>
      ) : (
        <section className="space-y-4">
          <button
            onClick={() => setMainId(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Changer de main
          </button>
          <ReviewFlow mainId={mainId} token={token} />
        </section>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse text-sm">Chargement…</div>
      </div>
    }>
      <ReviewInner />
    </Suspense>
  )
}
