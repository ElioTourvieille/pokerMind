import pytest
from pokermind_parser.parsers import parser_main

MAIN_POKERSTARS = """PokerStars Hand #123456789: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 20:30:00 ET
Table 'ExempleTable' 6-max Seat #3 is the button
Seat 1: Hero ($50.00 in chips)
Seat 2: Vilain ($75.25 in chips)
Seat 3: Joueur3 ($100.00 in chips)
Hero: posts small blind $0.25
Vilain: posts big blind $0.50
*** HOLE CARDS ***
Dealt to Hero [Ah Kd]
Joueur3: folds
Hero: raises $1.50 to $2.00
Vilain: calls $1.50
*** FLOP *** [Ks 7h 2c]
Hero: bets $2.50
Vilain: folds
Uncalled bet ($2.50) returned to Hero
Hero collected $4.25 from pot
*** SUMMARY ***
Total pot $4.50 | Rake $0.25
Board [Ks 7h 2c]
Seat 1: Hero (small blind) collected ($4.25)
Seat 2: Vilain (big blind) folded on the Flop"""


@pytest.mark.xfail(reason="Parser PokerStars non encore implémenté")
def test_parser_main_pokerstars():
    main = parser_main(MAIN_POKERSTARS, "pokerstars")
    assert main.id_main == "123456789"
    assert main.hero == "Hero"
    assert len(main.joueurs) == 3
