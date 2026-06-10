from ..modeles import MainNormalisee
from .base import ParseurBase


class GGPokerParser(ParseurBase):
    """Parser pour les historiques GGPoker.

    Format attendu :
      Poker Hand #HD123456789: Hold'em No Limit ($0.25/$0.50) - 2024/01/15 20:30:00
      Table 'NomTable' 6-Max (Real Money)
      Seat 1: Joueur1 ($50.00 in chips)
      ...
    """

    def parser(self, texte: str) -> MainNormalisee:
        # TODO Phase 1 — implémenter le parsing complet avec regex
        raise NotImplementedError("Parser GGPoker en cours d'implémentation")
