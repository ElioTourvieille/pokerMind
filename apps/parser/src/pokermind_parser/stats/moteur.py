from dataclasses import dataclass, field
from ..modeles import MainNormalisee, TypeAction, RueMain, Action


@dataclass
class StatsMain:
    position: str
    grande_blinde: float = 0.5

    vpip: bool = False
    pfr: bool = False

    a_vu_flop: bool = False
    a_gagne: bool = False

    opportunite_fold_3bet: bool = False
    fold_3bet: bool = False

    opportunite_cbet: bool = False
    cbet: bool = False

    opportunite_face_cbet: bool = False
    fold_face_cbet: bool = False

    gain_net: float = 0.0


@dataclass
class StatsCumulees:
    mains: int = 0
    vpip_pct: float = 0.0
    pfr_pct: float = 0.0
    wwsf_pct: float = 0.0
    fold_3bet_pct: float = 0.0
    cbet_pct: float = 0.0
    fold_cbet_pct: float = 0.0
    ev_par_position: dict[str, float] = field(default_factory=dict)
    bb_par_100: float = 0.0


# ── Helpers ──────────────────────────────────────────────────────────────────

def _pf_actions(rues: list[RueMain]) -> list[Action]:
    r = next((r for r in rues if r.nom == "preflop"), None)
    return r.actions if r else []


def _flop_actions(rues: list[RueMain]) -> list[Action]:
    r = next((r for r in rues if r.nom == "flop"), None)
    return r.actions if r else []


def _dernier_relanceur(actions: list[Action]) -> str | None:
    """Dernier joueur à avoir raise/bet (= agresseur préflop)."""
    agg = None
    for a in actions:
        if a.type in (TypeAction.RAISE, TypeAction.BET, TypeAction.ALL_IN):
            agg = a.joueur
    return agg


def _contribution(main: "MainNormalisee", joueur: str) -> float:
    """Investissement net du joueur (après déduction des mises non encaissées)."""
    total = 0.0
    for rue in main.rues:
        contrib_rue = 0.0
        for a in rue.actions:
            if a.joueur != joueur or not a.montant:
                continue
            if a.type == TypeAction.POST:
                contrib_rue = a.montant
            elif a.type == TypeAction.CALL:
                contrib_rue += a.montant
            else:
                # RAISE/BET/ALL_IN : montant = total "to X" pour cette rue
                contrib_rue = max(contrib_rue, a.montant)
        total += contrib_rue
    # Déduire les mises non encaissées (Uncalled bet returned)
    total -= main.retours.get(joueur, 0.0)
    return max(0.0, total)


# ── Analyse par main ──────────────────────────────────────────────────────────

def analyser_main(main: MainNormalisee, hero_override: str | None = None) -> StatsMain | None:
    hero = hero_override or main.hero
    if not hero:
        return None

    joueur = next((j for j in main.joueurs if j.nom == hero), None)
    if not joueur:
        return None

    stats = StatsMain(
        position=joueur.position.value,
        grande_blinde=main.stakes.grande_blinde,
    )

    pf = _pf_actions(main.rues)
    fl = _flop_actions(main.rues)

    # ── VPIP / PFR ────────────────────────────────────────────────────────────
    for a in pf:
        if a.joueur != hero:
            continue
        if a.type == TypeAction.POST:
            continue
        if a.type in (TypeAction.CALL, TypeAction.RAISE, TypeAction.BET, TypeAction.ALL_IN):
            stats.vpip = True
            stats.pfr = a.type in (TypeAction.RAISE, TypeAction.BET, TypeAction.ALL_IN)
            break
        if a.type == TypeAction.FOLD:
            break

    # Cas : hero a call puis re-raise dans la même rue préflop
    if not stats.pfr:
        for a in pf:
            if a.joueur == hero and a.type in (TypeAction.RAISE, TypeAction.BET, TypeAction.ALL_IN):
                stats.pfr = True
                stats.vpip = True
                break

    # ── Agresseur préflop (last raiser) ──────────────────────────────────────
    agg_pf = _dernier_relanceur(pf)

    # ── Fold to 3bet ─────────────────────────────────────────────────────────
    raises_pf = [a for a in pf if a.type in (TypeAction.RAISE, TypeAction.BET, TypeAction.ALL_IN)]
    if len(raises_pf) >= 2 and raises_pf[0].joueur == hero and raises_pf[1].joueur != hero:
        stats.opportunite_fold_3bet = True
        idx_3bet = pf.index(raises_pf[1])
        for a in pf[idx_3bet + 1:]:
            if a.joueur == hero:
                stats.fold_3bet = a.type == TypeAction.FOLD
                break

    # ── WWSF ─────────────────────────────────────────────────────────────────
    stats.a_vu_flop = bool(fl and any(a.joueur == hero for a in fl))
    if stats.a_vu_flop:
        stats.a_gagne = any(g.joueur == hero for g in main.gagnants)

    # ── C-bet ────────────────────────────────────────────────────────────────
    if agg_pf == hero and stats.a_vu_flop:
        stats.opportunite_cbet = True
        premiere = next((a for a in fl if a.joueur == hero), None)
        if premiere:
            stats.cbet = premiere.type in (TypeAction.BET, TypeAction.RAISE, TypeAction.ALL_IN)

    # ── Face C-bet ───────────────────────────────────────────────────────────
    if agg_pf != hero and stats.a_vu_flop and fl:
        bet_vu = False
        for a in fl:
            if bet_vu and a.joueur == hero:
                stats.opportunite_face_cbet = True
                stats.fold_face_cbet = a.type == TypeAction.FOLD
                break
            if a.joueur != hero and a.type in (TypeAction.BET, TypeAction.RAISE, TypeAction.ALL_IN):
                bet_vu = True

    # ── Gain net ─────────────────────────────────────────────────────────────
    collecte = sum(g.montant for g in main.gagnants if g.joueur == hero)
    investi = _contribution(main, hero)
    stats.gain_net = collecte - investi

    return stats


# ── Agrégation ────────────────────────────────────────────────────────────────

def calculer_stats(mains: list[MainNormalisee], hero_override: str | None = None) -> StatsCumulees:
    valides = [s for m in mains if (s := analyser_main(m, hero_override)) is not None]

    if not valides:
        return StatsCumulees()

    n = len(valides)

    def taux(opportunites: list[bool], resultats: list[bool]) -> float:
        paires = [(r) for o, r in zip(opportunites, resultats) if o]
        return round(sum(paires) / len(paires) * 100, 1) if paires else 0.0

    # EV par position (BB/100 mains)
    gain_par_pos: dict[str, list[float]] = {}
    for s in valides:
        bb = s.grande_blinde or 0.5
        gain_par_pos.setdefault(s.position, []).append(s.gain_net / bb)

    ev_par_position = {
        pos: round(sum(g) / len(g) * 100, 1)
        for pos, g in gain_par_pos.items()
    }

    total_bb = sum(s.gain_net / (s.grande_blinde or 0.5) for s in valides)

    return StatsCumulees(
        mains=n,
        vpip_pct=round(sum(s.vpip for s in valides) / n * 100, 1),
        pfr_pct=round(sum(s.pfr for s in valides) / n * 100, 1),
        wwsf_pct=taux([s.a_vu_flop for s in valides], [s.a_gagne for s in valides]),
        fold_3bet_pct=taux([s.opportunite_fold_3bet for s in valides], [s.fold_3bet for s in valides]),
        cbet_pct=taux([s.opportunite_cbet for s in valides], [s.cbet for s in valides]),
        fold_cbet_pct=taux([s.opportunite_face_cbet for s in valides], [s.fold_face_cbet for s in valides]),
        ev_par_position=ev_par_position,
        bb_par_100=round(total_bb / n * 100, 2),
    )
