import re
from ..modeles import MainNormalisee, SitePoker
from .pokerstars import PokerStarsParser
from .ggpoker import GGPokerParser
from .winamax import WinamaxParser

PARSEURS = {
    SitePoker.POKERSTARS: PokerStarsParser,
    SitePoker.GGPOKER: GGPokerParser,
    SitePoker.WINAMAX: WinamaxParser,
}

SEPARATEURS = {
    SitePoker.POKERSTARS: r"\n(?=PokerStars Hand #)",
    SitePoker.GGPOKER: r"\n(?=Poker Hand #)",
    SitePoker.WINAMAX: r"\n(?=Winamax Poker)",
}


def parser_main(texte: str, site: str) -> MainNormalisee:
    return PARSEURS[SitePoker(site)]().parser(texte)


def parser_fichier(texte: str, site: str) -> list[MainNormalisee]:
    """Parse un fichier contenant N mains et retourne la liste des MainNormalisee valides."""
    site_enum = SitePoker(site)
    pattern = SEPARATEURS.get(site_enum, r"\n\n")
    mains_brutes = re.split(pattern, texte.strip())
    parseur = PARSEURS[site_enum]()
    resultats: list[MainNormalisee] = []
    for brute in mains_brutes:
        if brute.strip():
            try:
                resultats.append(parseur.parser(brute.strip()))
            except Exception:
                pass
    return resultats


__all__ = ["parser_main", "parser_fichier"]
