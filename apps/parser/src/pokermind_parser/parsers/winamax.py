import re
from datetime import datetime
from ..modeles import (
    MainNormalisee, SitePoker, TypeJeu, TypeAction, Position,
    Action, Joueur, RueMain, Stakes, Pot, Gagnant,
)
from .base import ParseurBase, assigner_positions


class WinamaxParser(ParseurBase):
    RE_HEADER = re.compile(
        r"Winamax Poker - CashGame - HandId: #(\S+) - "
        r"Holdem no limit \(([0-9.]+)€/([0-9.]+)€\) - "
        r"(\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2})"
    )
    RE_TABLE = re.compile(r"Table: '(.+?)' (\d+)-max.*?Seat #(\d+) is the button")
    RE_SEAT = re.compile(r"Seat (\d+): (.+?) \(([0-9.]+)€")
    RE_DEALT = re.compile(r"Dealt to (.+?) \[(.+?)\]")
    RE_POSTS_SB = re.compile(r"^(.+?) posts small blind ([0-9.]+)€")
    RE_POSTS_BB = re.compile(r"^(.+?) posts big blind ([0-9.]+)€")
    RE_ACT_ALLIN = re.compile(r"^(.+?): (raises?|bets?|calls?) .*?and is all-in")
    RE_ACT_RAISE = re.compile(r"^(.+?): raises? [0-9.]+€ to ([0-9.]+)€")
    RE_ACT_BET = re.compile(r"^(.+?): bets? ([0-9.]+)€")
    RE_ACT_CALL = re.compile(r"^(.+?): calls? ([0-9.]+)€")
    RE_ACT_CHECK = re.compile(r"^(.+?): checks?")
    RE_ACT_FOLD = re.compile(r"^(.+?): folds?")
    RE_SHOWS = re.compile(r"^(.+?): shows \[(.+?)\]")
    RE_BOARD_FLOP = re.compile(r"\*\*\* FLOP \*\*\* \[(.+?)\]")
    RE_BOARD_TURN = re.compile(r"\*\*\* TURN \*\*\* \[.+?\] \[(.+?)\]")
    RE_BOARD_RIVER = re.compile(r"\*\*\* RIVER \*\*\* \[.+?\] \[(.+?)\]")
    RE_POT = re.compile(r"Total pot ([0-9.]+)€")
    RE_RAKE = re.compile(r"Rake ([0-9.]+)€")
    RE_SUM_WON = re.compile(r"Seat \d+: (.+?) .* won ([0-9.]+)€")
    RE_SUM_SHOWED_WON = re.compile(r"Seat \d+: (.+?) .*showed \[.+?\] and won ([0-9.]+)€")

    def parser(self, texte: str) -> MainNormalisee:
        lignes = [l.rstrip() for l in texte.strip().split("\n")]
        return self._parser_lignes(lignes)

    def _parser_lignes(self, lignes: list[str]) -> MainNormalisee:
        m = self.RE_HEADER.match(lignes[0])
        if not m:
            raise ValueError(f"En-tête Winamax non reconnu : {lignes[0][:100]}")
        id_main = m.group(1)
        petite_blinde = float(m.group(2))
        grande_blinde = float(m.group(3))
        jouee_le = datetime.strptime(m.group(4), "%Y/%m/%d %H:%M:%S")

        m_table = self.RE_TABLE.match(lignes[1])
        if not m_table:
            raise ValueError(f"Ligne table Winamax non reconnue : {lignes[1][:100]}")
        nom_table = m_table.group(1)
        siege_bouton = int(m_table.group(3))

        joueurs_bruts: dict[int, tuple[str, float]] = {}
        i = 2
        while i < len(lignes):
            ms = self.RE_SEAT.match(lignes[i])
            if not ms:
                break
            joueurs_bruts[int(ms.group(1))] = (ms.group(2).strip(), float(ms.group(3)))
            i += 1

        sieges = sorted(joueurs_bruts.keys())
        positions = assigner_positions(sieges, siege_bouton)
        joueurs: dict[str, Joueur] = {
            nom: Joueur(nom=nom, siege=s, stack=stack, position=positions.get(s, Position.BB))
            for s, (nom, stack) in joueurs_bruts.items()
        }

        hero = ""
        cartes_joueurs: dict[str, list[str]] = {}
        rues: list[RueMain] = []
        board_global: list[str] = []
        gagnants: list[Gagnant] = []
        pot_total = 0.0
        rake = 0.0

        section = "setup"
        rue_courante = "preflop"
        actions_courantes: list[Action] = []
        board_courant: list[str] = []

        while i < len(lignes):
            ligne = lignes[i].strip()
            i += 1
            if not ligne:
                continue

            if ligne == "*** ANTE/BLINDS ***":
                section = "blinds"
                continue
            if ligne == "*** PRE-FLOP ***":
                section = "preflop"
                continue
            if m_flop := self.RE_BOARD_FLOP.match(ligne):
                rues.append(RueMain(nom="preflop", board=[], actions=actions_courantes))
                cartes_flop = m_flop.group(1).split()
                board_global.extend(cartes_flop)
                rue_courante, actions_courantes, board_courant = "flop", [], cartes_flop
                section = "flop"
                continue
            if m_turn := self.RE_BOARD_TURN.match(ligne):
                rues.append(RueMain(nom="flop", board=board_courant, actions=actions_courantes))
                carte = m_turn.group(1).split()
                board_global.extend(carte)
                rue_courante, actions_courantes, board_courant = "turn", [], carte
                section = "turn"
                continue
            if m_river := self.RE_BOARD_RIVER.match(ligne):
                rues.append(RueMain(nom="turn", board=board_courant, actions=actions_courantes))
                carte = m_river.group(1).split()
                board_global.extend(carte)
                rue_courante, actions_courantes, board_courant = "river", [], carte
                section = "river"
                continue
            if ligne == "*** SHOW DOWN ***":
                if actions_courantes:
                    rues.append(RueMain(nom=rue_courante, board=board_courant, actions=actions_courantes))
                    actions_courantes = []
                section = "showdown"
                continue
            if ligne == "*** SUMMARY ***":
                if actions_courantes:
                    rues.append(RueMain(nom=rue_courante, board=board_courant, actions=actions_courantes))
                    actions_courantes = []
                section = "summary"
                continue

            if section == "summary":
                if mp := self.RE_POT.search(ligne):
                    pot_total = float(mp.group(1))
                if mr := self.RE_RAKE.search(ligne):
                    rake = float(mr.group(1))
                m_won = self.RE_SUM_SHOWED_WON.match(ligne) or self.RE_SUM_WON.match(ligne)
                if m_won:
                    gagnants.append(Gagnant(joueur=m_won.group(1).strip(), montant=float(m_won.group(2))))
                continue

            if section == "showdown":
                if ms := self.RE_SHOWS.match(ligne):
                    cartes_joueurs[ms.group(1).strip()] = ms.group(2).split()
                continue

            if section == "blinds":
                if md := self.RE_DEALT.match(ligne):
                    hero = md.group(1).strip()
                    cartes_joueurs[hero] = md.group(2).split()
                    continue
                if ms := self.RE_POSTS_SB.match(ligne):
                    actions_courantes.append(Action(joueur=ms.group(1).strip(), type=TypeAction.POST, montant=float(ms.group(2))))
                    continue
                if mb := self.RE_POSTS_BB.match(ligne):
                    actions_courantes.append(Action(joueur=mb.group(1).strip(), type=TypeAction.POST, montant=float(mb.group(2))))
                    continue

            if section in ("preflop", "flop", "turn", "river"):
                action = self._parser_action(ligne)
                if action:
                    actions_courantes.append(action)

        if actions_courantes:
            rues.append(RueMain(nom=rue_courante, board=board_courant, actions=actions_courantes))

        for nom, cartes in cartes_joueurs.items():
            if nom in joueurs:
                joueurs[nom] = joueurs[nom].model_copy(update={"cartes": cartes})

        return MainNormalisee(
            site=SitePoker.WINAMAX,
            id_main=id_main,
            jouee_le=jouee_le,
            stakes=Stakes(petite_blinde=petite_blinde, grande_blinde=grande_blinde),
            type_jeu=TypeJeu.CASH,
            nom_table=nom_table,
            joueurs=list(joueurs.values()),
            hero=hero or next(iter(joueurs), ""),
            rues=rues,
            board=board_global,
            pot=Pot(total=pot_total, rake=rake),
            gagnants=gagnants,
        )

    def _parser_action(self, ligne: str) -> Action | None:
        if self.RE_ACT_ALLIN.match(ligne):
            m_montant = re.search(r"([0-9.]+)€", ligne)
            nom = ligne.split(":")[0].strip()
            return Action(joueur=nom, type=TypeAction.ALL_IN, montant=float(m_montant.group(1)) if m_montant else None)
        if m := self.RE_ACT_RAISE.match(ligne):
            return Action(joueur=m.group(1).strip(), type=TypeAction.RAISE, montant=float(m.group(2)))
        if m := self.RE_ACT_BET.match(ligne):
            return Action(joueur=m.group(1).strip(), type=TypeAction.BET, montant=float(m.group(2)))
        if m := self.RE_ACT_CALL.match(ligne):
            return Action(joueur=m.group(1).strip(), type=TypeAction.CALL, montant=float(m.group(2)))
        if m := self.RE_ACT_CHECK.match(ligne):
            return Action(joueur=m.group(1).strip(), type=TypeAction.CHECK)
        if m := self.RE_ACT_FOLD.match(ligne):
            return Action(joueur=m.group(1).strip(), type=TypeAction.FOLD)
        return None
