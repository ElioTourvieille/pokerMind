"""Tests du moteur de stats et détection de fuites."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import pytest
from pokermind_parser.parsers.pokerstars import PokerStarsParser
from pokermind_parser.stats.moteur import analyser_main, calculer_stats
from pokermind_parser.stats.fuites import detecter_fuites, StatsCumulees
from .fixtures.pokerstars_mains import (
    MAIN_CBET_GAGNE,
    MAIN_3BET_FOLD,
    MAIN_FOLD_PREFLOP,
    MAIN_SHOWDOWN_PERDU,
    MAIN_FACE_CBET_FOLD,
    MAIN_FACE_CBET_CALL,
    TOUTES_LES_MAINS,
)


@pytest.fixture
def parser():
    return PokerStarsParser()


@pytest.fixture
def mains_parsees(parser):
    return [parser.parser(m) for m in TOUTES_LES_MAINS]


class TestVPIPetPFR:
    def test_vpip_true_quand_raise(self, parser):
        s = analyser_main(parser.parser(MAIN_CBET_GAGNE))
        assert s.vpip is True

    def test_pfr_true_quand_raise(self, parser):
        s = analyser_main(parser.parser(MAIN_CBET_GAGNE))
        assert s.pfr is True

    def test_vpip_false_quand_fold_preflop(self, parser):
        s = analyser_main(parser.parser(MAIN_FOLD_PREFLOP))
        assert s.vpip is False

    def test_pfr_false_quand_fold_preflop(self, parser):
        s = analyser_main(parser.parser(MAIN_FOLD_PREFLOP))
        assert s.pfr is False

    def test_vpip_true_quand_call_bb(self, parser):
        # MAIN_FACE_CBET_FOLD : hero BB call la relance BTN
        s = analyser_main(parser.parser(MAIN_FACE_CBET_FOLD))
        assert s.vpip is True

    def test_pfr_false_quand_seulement_call(self, parser):
        s = analyser_main(parser.parser(MAIN_FACE_CBET_FOLD))
        assert s.pfr is False


class TestFoldTo3bet:
    def test_opportunite_fold_3bet(self, parser):
        s = analyser_main(parser.parser(MAIN_3BET_FOLD))
        assert s.opportunite_fold_3bet is True

    def test_fold_3bet_true(self, parser):
        s = analyser_main(parser.parser(MAIN_3BET_FOLD))
        assert s.fold_3bet is True

    def test_pas_opportunite_fold_3bet_quand_pas_ouvert(self, parser):
        s = analyser_main(parser.parser(MAIN_FOLD_PREFLOP))
        assert s.opportunite_fold_3bet is False


class TestCbet:
    def test_opportunite_cbet(self, parser):
        s = analyser_main(parser.parser(MAIN_CBET_GAGNE))
        assert s.opportunite_cbet is True

    def test_cbet_true(self, parser):
        s = analyser_main(parser.parser(MAIN_CBET_GAGNE))
        assert s.cbet is True

    def test_pas_opportunite_cbet_quand_pas_agresseur_pf(self, parser):
        s = analyser_main(parser.parser(MAIN_FACE_CBET_FOLD))
        assert s.opportunite_cbet is False


class TestFaceCbet:
    def test_opportunite_face_cbet(self, parser):
        s = analyser_main(parser.parser(MAIN_FACE_CBET_FOLD))
        assert s.opportunite_face_cbet is True

    def test_fold_face_cbet(self, parser):
        s = analyser_main(parser.parser(MAIN_FACE_CBET_FOLD))
        assert s.fold_face_cbet is True

    def test_call_face_cbet(self, parser):
        s = analyser_main(parser.parser(MAIN_FACE_CBET_CALL))
        assert s.opportunite_face_cbet is True
        assert s.fold_face_cbet is False


class TestWWSF:
    def test_a_vu_flop(self, parser):
        s = analyser_main(parser.parser(MAIN_CBET_GAGNE))
        assert s.a_vu_flop is True

    def test_wwsf_true_quand_gagne(self, parser):
        s = analyser_main(parser.parser(MAIN_CBET_GAGNE))
        assert s.a_gagne is True

    def test_wwsf_false_quand_perdu(self, parser):
        s = analyser_main(parser.parser(MAIN_SHOWDOWN_PERDU))
        assert s.a_gagne is False

    def test_pas_vu_flop_quand_fold_preflop(self, parser):
        s = analyser_main(parser.parser(MAIN_FOLD_PREFLOP))
        assert s.a_vu_flop is False


class TestGainNet:
    def test_gain_positif_quand_gagne(self, parser):
        s = analyser_main(parser.parser(MAIN_CBET_GAGNE))
        assert s.gain_net > 0

    def test_gain_negatif_quand_perdu(self, parser):
        s = analyser_main(parser.parser(MAIN_SHOWDOWN_PERDU))
        assert s.gain_net < 0


class TestStatsCumulees:
    def test_nombre_mains(self, mains_parsees):
        stats = calculer_stats(mains_parsees)
        # Seules les mains avec hero count
        assert stats.mains == 6

    def test_vpip_coherent(self, mains_parsees):
        stats = calculer_stats(mains_parsees)
        # Mains VPIP: CBET_GAGNE, 3BET_FOLD, FACE_CBET_FOLD, FACE_CBET_CALL, SHOWDOWN_PERDU = 5/6
        assert 0 < stats.vpip_pct <= 100

    def test_pfr_inferieur_ou_egal_vpip(self, mains_parsees):
        stats = calculer_stats(mains_parsees)
        assert stats.pfr_pct <= stats.vpip_pct

    def test_ev_par_position_renseigne(self, mains_parsees):
        stats = calculer_stats(mains_parsees)
        assert len(stats.ev_par_position) > 0


class TestDetectionFuites:
    def test_retourne_au_plus_3_fuites(self):
        stats = StatsCumulees(
            mains=100,
            vpip_pct=35.0,  # trop haut
            pfr_pct=8.0,    # trop bas
            wwsf_pct=30.0,  # trop bas
            fold_3bet_pct=80.0,  # trop haut
            cbet_pct=40.0,  # trop bas
            fold_cbet_pct=70.0,  # trop haut
        )
        fuites = detecter_fuites(stats, max_fuites=3)
        assert len(fuites) <= 3

    def test_fuites_triees_par_severite(self):
        stats = StatsCumulees(
            mains=100,
            vpip_pct=40.0,
            pfr_pct=5.0,
            wwsf_pct=25.0,
            fold_3bet_pct=50.0,
            cbet_pct=60.0,
            fold_cbet_pct=45.0,
        )
        fuites = detecter_fuites(stats)
        if len(fuites) >= 2:
            assert fuites[0].severite >= fuites[1].severite

    def test_aucune_fuite_quand_stats_ideales(self):
        stats = StatsCumulees(
            mains=100,
            vpip_pct=24.0,
            pfr_pct=18.0,
            wwsf_pct=50.0,
            fold_3bet_pct=58.0,
            cbet_pct=62.0,
            fold_cbet_pct=45.0,
        )
        fuites = detecter_fuites(stats)
        assert len(fuites) == 0

    def test_fuite_a_un_conseil(self):
        stats = StatsCumulees(mains=100, vpip_pct=10.0)
        fuites = detecter_fuites(stats)
        assert any(f.conseil for f in fuites)
