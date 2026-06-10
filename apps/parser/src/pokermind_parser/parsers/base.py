from abc import ABC, abstractmethod
from ..modeles import MainNormalisee


class ParseurBase(ABC):
    @abstractmethod
    def parser(self, texte: str) -> MainNormalisee:
        """Parse un historique de main brut et retourne une MainNormalisee."""
        ...

    def detecter_hero(self, texte: str) -> str:
        """Détecte le pseudo du héros dans l'historique."""
        raise NotImplementedError
