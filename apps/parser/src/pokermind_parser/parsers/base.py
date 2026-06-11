from abc import ABC, abstractmethod
from ..modeles import MainNormalisee, Position

POSITIONS_PAR_TAILLE: dict[int, list[str]] = {
    2: ["BTN", "BB"],
    3: ["BTN", "SB", "BB"],
    4: ["BTN", "SB", "BB", "UTG"],
    5: ["BTN", "SB", "BB", "UTG", "CO"],
    6: ["BTN", "SB", "BB", "UTG", "HJ", "CO"],
    7: ["BTN", "SB", "BB", "UTG", "MP", "HJ", "CO"],
    8: ["BTN", "SB", "BB", "UTG", "UTG+1", "MP", "HJ", "CO"],
    9: ["BTN", "SB", "BB", "UTG", "UTG+1", "MP", "MP+1", "HJ", "CO"],
}


def assigner_positions(sieges: list[int], siege_bouton: int) -> dict[int, Position]:
    """Assigne les positions poker selon le siège du bouton, dans le sens des aiguilles."""
    n = len(sieges)
    if siege_bouton not in sieges:
        siege_bouton = sieges[-1]

    idx_btn = sieges.index(siege_bouton)
    ordre = sieges[idx_btn:] + sieges[:idx_btn]

    pos_str = POSITIONS_PAR_TAILLE.get(n) or POSITIONS_PAR_TAILLE[min(n, 9)]
    return {
        siege: Position(pos_str[min(i, len(pos_str) - 1)])
        for i, siege in enumerate(ordre)
    }


class ParseurBase(ABC):
    @abstractmethod
    def parser(self, texte: str) -> MainNormalisee:
        """Parse un historique de main brut et retourne une MainNormalisee."""
        ...
