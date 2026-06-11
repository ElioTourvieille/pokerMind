"""Tests du parser PokerStars — couvre les cas métier critiques."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import pytest
from pokermind_parser.parsers.pokerstars import PokerStarsParser
from pokermind_parser.modeles import TypeAction, Position
from .fixtures.pokerstars_mains import (
    MAIN_CBET_GAGNE,
    MAIN_3BET_FOLD,
    MAIN_FOLD_PREFLOP,
    MAIN_SHOWDOWN_PERDU,
    MAIN_FACE_CBET_FOLD,
    MAIN_FACE_CBET_CALL,
    FICHIER_MULTI_MAINS,
)


@pytest.fixture
def parser():
    return PokerStarsParser()


class TestEnTete:
    def test_id_main(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        assert main.id_main == "234567890"

    def test_stakes(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        assert main.stakes.petite_blinde == 0.25
        assert main.stakes.grande_blinde == 0.50

    def test_nom_table(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        assert main.nom_table == "Andromeda V"

    def test_site(self, parser):
        from pokermind_parser.modeles import SitePoker
        main = parser.parser(MAIN_CBET_GAGNE)
        assert main.site == SitePoker.POKERSTARS


class TestJoueursEtPositions:
    def test_nombre_joueurs(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        assert len(main.joueurs) == 6

    def test_hero_detecte(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        assert main.hero == "BTN_Hero"

    def test_position_btn(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        hero = next(j for j in main.joueurs if j.nom == "BTN_Hero")
        assert hero.position == Position.BTN

    def test_position_sb(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        sb = next(j for j in main.joueurs if j.nom == "SB_Joueur")
        assert sb.position == Position.SB

    def test_position_bb(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        bb = next(j for j in main.joueurs if j.nom == "BB_Joueur")
        assert bb.position == Position.BB

    def test_stacks(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        hero = next(j for j in main.joueurs if j.nom == "BTN_Hero")
        assert hero.stack == 50.0

    def test_cartes_hero(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        hero = next(j for j in main.joueurs if j.nom == "BTN_Hero")
        assert hero.cartes == ["As", "Kh"]


class TestActionsPreflop:
    def test_posts_blinds(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        pf = next(r for r in main.rues if r.nom == "preflop")
        posts = [a for a in pf.actions if a.type == TypeAction.POST]
        assert len(posts) == 2

    def test_raise_hero(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        pf = next(r for r in main.rues if r.nom == "preflop")
        raise_hero = next(
            a for a in pf.actions
            if a.joueur == "BTN_Hero" and a.type == TypeAction.RAISE
        )
        assert raise_hero.montant == 1.50

    def test_fold_preflop(self, parser):
        main = parser.parser(MAIN_FOLD_PREFLOP)
        pf = next(r for r in main.rues if r.nom == "preflop")
        fold_hero = next(a for a in pf.actions if a.joueur == "UTG_Hero")
        assert fold_hero.type == TypeAction.FOLD

    def test_3bet_detecte(self, parser):
        main = parser.parser(MAIN_3BET_FOLD)
        pf = next(r for r in main.rues if r.nom == "preflop")
        raises = [a for a in pf.actions if a.type == TypeAction.RAISE]
        assert len(raises) == 2

    def test_fold_face_3bet(self, parser):
        main = parser.parser(MAIN_3BET_FOLD)
        pf = next(r for r in main.rues if r.nom == "preflop")
        # UTG_Hero doit fold après le 3bet de SB_Joueur
        actions_hero = [a for a in pf.actions if a.joueur == "UTG_Hero"]
        assert actions_hero[-1].type == TypeAction.FOLD


class TestActionsPostflop:
    def test_flop_board(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        flop = next(r for r in main.rues if r.nom == "flop")
        assert set(flop.board) == {"Kd", "7s", "2c"}

    def test_cbet_hero(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        flop = next(r for r in main.rues if r.nom == "flop")
        bet_hero = next(a for a in flop.actions if a.joueur == "BTN_Hero")
        assert bet_hero.type == TypeAction.BET
        assert bet_hero.montant == 2.00

    def test_fold_face_cbet(self, parser):
        main = parser.parser(MAIN_FACE_CBET_FOLD)
        flop = next(r for r in main.rues if r.nom == "flop")
        actions_hero = [a for a in flop.actions if a.joueur == "BB_Hero"]
        assert any(a.type == TypeAction.FOLD for a in actions_hero)

    def test_turn_board(self, parser):
        main = parser.parser(MAIN_FACE_CBET_CALL)
        turn = next((r for r in main.rues if r.nom == "turn"), None)
        assert turn is not None
        assert "9d" in turn.board


class TestPotEtResultat:
    def test_gagnant(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        assert any(g.joueur == "BTN_Hero" for g in main.gagnants)

    def test_montant_gagne(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        gain = next(g for g in main.gagnants if g.joueur == "BTN_Hero")
        assert gain.montant == 3.25

    def test_pot_total(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        assert main.pot.total == 3.50

    def test_rake(self, parser):
        main = parser.parser(MAIN_CBET_GAGNE)
        assert main.pot.rake == 0.25
