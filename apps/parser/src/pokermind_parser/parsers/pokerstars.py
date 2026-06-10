from ..modeles import MainNormalisee
from .base import ParseurBase


class PokerStarsParser(ParseurBase):
    """Parser pour les historiques PokerStars.

    Format attendu :
      PokerStars Hand #123456789: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 20:30:00 ET
      Table 'NomTable' 6-max Seat #3 is the button
      Seat 1: Joueur1 ($50 in chips)
      ...
    """

    def parser(self, texte: str) -> MainNormalisee:
        # TODO Phase 1 — implémenter le parsing complet avec regex
        raise NotImplementedError("Parser PokerStars en cours d'implémentation")
