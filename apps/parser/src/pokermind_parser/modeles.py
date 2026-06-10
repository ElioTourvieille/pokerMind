from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel


class SitePoker(str, Enum):
    POKERSTARS = "pokerstars"
    GGPOKER = "ggpoker"


class TypeJeu(str, Enum):
    CASH = "cash"
    TOURNOI = "tournoi"


class TypeAction(str, Enum):
    FOLD = "fold"
    CHECK = "check"
    CALL = "call"
    BET = "bet"
    RAISE = "raise"
    ALL_IN = "all-in"
    POST = "post"
    POST_ANTE = "post-ante"


class Position(str, Enum):
    BTN = "BTN"
    SB = "SB"
    BB = "BB"
    UTG = "UTG"
    UTG1 = "UTG+1"
    MP = "MP"
    MP1 = "MP+1"
    LJ = "LJ"
    HJ = "HJ"
    CO = "CO"


class Action(BaseModel):
    joueur: str
    type: TypeAction
    montant: Optional[float] = None


class Joueur(BaseModel):
    nom: str
    siege: int
    stack: float
    cartes: Optional[list[str]] = None
    position: Position


class RueMain(BaseModel):
    nom: str
    board: list[str]
    actions: list[Action]


class Stakes(BaseModel):
    petite_blinde: float
    grande_blinde: float


class Pot(BaseModel):
    total: float
    rake: float


class Gagnant(BaseModel):
    joueur: str
    montant: float


class MainNormalisee(BaseModel):
    site: SitePoker
    id_main: str
    jouee_le: datetime
    stakes: Stakes
    type_jeu: TypeJeu
    nom_table: str
    joueurs: list[Joueur]
    hero: str
    rues: list[RueMain]
    board: list[str]
    pot: Pot
    gagnants: list[Gagnant]
