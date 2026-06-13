'use client'

import { useEffect, useState } from 'react'
import { get } from '@/lib/api'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronRight } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface StatsSummary {
  mains_analysees: number
  stats: {
    mains: number
    vpip_pct: number
    pfr_pct: number
    wwsf_pct: number
    fold_3bet_pct: number
    cbet_pct: number
    fold_cbet_pct: number
    ev_par_position: Record<string, number>
    bb_par_100: number
  }
}

interface Fuite {
  nom: string
  stat: string
  valeur: number
  plage_ideale: [number, number]
  severite: number
  description: string
  conseil: string
}

interface LeaksResponse {
  fuites: Fuite[]
}

// ── Plages normales (6-max cash) ───────────────────────────────────────────

const PLAGES: Record<string, [number, number]> = {
  vpip_pct: [20, 28],
  pfr_pct: [15, 22],
  wwsf_pct: [46, 54],
  fold_3bet_pct: [48, 68],
  cbet_pct: [52, 72],
  fold_cbet_pct: [35, 55],
}

const LABELS: Record<string, string> = {
  vpip_pct: 'VPIP',
  pfr_pct: 'PFR',
  wwsf_pct: 'WWSF',
  fold_3bet_pct: 'Fold to 3bet',
  cbet_pct: 'C-bet',
  fold_cbet_pct: 'Fold to C-bet',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function statutStat(cle: string, valeur: number): 'ok' | 'bas' | 'haut' {
  const plage = PLAGES[cle]
  if (!plage) return 'ok'
  if (valeur < plage[0]) return 'bas'
  if (valeur > plage[1]) return 'haut'
  return 'ok'
}

function classeCouleur(statut: 'ok' | 'bas' | 'haut') {
  if (statut === 'ok') return 'text-primary'
  return 'text-amber-400'
}

function classeBarreFond(statut: 'ok' | 'bas' | 'haut') {
  if (statut === 'ok') return 'bg-primary'
  return 'bg-amber-400'
}

function classeSeverite(severite: number) {
  if (severite >= 60) return 'bg-red-500/15 border-red-500/30 text-red-400'
  if (severite >= 30) return 'bg-amber-500/15 border-amber-500/30 text-amber-400'
  return 'bg-primary/10 border-primary/30 text-primary'
}

function couleurBB(bb: number) {
  if (bb > 0) return 'text-primary'
  if (bb < 0) return 'text-red-400'
  return 'text-muted-foreground'
}

const POSITION_ORDRE = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB']

// ── Composants ─────────────────────────────────────────────────────────────

function StatCard({ cle, valeur }: { cle: string; valeur: number }) {
  const statut = statutStat(cle, valeur)
  const plage = PLAGES[cle]
  const max = plage ? plage[1] * 1.3 : 100
  const largeur = Math.min(100, (valeur / max) * 100)

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{LABELS[cle]}</span>
        {statut === 'ok' ? (
          <Minus className="w-3.5 h-3.5 text-primary" />
        ) : statut === 'haut' ? (
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
        )}
      </div>

      <div className={`text-3xl font-bold tabular-nums ${classeCouleur(statut)}`}>
        {valeur.toFixed(1)}
        <span className="text-base font-normal text-muted-foreground ml-0.5">%</span>
      </div>

      <div className="space-y-1">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${classeBarreFond(statut)}`}
            style={{ width: `${largeur}%` }}
          />
        </div>
        {plage && (
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>optimal {plage[0]}–{plage[1]}%</span>
            {statut !== 'ok' && (
              <span className="text-amber-400">
                {statut === 'bas' ? `↓ ${(plage[0] - valeur).toFixed(1)}%` : `↑ ${(valeur - plage[1]).toFixed(1)}%`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LeakCard({ fuite, index }: { fuite: Fuite; index: number }) {
  const [ouvert, setOuvert] = useState(false)
  const classeContenant = classeSeverite(fuite.severite)

  return (
    <div className={`rounded-lg border p-4 ${classeContenant} transition-all`}>
      <button
        className="w-full flex items-start gap-3 text-left"
        onClick={() => setOuvert(!ouvert)}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-current/20 shrink-0 mt-0.5">
          <span className="text-xs font-bold">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-sm">{fuite.description}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs opacity-70">
            <span className="uppercase tracking-wide font-medium">{fuite.stat.replace('_', ' ')}</span>
            <span>
              {fuite.valeur}% · optimal {fuite.plage_ideale[0]}–{fuite.plage_ideale[1]}%
            </span>
            <span className="ml-auto font-semibold">sévérité {fuite.severite.toFixed(0)}%</span>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${ouvert ? 'rotate-90' : ''}`} />
      </button>

      {ouvert && (
        <div className="mt-3 pt-3 border-t border-current/20 space-y-3">
          <p className="text-sm opacity-90 leading-relaxed">{fuite.conseil}</p>
          <a
            href={`/concepts?leak=${fuite.nom}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium opacity-80 hover:opacity-100 underline underline-offset-2 transition-opacity"
          >
            Voir les concepts liés →
          </a>
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<StatsSummary | null>(null)
  const [leaks, setLeaks] = useState<LeaksResponse | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setErreur('Non connecté')
      setChargement(false)
      return
    }

    Promise.all([
      get<StatsSummary>('/stats/summary', token),
      get<LeaksResponse>('/stats/leaks', token),
    ])
      .then(([s, l]) => {
        setSummary(s)
        setLeaks(l)
      })
      .catch((e: Error) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  if (chargement) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">Chargement des stats…</div>
      </div>
    )
  }

  if (erreur) {
    return (
      <div className="p-8">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">{erreur}</p>
          {erreur === 'Non connecté' && (
            <a href="/auth/connexion" className="mt-4 inline-block text-primary hover:underline text-sm">
              Se connecter
            </a>
          )}
        </div>
      </div>
    )
  }

  if (!summary) return null

  const { stats } = summary
  const statsAffichees = [
    { cle: 'vpip_pct', valeur: stats.vpip_pct },
    { cle: 'pfr_pct', valeur: stats.pfr_pct },
    { cle: 'wwsf_pct', valeur: stats.wwsf_pct },
    { cle: 'fold_3bet_pct', valeur: stats.fold_3bet_pct },
    { cle: 'cbet_pct', valeur: stats.cbet_pct },
    { cle: 'fold_cbet_pct', valeur: stats.fold_cbet_pct },
  ]

  const positionsTriees = Object.entries(stats.ev_par_position).sort(
    ([a], [b]) => POSITION_ORDRE.indexOf(a) - POSITION_ORDRE.indexOf(b),
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {summary.mains_analysees.toLocaleString('fr-FR')} mains analysées
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg px-5 py-3 text-right">
          <div className={`text-3xl font-bold tabular-nums ${couleurBB(stats.bb_par_100)}`}>
            {stats.bb_par_100 > 0 ? '+' : ''}{stats.bb_par_100.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">bb / 100 mains</div>
        </div>
      </div>

      {/* Grille de stats */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Statistiques
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statsAffichees.map(({ cle, valeur }) => (
            <StatCard key={cle} cle={cle} valeur={valeur} />
          ))}
        </div>
      </section>

      {/* EV par position */}
      {positionsTriees.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            EV par position (bb/100)
          </h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-border">
              {positionsTriees.map(([pos, ev]) => (
                <div key={pos} className="p-4 text-center">
                  <div className="text-xs text-muted-foreground font-medium mb-1">{pos}</div>
                  <div className={`text-lg font-bold tabular-nums ${couleurBB(ev)}`}>
                    {ev > 0 ? '+' : ''}{ev.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fuites */}
      {leaks && leaks.fuites.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Principales fuites
          </h2>
          <div className="space-y-2">
            {leaks.fuites.map((fuite, i) => (
              <LeakCard key={fuite.nom} fuite={fuite} index={i} />
            ))}
          </div>
        </section>
      )}

      {leaks && leaks.fuites.length === 0 && (
        <section>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 text-center">
            <p className="text-primary font-medium">Aucune fuite détectée — profil équilibré !</p>
          </div>
        </section>
      )}
    </div>
  )
}
