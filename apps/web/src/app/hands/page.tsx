'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { get, post } from '@/lib/api'
import { Upload, FileText, AlertCircle, CheckCircle2, ChevronRight, Clock } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

type Site = 'pokerstars' | 'ggpoker' | 'winamax'

interface ImportResult {
  importees: number
  doublons: number
  mains: { id: string; doublon: boolean }[]
}

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
  total: number
  page: number
  totalPages: number
}

type ImportStatus = 'idle' | 'loading' | 'success' | 'error'

// ── Helpers ────────────────────────────────────────────────────────────────

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Impossible de lire le fichier'))
    reader.readAsText(file, 'utf-8')
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const SITE_LABELS: Record<Site, string> = {
  pokerstars: 'PokerStars',
  ggpoker: 'GGPoker',
  winamax: 'Winamax',
}

// ── Components ─────────────────────────────────────────────────────────────

function ImportCard({ onSuccess }: { onSuccess: () => void }) {
  const [text, setText] = useState('')
  const [site, setSite] = useState<Site>('winamax')
  const [hero, setHero] = useState('')
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    try {
      const content = await readFile(file)
      setText(content)
    } catch {
      setError('Impossible de lire ce fichier')
    }
  }

  async function handleImport() {
    if (!text.trim()) return
    setStatus('loading')
    setError(null)
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/auth/connexion'; return }

    try {
      const res = await post<ImportResult>(
        '/mains',
        { texte: text, site, hero: hero || undefined },
        token,
      )
      setResult(res)
      setStatus('success')
      if (res.importees > 0) {
        toast.success(`${res.importees} main${res.importees > 1 ? 's' : ''} importée${res.importees > 1 ? 's' : ''}`)
        onSuccess()
      } else {
        toast.info('Aucune nouvelle main — tout était déjà importé')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'import"
      setError(msg)
      toast.error(msg)
      setStatus('error')
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      <h2 className="font-semibold flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary" />
        Importer des mains
      </h2>

      <div className="flex gap-3 flex-wrap">
        <div className="space-y-1 flex-1 min-w-[140px]">
          <label className="text-xs text-muted-foreground font-medium">Site</label>
          <select
            value={site}
            onChange={(e) => setSite(e.target.value as Site)}
            className="w-full bg-background border border-border rounded-md px-2.5 py-2 text-sm outline-none focus:border-primary transition-colors"
          >
            {(Object.entries(SITE_LABELS) as [Site, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1 flex-1 min-w-[140px]">
          <label className="text-xs text-muted-foreground font-medium">
            Pseudo hero <span className="opacity-50">(optionnel)</span>
          </label>
          <input
            type="text"
            value={hero}
            onChange={(e) => setHero(e.target.value)}
            placeholder="HeroBluff42"
            className="w-full bg-background border border-border rounded-md px-2.5 py-2 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-medium">
          Colle ton historique ou dépose un fichier .txt
        </label>
        <div
          className="relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) await handleFile(file)
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Colle ici le contenu de ton fichier de mains…"
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-primary transition-colors resize-none"
          />
          {!text && (
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Choisir un fichier
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) await handleFile(file)
          }}
        />
      </div>

      {status === 'success' && result && (
        <div className="flex items-start gap-2 bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold text-primary">
              {result.importees} main{result.importees > 1 ? 's' : ''} importée{result.importees > 1 ? 's' : ''}
            </span>
            {result.doublons > 0 && (
              <span className="text-muted-foreground">
                {' '}· {result.doublons} doublon{result.doublons > 1 ? 's' : ''} ignoré{result.doublons > 1 ? 's' : ''}
              </span>
            )}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!text.trim() || status === 'loading'}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {status === 'loading' ? 'Analyse en cours…' : 'Importer'}
      </button>
    </div>
  )
}

function HandRow({ hand }: { hand: HandSummary }) {
  return (
    <a
      href={`/review?mainId=${hand.id}`}
      className="group flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground uppercase">{hand.site}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-sm font-medium">{hand.stakes}</span>
          <span className="text-xs text-muted-foreground">{hand.typeJeu}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatDate(hand.joueeLE)}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {hand.reviewIA ? (
          <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
            Analysée
          </span>
        ) : (
          <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            Analyser
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </a>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HandsPage() {
  const [hands, setHands] = useState<HandSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  function load(p: number) {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/auth/connexion'; return }

    setLoading(true)
    get<HandsResponse>(`/mains?page=${p}&limite=20`, token)
      .then((res) => {
        setHands(res.mains)
        setPage(res.page)
        setTotalPages(res.totalPages)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1) }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes mains</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Importe un historique puis analyse chaque main avec Claude
        </p>
      </div>

      <ImportCard onSuccess={() => load(1)} />

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Historique
        </h2>

        {loading ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground animate-pulse text-sm">Chargement…</p>
          </div>
        ) : error ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center text-sm text-red-400">{error}</div>
        ) : hands.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground text-sm">Aucune main importée pour l'instant.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
            {hands.map((h) => <HandRow key={h.id} hand={h} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => load(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              ← Précédent
            </button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <button
              onClick={() => load(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Suivant →
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
