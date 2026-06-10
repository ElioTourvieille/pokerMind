from ..modeles import MainNormalisee, SitePoker
from .pokerstars import PokerStarsParser
from .ggpoker import GGPokerParser


def parser_main(texte: str, site: str) -> MainNormalisee:
    site_enum = SitePoker(site)
    parseur = {
        SitePoker.POKERSTARS: PokerStarsParser,
        SitePoker.GGPOKER: GGPokerParser,
    }[site_enum]()
    return parseur.parser(texte)


__all__ = ["parser_main"]
