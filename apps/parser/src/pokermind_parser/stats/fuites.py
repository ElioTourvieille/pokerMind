from dataclasses import dataclass
from .moteur import StatsCumulees

# Plages idéales pour le 6-max cash game
BASELINES: dict[str, tuple[float, float]] = {
    "vpip":      (20.0, 28.0),
    "pfr":       (15.0, 22.0),
    "wwsf":      (46.0, 54.0),
    "fold_3bet": (48.0, 68.0),
    "cbet":      (52.0, 72.0),
    "fold_cbet": (35.0, 55.0),
}

DESCRIPTIONS: dict[str, tuple[str, str]] = {
    "vpip_bas": (
        "VPIP trop bas — jeu trop serré préflop",
        "Tu te couches trop souvent préflop. Élargis ta plage de raise depuis CO/BTN et ajoute des suited connectors en late position.",
    ),
    "vpip_haut": (
        "VPIP trop élevé — jeu trop loose préflop",
        "Tu entres dans trop de pots avec des mains faibles. Resserre ta plage depuis UTG/MP et évite les suited one-gappers faibles.",
    ),
    "pfr_bas": (
        "PFR trop bas — trop de calls, pas assez de relances",
        "Tu calls trop souvent au lieu de relancer. Convertis tes calls UTG/MP en raises 2.5bb avec tes bonnes mains.",
    ),
    "pfr_haut": (
        "PFR trop élevé — too many bluff raises",
        "Trop de relances avec des mains marginales. Resserre tes bluff-raises depuis les positions early.",
    ),
    "wwsf_bas": (
        "WWSF trop bas — tu abandonnes trop de pots au postflop",
        "Tu jettes trop de mains sur les streets postflop. Travaille ton barrel sizing et identifie tes spots de float turn/river.",
    ),
    "wwsf_haut": (
        "WWSF trop élevé — possible overbluff postflop",
        "Vérifie si tu vas trop loin avec des mains faibles. Ton taux de showdown doit rester cohérent.",
    ),
    "fold_3bet_haut": (
        "Fold to 3bet trop élevé — tu overcouches face aux 3bets",
        "Tu surrendres trop face aux 3bets. Commence par 4bet bluff AQs/AJs depuis BTN et défends KQs/JJ en position.",
    ),
    "fold_3bet_bas": (
        "Fold to 3bet trop bas — tu défends trop face aux 3bets",
        "Tu calls/4bets trop face aux 3bets. Resserre ta plage de continuation, surtout hors position.",
    ),
    "cbet_bas": (
        "C-bet trop faible — tu n'exploites pas ton avantage préflop",
        "Vise 55-65% de C-bet sur les boards secs favorables à ta range. Ne laisse pas tes adversaires voir le turn gratis.",
    ),
    "cbet_haut": (
        "C-bet trop élevé — trop prévisible au flop",
        "Tu bet trop systématiquement au flop. Ajoute des check-ranges pour équilibrer et piéger les flotteurs.",
    ),
    "fold_cbet_haut": (
        "Fold to C-bet trop élevé — tu donnes trop facilement le pot",
        "Tu overcouches face aux mises au flop. Construis une stratégie de floating et de check-raise sur boards humides.",
    ),
    "fold_cbet_bas": (
        "Fold to C-bet trop bas — tu défends trop sans équité",
        "Attention à défendre avec trop de mains faibles face à un C-bet. Sois plus sélectif sur les boards qui touchent la range adverse.",
    ),
}


@dataclass
class Fuite:
    nom: str
    stat: str
    valeur: float
    plage_ideale: tuple[float, float]
    severite: float
    description: str
    conseil: str


def detecter_fuites(stats: StatsCumulees, max_fuites: int = 3) -> list[Fuite]:
    """Détecte et classe les principales fuites par sévérité."""
    champs = [
        ("vpip", stats.vpip_pct),
        ("pfr", stats.pfr_pct),
        ("wwsf", stats.wwsf_pct),
        ("fold_3bet", stats.fold_3bet_pct),
        ("cbet", stats.cbet_pct),
        ("fold_cbet", stats.fold_cbet_pct),
    ]

    fuites: list[Fuite] = []
    for cle, valeur in champs:
        if cle not in BASELINES:
            continue
        min_i, max_i = BASELINES[cle]
        if valeur < min_i:
            ecart, direction = min_i - valeur, "bas"
        elif valeur > max_i:
            ecart, direction = valeur - max_i, "haut"
        else:
            continue

        cle_desc = f"{cle}_{direction}"
        if cle_desc not in DESCRIPTIONS:
            continue

        plage = max_i - min_i
        severite = round(min(100.0, ecart / max(plage, 1.0) * 100), 1)
        desc, conseil = DESCRIPTIONS[cle_desc]

        fuites.append(Fuite(
            nom=cle_desc,
            stat=cle,
            valeur=round(valeur, 1),
            plage_ideale=(min_i, max_i),
            severite=severite,
            description=desc,
            conseil=conseil,
        ))

    fuites.sort(key=lambda f: f.severite, reverse=True)
    return fuites[:max_fuites]
