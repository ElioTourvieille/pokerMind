"""Fixtures de mains PokerStars pour les tests."""

# Main 1 — BTN ouvre, BB call, C-bet flop, BB fold
MAIN_CBET_GAGNE = """PokerStars Hand #234567890: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 20:30:00 ET
Table 'Andromeda V' 6-max Seat #4 is the button
Seat 1: UTG_Joueur ($52.30 in chips)
Seat 2: HJ_Joueur ($48.75 in chips)
Seat 3: CO_Joueur ($50.00 in chips)
Seat 4: BTN_Hero ($50.00 in chips)
Seat 5: SB_Joueur ($49.50 in chips)
Seat 6: BB_Joueur ($55.00 in chips)
SB_Joueur: posts small blind $0.25
BB_Joueur: posts big blind $0.50
*** HOLE CARDS ***
Dealt to BTN_Hero [As Kh]
UTG_Joueur: folds
HJ_Joueur: folds
CO_Joueur: folds
BTN_Hero: raises $1.00 to $1.50
SB_Joueur: folds
BB_Joueur: calls $1.00
*** FLOP *** [Kd 7s 2c]
BB_Joueur: checks
BTN_Hero: bets $2.00
BB_Joueur: folds
Uncalled bet ($2.00) returned to BTN_Hero
BTN_Hero collected $3.25 from pot
*** SUMMARY ***
Total pot $3.50 | Rake $0.25
Board [Kd 7s 2c]
Seat 4: BTN_Hero (button) collected ($3.25)
Seat 5: SB_Joueur (small blind) folded before Flop
Seat 6: BB_Joueur (big blind) folded on the Flop"""

# Main 2 — SB 3bet, UTG fold (fold to 3bet)
MAIN_3BET_FOLD = """PokerStars Hand #234567891: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 20:31:00 ET
Table 'Andromeda V' 6-max Seat #4 is the button
Seat 1: UTG_Hero ($52.30 in chips)
Seat 4: BTN_Joueur ($50.00 in chips)
Seat 5: SB_Joueur ($49.50 in chips)
Seat 6: BB_Joueur ($55.00 in chips)
SB_Joueur: posts small blind $0.25
BB_Joueur: posts big blind $0.50
*** HOLE CARDS ***
Dealt to UTG_Hero [Ah Jd]
UTG_Hero: raises $1.25 to $1.75
BTN_Joueur: folds
SB_Joueur: raises $5.50 to $5.75
BB_Joueur: folds
UTG_Hero: folds
Uncalled bet ($4.00) returned to SB_Joueur
SB_Joueur collected $4.00 from pot
*** SUMMARY ***
Total pot $4.25 | Rake $0.25
Seat 1: UTG_Hero (utg) folded before Flop
Seat 5: SB_Joueur (small blind) collected ($4.00)"""

# Main 3 — Hero plie préflop (ni VPIP ni PFR)
MAIN_FOLD_PREFLOP = """PokerStars Hand #234567892: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 20:32:00 ET
Table 'Andromeda V' 6-max Seat #4 is the button
Seat 1: UTG_Hero ($50.00 in chips)
Seat 2: HJ_Joueur ($50.00 in chips)
Seat 4: BTN_Joueur ($50.00 in chips)
Seat 5: SB_Joueur ($50.00 in chips)
Seat 6: BB_Joueur ($50.00 in chips)
SB_Joueur: posts small blind $0.25
BB_Joueur: posts big blind $0.50
*** HOLE CARDS ***
Dealt to UTG_Hero [2h 7d]
UTG_Hero: folds
HJ_Joueur: folds
BTN_Joueur: raises $1.00 to $1.50
SB_Joueur: folds
BB_Joueur: folds
Uncalled bet ($1.00) returned to BTN_Joueur
BTN_Joueur collected $1.25 from pot
*** SUMMARY ***
Total pot $1.25 | Rake $0.00
Seat 1: UTG_Hero (utg) folded before Flop
Seat 4: BTN_Joueur (button) collected ($1.25)"""

# Main 4 — Showdown, Hero perd au flop
MAIN_SHOWDOWN_PERDU = """PokerStars Hand #234567893: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 20:33:00 ET
Table 'Andromeda V' 6-max Seat #2 is the button
Seat 2: BTN_Joueur ($50.00 in chips)
Seat 5: SB_Hero ($49.50 in chips)
Seat 6: BB_Joueur ($55.00 in chips)
SB_Hero: posts small blind $0.25
BB_Joueur: posts big blind $0.50
*** HOLE CARDS ***
Dealt to SB_Hero [Qh Qs]
BTN_Joueur: raises $1.25 to $1.75
SB_Hero: raises $5.00 to $5.25
BB_Joueur: folds
BTN_Joueur: calls $3.50
*** FLOP *** [Kh 9d 3s]
SB_Hero: bets $6.00
BTN_Joueur: raises $14.00 to $20.00
SB_Hero: folds
Uncalled bet ($14.00) returned to BTN_Joueur
BTN_Joueur collected $22.50 from pot
*** SUMMARY ***
Total pot $24.00 | Rake $1.50
Board [Kh 9d 3s]
Seat 2: BTN_Joueur (button) collected ($22.50)
Seat 5: SB_Hero (small blind) folded on the Flop"""

# Main 5 — Hero BB, check option, voit le flop, fold au flop face C-bet
MAIN_FACE_CBET_FOLD = """PokerStars Hand #234567894: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 20:34:00 ET
Table 'Andromeda V' 6-max Seat #3 is the button
Seat 3: BTN_Joueur ($50.00 in chips)
Seat 5: SB_Joueur ($49.50 in chips)
Seat 6: BB_Hero ($50.00 in chips)
SB_Joueur: posts small blind $0.25
BB_Hero: posts big blind $0.50
*** HOLE CARDS ***
Dealt to BB_Hero [7c 4h]
BTN_Joueur: raises $1.00 to $1.50
SB_Joueur: folds
BB_Hero: calls $1.00
*** FLOP *** [As 8d 2h]
BB_Hero: checks
BTN_Joueur: bets $1.50
BB_Hero: folds
Uncalled bet ($1.50) returned to BTN_Joueur
BTN_Joueur collected $3.25 from pot
*** SUMMARY ***
Total pot $3.50 | Rake $0.25
Board [As 8d 2h]
Seat 3: BTN_Joueur (button) collected ($3.25)
Seat 6: BB_Hero (big blind) folded on the Flop"""

# Main 6 — Hero BB, check option, call C-bet, gagne au turn
MAIN_FACE_CBET_CALL = """PokerStars Hand #234567895: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/15 20:35:00 ET
Table 'Andromeda V' 6-max Seat #3 is the button
Seat 3: BTN_Joueur ($50.00 in chips)
Seat 5: SB_Joueur ($49.50 in chips)
Seat 6: BB_Hero ($50.00 in chips)
SB_Joueur: posts small blind $0.25
BB_Hero: posts big blind $0.50
*** HOLE CARDS ***
Dealt to BB_Hero [8c 8d]
BTN_Joueur: raises $1.00 to $1.50
SB_Joueur: folds
BB_Hero: calls $1.00
*** FLOP *** [8h 3s 2c]
BB_Hero: checks
BTN_Joueur: bets $2.00
BB_Hero: calls $2.00
*** TURN *** [8h 3s 2c] [9d]
BB_Hero: bets $5.00
BTN_Joueur: folds
Uncalled bet ($5.00) returned to BB_Hero
BB_Hero collected $7.25 from pot
*** SUMMARY ***
Total pot $7.75 | Rake $0.50
Board [8h 3s 2c 9d]
Seat 6: BB_Hero (big blind) collected ($7.25)"""

TOUTES_LES_MAINS = [
    MAIN_CBET_GAGNE,
    MAIN_3BET_FOLD,
    MAIN_FOLD_PREFLOP,
    MAIN_SHOWDOWN_PERDU,
    MAIN_FACE_CBET_FOLD,
    MAIN_FACE_CBET_CALL,
]

FICHIER_MULTI_MAINS = "\n\n".join(TOUTES_LES_MAINS)
