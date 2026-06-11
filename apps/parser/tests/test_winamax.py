"""Tests du parser Winamax."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import pytest
from pokermind_parser.parsers.winamax import WinamaxParser
from pokermind_parser.modeles import SitePoker, Position, TypeAction
from .fixtures.winamax_mains import MAIN_SIMPLE_WM, MAIN_3BET_WM


@pytest.fixture
def parser():
    return WinamaxParser()


class TestParserWinamax:
    def test_site(self, parser):
        main = parser.parser(MAIN_SIMPLE_WM)
        assert main.site == SitePoker.WINAMAX

    def test_stakes(self, parser):
        main = parser.parser(MAIN_SIMPLE_WM)
        assert main.stakes.petite_blinde == 0.25
        assert main.stakes.grande_blinde == 0.50

    def test_hero(self, parser):
        main = parser.parser(MAIN_SIMPLE_WM)
        assert main.hero == "BTN_Hero"

    def test_cartes_hero(self, parser):
        main = parser.parser(MAIN_SIMPLE_WM)
        hero = next(j for j in main.joueurs if j.nom == "BTN_Hero")
        assert hero.cartes == ["Ah", "Kd"]

    def test_position_btn(self, parser):
        main = parser.parser(MAIN_SIMPLE_WM)
        hero = next(j for j in main.joueurs if j.nom == "BTN_Hero")
        assert hero.position == Position.BTN

    def test_raise_preflop(self, parser):
        main = parser.parser(MAIN_SIMPLE_WM)
        pf = next(r for r in main.rues if r.nom == "preflop")
        raise_hero = next(a for a in pf.actions if a.joueur == "BTN_Hero")
        assert raise_hero.type == TypeAction.RAISE
        assert raise_hero.montant == 1.50

    def test_cbet_flop(self, parser):
        main = parser.parser(MAIN_SIMPLE_WM)
        flop = next(r for r in main.rues if r.nom == "flop")
        bet = next(a for a in flop.actions if a.joueur == "BTN_Hero")
        assert bet.type == TypeAction.BET

    def test_4bet(self, parser):
        main = parser.parser(MAIN_3BET_WM)
        pf = next(r for r in main.rues if r.nom == "preflop")
        raises = [a for a in pf.actions if a.type == TypeAction.RAISE]
        # open + 3bet + 4bet = 3 raises
        assert len(raises) == 3
