export type ConceptCategory = 'preflop' | 'aggression' | 'defense' | 'postflop'

export interface DrillQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ConceptDefinition {
  id: string
  title: string
  summary: string
  content: string
  category: ConceptCategory
  relatedLeaks: string[]
  difficulty: 1 | 2 | 3
  drill: DrillQuestion[]
}

export const CONCEPTS: ConceptDefinition[] = [
  // ── PRÉFLOP ──────────────────────────────────────────────────────────────

  {
    id: 'range-by-position',
    title: 'Ranges d\'ouverture par position',
    summary: 'Ta range de départ doit s\'élargir au fur et à mesure que tu approches du bouton. Jouer la même range depuis UTG et depuis BTN est l\'une des erreurs les plus coûteuses.',
    content: `En 6-max cash game, la position détermine directement quelles mains tu peux ouvrir de façon rentable.

**UTG (Under the Gun)** : Tu agis en premier sur toutes les streets. Ton range doit être serré : environ 14-16% des mains (QQ+, AK, AQs, KQs, JJ, TT, et quelques suited connectors forts comme 87s, 98s).

**MP (Middle Position)** : Tu peux légèrement élargir : ~18-20% des mains. Ajoute 99, AJs, KJs, QJs, T9s.

**CO (Cut-Off)** : Avec deux joueurs derrière, tu peux ouvrir ~25-28%. Intègre 88, 77, A9s, K9s, suited gappers comme 75s.

**BTN (Button)** : C\'est ta meilleure position — tu seras en position sur tous les adversaires postflop. Range d\'ouverture ~40-45% : toute paire, tout as, beaucoup de suited connectors, suited broadways.

**SB (Small Blind)** : Tu seras hors position postflop contre la BB. Ouvre comme BTN mais sois plus sélectif en terme de mains marginals.

**Le piège commun** : Jouer trop large en early position (VPIP élevé) car tu sembles actif, alors qu\'en réalité tu construis des pots hors position avec des mains faibles.

**Règle pratique** : Si tu arrives à te demander "est-ce que cette main joue bien hors position contre un caller compétent ?", tu as ta réponse sur la playabilité depuis UTG.`,
    category: 'preflop',
    relatedLeaks: ['vpip_haut', 'pfr_bas'],
    difficulty: 1,
    drill: [
      {
        id: 'rbp-1',
        question: 'Tu es en UTG en 6-max. Quelle main est la plus appropriée à ouvrir ?',
        options: ['Q7o', 'ATs', 'T8o', '64s'],
        correctIndex: 1,
        explanation: 'ATs joue bien même hors position grâce à son potentiel de flush et ses outs propres. Q7o, T8o et 64s sont trop faibles/déconnectés depuis UTG.',
      },
      {
        id: 'rbp-2',
        question: 'Depuis le BTN, tu as J5o. Quel est le meilleur play face à des limpers passifs ?',
        options: ['Fold — trop faible pour jouer', 'Limp derrière', 'Raise isolate', 'All-in'],
        correctIndex: 2,
        explanation: 'Depuis le BTN contre des limpers passifs, un raise iso avec J5o peut être profitable en exploitant ta position postflop. Le fold est trop tight, le limp abandonne le lead.',
      },
      {
        id: 'rbp-3',
        question: 'Ton VPIP est à 32% mais tu joues principalement depuis UTG/MP. C\'est un signal que tu :',
        options: ['Joues trop large en early position', 'Joues bien mais tu as de la chance', 'Devrais augmenter encore ton VPIP', 'Joues trop peu depuis le BTN'],
        correctIndex: 0,
        explanation: 'Un VPIP élevé avec une forte proportion de mains depuis UTG/MP signifie que tu entres dans des pots avec des mains marginales hors position — l\'une des fuites les plus coûteuses.',
      },
    ],
  },

  {
    id: 'limp-vs-raise',
    title: 'Pourquoi le limp est presque toujours une erreur',
    summary: 'Le limp (call de la BB) abandonne l\'initiative préflop et donne aux adversaires derrière une chance d\'entrer en position. Presque toutes les mains qui valent jouer valent un raise.',
    content: `Le limp open (entrer dans le pot pour 1BB sans relancer) est l\'une des fuites les plus identifiables chez les joueurs en développement.

**Pourquoi le limp est mauvais :**

1. **Tu abandonnes l\'initiative** : Sans initiative préflop, tu ne peux pas continuer à miser au flop comme agresseur — tes c-bets n\'ont aucune crédibilité.

2. **Tu donnes de la cote aux mains derrière** : Tes adversaires reçoivent des cotes implicites excellentes pour entrer avec des mains spéculatives. Tu joues hors position dans un pot multiway — le pire scénario.

3. **Tu rends tes bonnes mains exploitables** : Si tu limp avec AA et raise avec KK+, les joueurs attentifs vont le noter.

**Exceptions rares au limp :**
- Depuis la SB quand le pot est multiway et limped — limp compléter avec des mains spéculatives qui jouent bien multiway (petites paires pour set mining, suited connectors).
- Limp-reraise (trap) depuis la SB avec AA/KK contre un stealing régulier — mais c\'est une stratégie avancée qui demande des reads.

**Règle simple** : Si une main vaut être jouée, elle vaut généralement un raise de 2.5x (BTN) à 3x (UTG). Si elle ne vaut pas un raise, elle ne vaut pas être jouée.`,
    category: 'preflop',
    relatedLeaks: ['pfr_bas', 'vpip_haut'],
    difficulty: 1,
    drill: [
      {
        id: 'lvr-1',
        question: 'Tu es en CO avec 77. Le pot est ouvert par UTG. Tu :',
        options: ['Limp pour voir le flop pas cher', '3-bet pour prendre l\'initiative', 'Call pour set-mine en position', 'Fold car 77 c\'est trop faible'],
        correctIndex: 2,
        explanation: 'Face à un open UTG, le call avec 77 en CO est correct — tu as de la position, tu peux set-miner avec des implied odds. Le 3-bet est possible mais risque de bloquer les cold-callers. Le fold est trop tight.',
      },
      {
        id: 'lvr-2',
        question: 'Quel est le principal avantage du raise vs limp en open ?',
        options: ['Ça augmente la taille du pot', 'Tu prends l\'initiative et peux c-bet au flop', 'Tu forces les adversaires à folder', 'Tu caches la force de ta main'],
        correctIndex: 1,
        explanation: 'L\'initiative est la principale valeur du raise. Elle te donne la crédibilité pour continuer à miser (c-bet) au flop, même si le board ne t\'a pas touché.',
      },
      {
        id: 'lvr-3',
        question: 'Dans quelle situation le limp peut être acceptable ?',
        options: ['Depuis UTG avec AA pour slowplay', 'Depuis la SB pour compléter dans un pot multiway limped', 'Depuis le BTN avec n\'importe quelle main', 'Face à un tight aggressif à votre gauche'],
        correctIndex: 1,
        explanation: 'Compléter depuis la SB dans un pot multiway déjà limped est la seule situation où le limp reste défendable, car les cotes implicites justifient d\'entrer avec des mains spéculatives.',
      },
    ],
  },

  {
    id: 'pfr-vpip-ratio',
    title: 'Le ratio PFR/VPIP : équilibre entre agressivité et sélection',
    summary: 'Un VPIP de 25% avec un PFR de 5% révèle un joueur qui appelle trop et raise trop peu — un profil "calling station" qui se fait exploiter facilement.',
    content: `Le ratio entre ton PFR et ton VPIP est l\'un des indicateurs les plus révélateurs de ton style de jeu préflop.

**Qu\'est-ce que le ratio PFR/VPIP ?**
- VPIP = % des mains où tu mets de l\'argent volontairement préflop
- PFR = % des mains où tu raise préflop
- Un ratio PFR/VPIP de ~0.75-0.85 est généralement sain en 6-max

**Exemples de profils :**

| VPIP | PFR | Ratio | Profil |
|------|-----|-------|--------|
| 25 | 20 | 0.80 | Sain — TAG classique |
| 30 | 8  | 0.27 | Calling station — dangereux |
| 18 | 16 | 0.89 | Tight-aggressive solide |
| 28 | 24 | 0.86 | LAG — viable si équilibré |

**Pourquoi un ratio bas est problématique :**
Quand tu calls beaucoup et raises peu, tu abandonnes l\'initiative. Sans initiative, tu joues "check-call poker" au postflop — réactif plutôt qu\'actif. Ton équité se réalise moins souvent car tu ne forces pas les adversaires à folder.

**Comment corriger :**
- Convertis tes calls avec des mains fortes en raises
- Réduis les calls avec des mains marginales (particulièrement hors position)
- Pense à ta réponse préflop en termes de : raise → call → fold, pas call → fold`,
    category: 'preflop',
    relatedLeaks: ['pfr_bas', 'vpip_haut'],
    difficulty: 2,
    drill: [
      {
        id: 'pvr-1',
        question: 'Un joueur a VPIP 28% et PFR 9%. Quel est son problème principal ?',
        options: ['Il joue trop peu de mains', 'Il call trop et raise trop peu — calling station', 'Il 3-bet trop souvent', 'Il joue trop tight en late position'],
        correctIndex: 1,
        explanation: 'Un ratio PFR/VPIP de 9/28 = 0.32 est extrêmement bas. Ce joueur entre dans beaucoup de pots en callant sans initiative, ce qui le rend facilement exploitable postflop.',
      },
      {
        id: 'pvr-2',
        question: 'Tu as AJo depuis le BTN. L\'UTG open 3bb. Quel play améliore ton ratio PFR/VPIP ?',
        options: ['Call pour voir le flop', '3-bet à 9bb', 'Fold', 'All-in'],
        correctIndex: 1,
        explanation: 'Le 3-bet avec AJo depuis BTN face à UTG est défendable en exploitative et améliore ton PFR. Le call reste possible mais te laisse sans initiative dans un pot hors position contre UTG.',
      },
      {
        id: 'pvr-3',
        question: 'Quel ratio PFR/VPIP est le plus représentatif d\'un TAG sain en 6-max ?',
        options: ['0.25 (VPIP 28 / PFR 7)', '0.80 (VPIP 25 / PFR 20)', '1.00 (VPIP 20 / PFR 20)', '0.50 (VPIP 30 / PFR 15)'],
        correctIndex: 1,
        explanation: 'Un ratio de ~0.75-0.85 indique un équilibre sain entre sélection et agressivité. 1.00 signifie que tu ne call jamais préflop, ce qui est trop extrême.',
      },
    ],
  },

  // ── 3-BET / DÉFENSE ──────────────────────────────────────────────────────

  {
    id: '3bet-basics',
    title: 'Comprendre le 3-bet : valeur et bluff',
    summary: 'Un 3-bet range déséquilibré (que de la valeur) devient facilement exploitable. Un bon 3-bet range combine des mains de valeur et des bluffs polarisés.',
    content: `Le 3-bet est la deuxième relance préflop (open = 1bet, call = flat, 3-bet = reraise). Comprendre quand et pourquoi 3-bet est fondamental.

**Deux raisons de 3-bet :**

1. **Pour valeur** : Avec des mains très fortes (AA, KK, QQ, AK) qui veulent construire un pot et eliminer des adversaires.

2. **En bluff** : Avec des mains qui peuvent folder face à un 4-bet, mais qui ont de la playabilité si le caller call. Ces mains doivent idéalement bloquer les fortes mains de l\'adversaire (A5s bloque AK/AA) et avoir un plan postflop.

**Pourquoi ne pas 3-bet que de la valeur ?**
Si tu 3-bet uniquement AA/KK/AK, tes adversaires compétents vont simplement folder tout sauf leurs meilleures mains face à toi. Tu construis de petits pots avec tes monstres et tu perds de l\'EV.

**Construction d\'un range 3-bet polarisé :**
- Valeur : AA, KK, QQ, JJ (selon position), AK, AQs
- Bluffs : A5s, A4s (bloquent AK/AA), KQs, petits suited connectors avec backdoor potential

**3-bet en position vs hors position :**
En position (BTN vs CO), tu peux 3-bet plus large car tu as l\'avantage postflop. Hors position (SB vs BTN), sois plus sélectif — il faut avoir une main qui joue bien même sans l\'avantage positionnel.`,
    category: 'defense',
    relatedLeaks: ['fold_3bet_haut', 'fold_3bet_bas'],
    difficulty: 2,
    drill: [
      {
        id: '3bb-1',
        question: 'Tu 3-bet depuis BTN avec A5s. L\'adversaire 4-bet. Tu :',
        options: ['Call — tu as un as qui bloque', 'Fold — c\'est un bluff, pas de la valeur', '5-bet all-in', 'Fold uniquement si l\'adversaire est tight'],
        correctIndex: 1,
        explanation: 'A5s en 3-bet bluff doit pouvoir folder face à un 4-bet. C\'est la définition d\'un bluff polarisé. Si tu ne peux pas folder, le bluff perd de son sens.',
      },
      {
        id: '3bb-2',
        question: 'Pourquoi A5s est-il un bon candidat au 3-bet bluff vs AK/AA ?',
        options: ['Car il a une paire d\'as', 'Car il bloque les mains fortes de l\'adversaire comme AK et AA', 'Car il a plus d\'équité que ATo', 'Car il joue bien en multiway'],
        correctIndex: 1,
        explanation: 'L\'as dans A5s bloque la combinatoire de AK (de 16 combos à 9) et de AA (de 6 à 3). Cela rend le fold de l\'adversaire plus probable, ce qui augmente la valeur du bluff.',
      },
      {
        id: '3bb-3',
        question: 'Quel est le problème d\'un range de 3-bet composé uniquement de AA/KK/AK ?',
        options: ['C\'est trop large', 'Les adversaires peuvent le exploiter en foldant tout sauf leurs top hands', 'Ça donne trop de valeur à ses adversaires', 'On perd trop souvent avec AK'],
        correctIndex: 1,
        explanation: 'Un range de 3-bet trop value-heavy est exploitable : les adversaires peuvent simplement caller/4-bet uniquement avec leurs mains premium et folder le reste, limitant tes gains.',
      },
    ],
  },

  {
    id: 'defend-vs-3bet',
    title: 'Défendre face au 3-bet : call, 4-bet ou fold ?',
    summary: 'Face à un 3-bet, fold trop souvent donne de l\'EV gratuite à l\'adversaire. La clé est d\'identifier les mains qui appellent profitablement en position et celles qui doivent 4-bet.',
    content: `Quand un adversaire 3-bet ton open, tu as trois options : fold, call, ou 4-bet. Comment choisir ?

**Les trois options et quand les utiliser :**

**Fold :**
Avec des mains marginales, particulièrement hors position. KJo depuis UTG face à un 3-bet du CO, par exemple — tu es hors position avec une main qui joue mal dans de gros pots.

**Call (défense flat) :**
Avec des mains qui ont de bonnes implied odds et qui jouent bien en position :
- Petites paires (22-99) pour set-mining
- Suited connectors et broadways (87s, KQs, JTs)
- Mains avec playabilité postflop

**4-bet :**
- Pour valeur : AA, KK, QQ, AK (construire un pot avec tes meilleures mains)
- En bluff : A5s, A4s (ces mains bloquent la range adversaire et ont un backup plan si callées)

**L\'erreur du fold to 3bet élevé :**
Si ton fold to 3bet dépasse 68%, tu abandonnes du EV à chaque fois que quelqu\'un 3-bet ton open. Les adversaires attentifs vont commencer à 3-bet light depuis toutes les positions pour exploiter cette tendance.

**Ajustement concret :**
- Face à un 3-bet depuis BTN (in position postflop) : call plus large
- Face à un 3-bet depuis SB/BB (hors position) : 4-bet or fold, minimise les calls`,
    category: 'defense',
    relatedLeaks: ['fold_3bet_haut'],
    difficulty: 2,
    drill: [
      {
        id: 'dv3-1',
        question: 'Tu open depuis CO avec KQs. Le BTN 3-bet à 9bb. Tu :',
        options: ['Fold — KQs n\'est pas assez fort', 'Call — tu as position et playabilité', '4-bet — c\'est une main de valeur', 'All-in'],
        correctIndex: 1,
        explanation: 'KQs face à un 3-bet BTN est un call classique. Tu es en position, tu as une main avec de la playabilité et des backdoors. Le fold serait trop tight, le 4-bet pousserait trop loin.',
      },
      {
        id: 'dv3-2',
        question: 'Ton fold to 3bet est à 76%. Un adversaire attentif va :',
        options: ['Te respecter et 3-bet moins', '3-bet plus fréquemment pour exploiter ta tendance au fold', 'Jouer plus passif contre toi', 'Te cibler avec des 4-bets'],
        correctIndex: 1,
        explanation: 'Un fold to 3bet de 76% est un signal clair pour 3-better plus souvent. L\'adversaire gagne de l\'EV pure à chaque 3-bet car tu abandones le pot trop souvent.',
      },
      {
        id: 'dv3-3',
        question: 'Face à un 3-bet, quelle main est la meilleure candidate au 4-bet bluff ?',
        options: ['T9s', 'A5s', 'KTo', '55'],
        correctIndex: 1,
        explanation: 'A5s bloque AK et AA (les mains que l\'adversaire 3-bet le plus), a un backup plan si callé (flush draw), et peut folder profitablement face à un 5-bet.',
      },
    ],
  },

  {
    id: '4bet-range',
    title: '4-bet ranges : valeur et bluff polarisé',
    summary: 'Le 4-bet doit être polarisé : tes meilleures mains pour valeur, et quelques bluffs qui bloquent les holdings forts de l\'adversaire. Un range de 4-bet déséquilibré devient rapidement exploitable.',
    content: `Le 4-bet (quatrième mise préflop) est une action puissante qui force l\'adversaire à prendre une décision difficile. Mal utilisé, il révèle ta range et te coûte de l\'EV.

**Range de 4-bet value :**
AA, KK sont des 4-bet systématiques. QQ, AK peuvent être 4-bet ou flatté selon la position et l\'adversaire.

**Range de 4-bet bluff :**
- A5s, A4s, A3s : bloquent AA et AK, peuvent continuer si callés
- KQs depuis certaines positions
- Évite les 4-bet bluffs hors position — tu devras jouer un gros pot sans l\'avantage positionnel

**Pourquoi polariser ?**
Si tu 4-bet TT ou AQo comme valeur, tu transformes ces mains en "bluffs" de facto — tu bloques les mains médiocres de l\'adversaire mais il peut 5-bet avec ses monstres. Ces mains jouent mieux en flat.

**Sizing du 4-bet :**
- IP : environ 2.2-2.5x le 3-bet
- OOP : environ 2.5-3x le 3-bet
- Évite les tailles qui révèlent la force (trop gros = valeur, trop petit = bluff)

**Gestion des 5-bets :**
Face à un 5-bet, tu dois avoir planifié à l\'avance : tes mains de valeur (AA/KK) continuent, tes bluffs (A5s) foldent. Si tu 4-bet une main sans savoir quoi faire face à un 5-bet, tu 4-bet probablement la mauvaise main.`,
    category: 'defense',
    relatedLeaks: ['fold_3bet_haut', 'fold_3bet_bas'],
    difficulty: 3,
    drill: [
      {
        id: '4br-1',
        question: 'Tu 4-bet bluff avec A4s. L\'adversaire 5-bet all-in (40bb effective). Tu :',
        options: ['Call — tu as 21% d\'équité', 'Fold — c\'est un bluff, pas de la valeur', '5-bet resteal', 'Call seulement si tu as les pot odds'],
        correctIndex: 1,
        explanation: 'Ton 4-bet bluff avec A4s doit pouvoir folder face à un 5-bet. C\'est la condition du bluff polarisé. Rester en planifiant le fold au 5-bet maximise ta valeur sur le long terme.',
      },
      {
        id: '4br-2',
        question: 'Pourquoi QQ est parfois flatté plutôt que 4-bet face à un 3-bet ?',
        options: ['QQ est trop faible pour construire un pot', 'En flat, tu gardes plus de mains médiocres dans la range adverse — plus d\'implied odds', 'Le 4-bet avec QQ est toujours un bluff', 'Pour slowplay et induire des bluffs'],
        correctIndex: 1,
        explanation: 'En foldant face à un 4-bet avec QQ, tu perds de l\'EV. Mais en flat avec QQ, tu gardes les mains médiocres du 3-bettor dans le pot et tu peux les stack quand tu floppes un set.',
      },
    ],
  },

  // ── C-BET ────────────────────────────────────────────────────────────────

  {
    id: 'cbet-basics',
    title: 'Le c-bet : principes fondamentaux',
    summary: 'Le c-bet (continuation bet) exploite l\'initiative prise préflop. Sans c-bet, tu abandonnes l\'avantage de l\'agresseur et laisses voir les streets gratuitement.',
    content: `Le c-bet est la mise que tu fais au flop après avoir été l\'agresseur préflop (raiser ou 3-bettor). C\'est l\'une des actions postflop les plus courantes et les plus importantes.

**Pourquoi c-bet ?**
1. **Valeur** : Quand le board touche ta range ou ta main
2. **Bluff** : Quand le board est mauvais pour ta main mais bon pour ta range en général
3. **Semibluff** : Avec des draws qui ont de l\'équité

**Le board favorise qui ?**
Ta range d\'ouverture contient des mains fortes (QQ+, AK). Le board A-7-2 favorise l\'agresseur préflop car il contient des as, et les top hands de la range du caller ne contiennent souvent pas d\'as. C\'est un board où le c-bet est très efficace.

**Boards à éviter pour le c-bet :**
- Boards bas et connectés (5-6-7) favorisent les ranges larges du caller qui contient des suited connectors
- Boards paired (8-8-3) où ton c-bet sera souvent credité mais difficile à continuer

**Fréquence idéale :**
En heads-up, un c-bet de 55-65% sur les bons boards est standard. Plus bas = tu laisses de l\'EV, plus haut = tu deviens prévisible et facilement exploitable.

**Sizing :**
- Boards secs (A-7-2r) : petit sizing 25-33% du pot (peu de draws, tu charges juste le caller)
- Boards humides (J-T-8s) : plus grand 50-75% du pot (tu fais payer les draws)`,
    category: 'aggression',
    relatedLeaks: ['cbet_bas'],
    difficulty: 1,
    drill: [
      {
        id: 'cbb-1',
        question: 'Tu open BTN avec AKo, BB call. Flop : A-7-2r. Tu :',
        options: ['Check — tu as la meilleure main, pas besoin de miser', 'C-bet petit (25-33%) pour extraire valeur', 'C-bet gros (75%) pour charger les draws', 'Check-raise trap'],
        correctIndex: 1,
        explanation: 'Sur A-7-2r, un c-bet petit (25-33%) est optimal. Le board est sec (peu de draws), ton TP est très fort, et le BB ne peut que caller ou folder. Le check abandonne de l\'EV contre les mains du BB qui payent.',
      },
      {
        id: 'cbb-2',
        question: 'Ton c-bet% est à 35%. Quel est le principal problème ?',
        options: ['Tu misses trop de valeur et laisses des adversaires voir gratis des streets', 'Tu bluffes trop souvent', 'Tu joues trop aggressif', 'Ce taux est correct pour un TAG'],
        correctIndex: 0,
        explanation: 'Un c-bet de 35% signifie que tu check la majorité du temps — tu abandonnes l\'initiative et offres des cards gratuites à tes adversaires, réduisant l\'EV de tes bonnes mains.',
      },
      {
        id: 'cbb-3',
        question: 'Sur quel board le c-bet est le MOINS approprié ?',
        options: ['A-7-2r (sec, favorable à ta range)', 'K-Q-2r (hits ta range)', '6-7-8s (board humide connecté, favorise la range du caller)', 'A-A-3 (board paired avec un as)'],
        correctIndex: 2,
        explanation: '6-7-8s favorise fortement les suited connectors dans la range du caller (56s, 89s, T9s). Ton c-bet aura peu de fold equity et tes mains sans équité perdront contre ses meilleurs holdings.',
      },
    ],
  },

  {
    id: 'board-texture-cbet',
    title: 'Texture de board et fréquence de c-bet',
    summary: 'Tous les flops ne se jouent pas de la même façon. Adapter ta fréquence et ton sizing de c-bet à la texture du board est un levier majeur de ton EV postflop.',
    content: `La texture du flop détermine qui a l\'avantage de range et donc qui devrait miser le plus souvent.

**Boards favorables à l\'agresseur préflop :**

**Boards secs avec hautes cartes** (A-K-2r, A-7-2r) :
- Ta range contient plus de grosses paires et d\'as que le caller
- C-bet high frequency (70-80%) avec petit sizing (25-33%)
- Le caller ne peut pas défendre assez large face à ce sizing

**Boards intermédiaires** (K-J-4, Q-T-3) :
- Les deux ranges peuvent toucher
- C-bet sélectif : tes top hands pour valeur, tes semibluffs (draws), et quelques bluffs secs
- Sizing moyen (40-50%)

**Boards défavorables à l\'agresseur :**

**Boards connectés humides** (7-8-9s, 5-6-7) :
- La range du caller contient beaucoup de suited connectors
- C-bet avec seulement tes draws forts et tes top hands réels
- Check plus souvent pour contrôler le pot

**Boards pairés bas** (2-2-7) :
- Ton avantage est limité
- Petit c-bet ou check selon ta holding

**La règle du range advantage :**
Avant de c-bet, demande-toi : "Est-ce que ma range touche ce board mieux que la range du caller ?" Si oui, c-bet fréquent. Si non, sois plus sélectif.`,
    category: 'aggression',
    relatedLeaks: ['cbet_bas', 'cbet_haut'],
    difficulty: 2,
    drill: [
      {
        id: 'btc-1',
        question: 'Sur quel flop ton c-bet a le plus de fold equity ?',
        options: ['7-8-9 deux couleurs', 'A-2-5 arc-en-ciel', '5-6-7 monotone', 'J-T-9 deux couleurs'],
        correctIndex: 1,
        explanation: 'A-2-5 rainbow est un board sec qui touche fortement la range de l\'agresseur (contient beaucoup d\'as). La range du caller contient peu de mains qui jouent bien ici, donc le fold equity est maximal.',
      },
      {
        id: 'btc-2',
        question: 'Tu as KK sur un flop J-T-8 deux couleurs face au BB. Tu :',
        options: ['C-bet gros pour charger les draws', 'Check pour pot control — beaucoup de draws te battent', 'C-bet petit pour induire', 'Check-raise trap'],
        correctIndex: 0,
        explanation: 'KK sur J-T-8 est une main forte mais vulnérable. Un c-bet gros (60-75%) est correct : tu charges les draws (QX, 9X, flush draws) et tu extrais de la valeur avant qu\'une carte mauvaise tombe.',
      },
    ],
  },

  {
    id: 'cbet-sizing',
    title: 'Sizing du c-bet : adapter la taille à ton objectif',
    summary: 'Le sizing du c-bet révèle ton objectif : un petit bet sur un board sec protège ta range, un gros bet sur un board humide charge les draws. Ne pas varier son sizing est une fuite exploitable.',
    content: `Le sizing de ton c-bet n\'est pas arbitraire — il communique quelque chose à l\'adversaire ET à ta range. Voici comment le calibrer.

**Trois catégories de sizing :**

**Petit (25-35% du pot) :**
- Boards secs où tu as l\'avantage de range clair
- Tu misses peu (board A-high) et peu de draws sont disponibles
- Force l\'adversaire à défendre souvent mais avec des mains faibles
- Économise des chips quand tu bluffes

**Moyen (45-60% du pot) :**
- Boards standards, range advantages modérés
- Tu veux extraire de la valeur ET faire payer les draws
- Le sizing le plus polyvalent

**Grand (65-80% du pot) :**
- Boards humides avec beaucoup de draws (deux couleurs, connectés)
- Tu veux charger les draws immédiatement
- Avec tes top hands ET tes bluffs (pour équilibrer)

**L\'erreur de sizing révélatrice :**
Si tu bets toujours 75% du pot avec tes monstres et 33% avec tes bluffs, les adversaires attentifs vont s\'adapter. Utilise le même sizing avec des mains de valeur ET des bluffs pour équilibrer.

**Bet ¼ pot : quand est-ce approprié ?**
Sur les boards secs où ton range advantage est écrasant (A-2-7r), un bet de ¼ pot force l\'adversaire à défendre très large — et il va souvent le faire avec des mains perdantes.`,
    category: 'aggression',
    relatedLeaks: ['cbet_bas', 'cbet_haut'],
    difficulty: 2,
    drill: [
      {
        id: 'cbs-1',
        question: 'Sur J-T-8 deux couleurs, quel sizing de c-bet est le plus approprié ?',
        options: ['25% du pot', '75% du pot', '10% du pot', 'Overbets (120% du pot)'],
        correctIndex: 1,
        explanation: 'J-T-8 deux couleurs est un board humide avec flush draws, straight draws et top pair draws. Un c-bet de 75% charge les draws immédiatement et protège tes mains fortes.',
      },
      {
        id: 'cbs-2',
        question: 'Tu bluffes sur A-7-2r. Quel sizing doit tu utiliser pour équilibrer ta range ?',
        options: ['Grand sizing (75%) pour paraître fort', 'Même sizing que tes mains de valeur sur ce board', 'Toujours petit (25%) pour risquer moins', 'Checker — ne jamais bluffer sur ce board'],
        correctIndex: 1,
        explanation: 'Pour équilibrer ta range, utilise le même sizing avec tes bluffs et ta valeur. Si tu bets toujours petit avec tes bluffs, les adversaires vont apprendre à te payer plus souvent.',
      },
    ],
  },

  // ── DÉFENSE FACE AU C-BET ─────────────────────────────────────────────────

  {
    id: 'minimum-defense-frequency',
    title: 'Fréquence de défense minimale (MDF)',
    summary: 'Chaque mise adverse crée une fréquence de défense minimale en dessous de laquelle tes folds deviennent exploitables. Connaître cette fréquence t\'aide à défendre rationnellement.',
    content: `La Minimum Defense Frequency (MDF) est le concept qui répond à la question : "Combien de fois dois-je défendre pour que l\'adversaire ne puisse pas bluffer profitablement n\'importe quelle main ?"

**Formule MDF :**
MDF = Pot / (Pot + Mise) = 1 - Fold equity requise

**Exemples :**
- C-bet de 33% du pot → MDF = 75% (tu dois défendre 75% de ta range)
- C-bet de 50% du pot → MDF = 67%
- C-bet de 75% du pot → MDF = 57%
- C-bet de pot → MDF = 50%

**Qu\'est-ce que "défendre" ?**
Défendre inclut : caller, check-raiser, et parfois lead bet. Le fold est la seule action qui ne défend pas.

**Pourquoi c\'est important pour fold to c-bet :**
Si ton fold to c-bet est à 65% face à un bet de 33% (MDF = 75%), tu folds trop souvent et l\'adversaire peut miser n\'importe quelle main au flop profitablement.

**Application pratique :**
Tu n\'as pas besoin de calculer la MDF exacte à la table. L\'idée clé est : plus la mise est petite, plus tu dois défendre. Un small bet de 25% du pot requiert une défense de ~80% de ta range — même des mains médiocres doivent rester.

**La limite de la MDF :**
La MDF s\'applique théoriquement mais en pratique, tes mains ne sont pas toutes équivalentes. Certaines mains foldent même si tu dois "défendre 75%" — tu compenses en défendant plus avec tes meilleures mains.`,
    category: 'defense',
    relatedLeaks: ['fold_cbet_haut'],
    difficulty: 3,
    drill: [
      {
        id: 'mdf-1',
        question: 'L\'adversaire c-bet 50% du pot. Quelle est la MDF approximative ?',
        options: ['50%', '67%', '75%', '80%'],
        correctIndex: 1,
        explanation: 'MDF = Pot / (Pot + Bet) = 100 / (100 + 50) = 67%. Tu dois défendre au moins 67% de ta range pour rendre ses bluffs non-profitables.',
      },
      {
        id: 'mdf-2',
        question: 'Si tu folds face à un c-bet de 33% du pot avec 70% de ta range, tu :',
        options: ['Joues correctement', 'Folds trop — la MDF est 75%, tu offres de la valeur à l\'adversaire', 'Défends trop — risque de perdre des chips inutilement', 'Es en dessous de la MDF mais c\'est correct si tes mains sont faibles'],
        correctIndex: 1,
        explanation: 'MDF pour un 33% bet est ~75%. En foldant 70% de ta range (défendant seulement 30%), tu folds bien plus que la MDF — l\'adversaire peut miser n\'importe quelle main profitablement.',
      },
    ],
  },

  {
    id: 'floating',
    title: 'Le float : appeler sans toucher pour prendre le pot plus tard',
    summary: 'Le float consiste à caller un c-bet avec une main médiocre et l\'intention de prendre le pot au turn ou river quand l\'adversaire check. C\'est une arme puissante contre les c-bettors trop fréquents.',
    content: `Le floating est une technique défensive et offensive : tu calls au flop sans grande équité, avec l\'objectif de miser au turn si l\'adversaire check.

**Quand floater est efficace :**
1. Tu es en position (tu vois l\'action de l\'adversaire avant d\'agir au turn)
2. L\'adversaire c-bet trop fréquemment (>70%) — sa range est donc peu crédible
3. Le board ne touche pas sa range de façon crédible
4. Tu as des backdoor outs ou de la playabilité

**Le mécanisme du float :**
Turn : l\'adversaire check → tu bet (prends le pot)
Turn : l\'adversaire bet → tu fold (ton float a échoué, ce n\'est pas grave)

**Mains idéales pour floater :**
- Gutshots (4 outs mais crédibilité au turn)
- Backdoor flush draws (devient flush draw au turn)
- Overcards avec backdoors
- Bottom pair avec kicker qui joue bien au turn

**Quand ne pas floater :**
- Hors position : tu dois checker après le float sans avoir vu l\'action du villain
- Face à un adversaire qui barrel souvent au turn (ne donne pas de turns gratuits)
- Quand ta main a peu de credibilité comme bluff au turn

**La règle clé :**
Float uniquement quand tu as un plan pour le turn. "Je vais voir ce qui arrive" n\'est pas un plan — c\'est une fuite.`,
    category: 'defense',
    relatedLeaks: ['fold_cbet_haut'],
    difficulty: 2,
    drill: [
      {
        id: 'flt-1',
        question: 'Tu floates en position sur Q-J-4r avec 7-8o. Le turn est un 2. L\'adversaire check. Tu :',
        options: ['Check derrière — ta main n\'a pas progressé', 'Bet — prends le pot maintenant', 'Bet-fold', 'Check puis bluff river si check'],
        correctIndex: 1,
        explanation: 'C\'est le mécanisme du float : l\'adversaire check au turn, tu bets pour prendre le pot. Ta main n\'a pas d\'équité mais tu n\'as pas besoin d\'équité si l\'adversaire fold.',
      },
      {
        id: 'flt-2',
        question: 'Le float est le moins efficace dans quelle situation ?',
        options: ['En position contre un TAG', 'Hors position contre un adversaire qui double-barrel souvent', 'Contre un adversaire avec un c-bet% élevé', 'Sur un board sec favorable à ta range'],
        correctIndex: 1,
        explanation: 'Hors position, tu dois agir avant l\'adversaire au turn — tu ne peux pas capitaliser sur son check. Si l\'adversaire barrel souvent, ton float rate son objectif et tu perdes des chips inutilement.',
      },
    ],
  },

  {
    id: 'check-raise-flop',
    title: 'Le check-raise au flop : quand et pourquoi',
    summary: 'Le check-raise est une arme défensive et de valeur. Il protège ta range de checking, génère de la fold equity et peut stack des adversaires qui overbet.',
    content: `Le check-raise consiste à checker puis à relancer la mise de l\'adversaire dans la même rue. C\'est une des actions les plus puissantes du poker.

**Deux raisons de check-raiser :**

**Pour valeur :**
- Avec tes meilleures mains (sets, deux paires, TP top kicker sur boards humides)
- Pour construire le pot immédiatement
- Pour charger les adversaires qui vont continuer avec des draws ou des mains secondaires

**En bluff/semibluff :**
- Avec des draws forts (flush draw, OESD)
- Pour générer de la fold equity immédiate
- Ces mains ont de l\'équité si callées

**La range du check-raise :**
Pour équilibrer, ton check-raise range doit contenir de la valeur ET des bluffs. Si tu check-raise uniquement avec des monstres, les adversaires foldent tout sauf les nuts contre toi.

**Boards favorables au check-raise :**
- Boards humides (J-T-8s, 7-8-9) où tu peux représenter des draws forts
- Boards paired (A-A-3) où tu peux représenter un as
- Moins sur les boards secs (A-2-7r) — moins crédible sauf avec les nuts

**Sizing du check-raise :**
2.5x-3x le c-bet est standard. Plus grand si tu veux isoler (forcer le fold des draws derrière en multiway).

**Pourquoi c\'est important :**
Sans check-raise dans ta range, les adversaires peuvent c-bet 100% du temps sachant que tu appelleras juste. Le check-raise "protège ta range de checking".`,
    category: 'defense',
    relatedLeaks: ['fold_cbet_haut', 'wwsf_bas'],
    difficulty: 2,
    drill: [
      {
        id: 'crf-1',
        question: 'Tu floates le flop avec A-J-8s (flush draw). L\'adversaire c-bet 60% du pot. La meilleure action est :',
        options: ['Call — voir le turn', 'Check-raise semibluff — génère fold equity + équité si callé', 'Fold — tu n\'as pas encore de main', 'Raise all-in'],
        correctIndex: 1,
        explanation: 'Le flush draw sur un board coordonné est un candidat idéal au check-raise semibluff. Tu génères de la fold equity (l\'adversaire fold souvent) et tu as 9 outs si callé.',
      },
      {
        id: 'crf-2',
        question: 'Pourquoi inclure des bluffs dans ton range de check-raise ?',
        options: ['Pour récupérer tes pertes', 'Pour que l\'adversaire ne puisse pas folder toute sa range face à ton check-raise', 'Pour faire peur aux adversaires passifs', 'C\'est inutile — check-raise que de la valeur est optimal'],
        correctIndex: 1,
        explanation: 'Si tu check-raise uniquement avec des monstres, l\'adversaire peut folder immédiatement tout sauf ses très fortes mains. En incluant des semibluffs, tu forces l\'adversaire à défendre avec des mains médiocres.',
      },
    ],
  },

  // ── POSTFLOP / WWSF ───────────────────────────────────────────────────────

  {
    id: 'double-barrel',
    title: 'Le double barrel : continuer la pression au turn',
    summary: 'Le double barrel (c-bet flop + turn) est une arme puissante mais doit être sélectif. Barrel les bons turns avec les bons blockers améliore massivement ton WWSF.',
    content: `Le double barrel consiste à miser au flop ET au turn. C\'est une continuation de la pression exercée préflop.

**Quand barrel le turn :**

**Turn cards favorables :**
- Cartes qui touchent ta range (un as sur K-J-4 si tu ouvres large)
- Cartes qui sont des blancs pour la range du caller
- Cartes qui créent de nouveaux draws que tu peux représenter (turn flush draw)

**Turn cards défavorables :**
- Cartes qui complètent les draws du caller (board devient 7-8-9-T — toutes les straight completent)
- Cartes qui améliorent les mains mid pair du caller

**Mains pour barrel :**

**Valeur pure :** Tes mains fortes continuent toujours

**Semibluffs :** Les meilleures candidats au barrel
- Flush draw sur un board à deux couleurs
- OESD ou combo-draw
- Ces mains ont de l\'équité si callées

**Bluffs purs :**
- Avec des blockers (tu as un as → moins de chance que l\'adversaire ait un as)
- Sur des turn cards qui réduisent la range du caller (quinte complétée : il a soit la quinte, soit rien)

**Quand stopper la pression :**
Si le turn est une carte qui touche parfaitement la range du caller (ex : paired board et il a pu slowplay un set au flop), le check est souvent meilleur avec tes mains faibles.`,
    category: 'postflop',
    relatedLeaks: ['wwsf_bas', 'cbet_bas'],
    difficulty: 2,
    drill: [
      {
        id: 'dbl-1',
        question: 'Tu c-bet le flop K-7-2r. Le turn est un J. L\'adversaire check. Tu as AQ. Tu :',
        options: ['Check — tu n\'as touché ni le K ni le J', 'Barrel — AQ est un bon semibluff avec deux overcards', 'Fold si l\'adversaire bet', 'Check-raise si l\'adversaire bet'],
        correctIndex: 1,
        explanation: 'AQ sur K-J-2 a six outs pour top pair (3 as + 3 dames). Tu as de l\'équité et la fold equity. Le barrel est correct, surtout si le J favorise ta range d\'opener.',
      },
      {
        id: 'dbl-2',
        question: 'Quel type de turn card est le MOINS favorable pour barrel ?',
        options: ['Une carte overcard à ton board (flop K-5-2, turn A)', 'Une carte qui complète les straights ou flushes de la range du caller', 'Un deuxième heart sur un board à un heart', 'Un 7 sur un board K-Q-3'],
        correctIndex: 1,
        explanation: 'Un turn qui complète les draws de la range du caller (quinte, flush) est le pire pour barrel. L\'adversaire va défendre très large avec ses mains complétées et ton bluff perd de la fold equity.',
      },
    ],
  },

  {
    id: 'pot-control',
    title: 'Pot control : jouer les mains marginales avec discernement',
    summary: 'Avec des mains "top pair mediocre kicker" ou des sets sur des boards dangereux, le pot control (check derrière en position) permet de garder le pot gérable et de voir des cartes gratuites.',
    content: `Le pot control est l\'art de ne pas surjouer des mains dont la force est incertaine.

**Qu\'est-ce que le pot control ?**
C\'est le fait de choisir consciemment de ne pas bet ou raise pour éviter que le pot devienne trop gros avec une main dont la force n\'est pas assurée.

**Mains candidates au pot control :**
- Top pair avec un kicker moyen (ATo sur A-7-2)
- Deuxième paire avec un kicker moyen
- Overpair sur un board très connecté (QQ sur J-T-9)
- Sets sur des boards flush complétés

**Comment le pot control se manifeste :**
1. **Check derrière en position** : Tu as la main, tu es en position, mais tu checks pour garder le pot petit
2. **Call rather than raise** : Avec une main forte mais vulnérable sur une rue donnée

**Quand le pot control est une erreur :**
Le pot control devient une fuite quand tu l\'appliques à des mains fortes qui méritent d\'être jouées agressivement. Si tu checks KK sur K-7-2 par "pot control", tu manques de la valeur.

**La distinction critique :**
- Main forte sur board favorable → miser pour valeur
- Main forte sur board dangeureux → pot control possible
- Main médiocre → fold ou pot control selon l\'équité restante

**Position et pot control :**
Le pot control est beaucoup plus facile en position — tu peux voir l\'action adverse avant de décider. Hors position, tu dois souvent bet car tu ne peux pas contrôler la taille du pot après ton check.`,
    category: 'postflop',
    relatedLeaks: ['wwsf_bas', 'wwsf_haut'],
    difficulty: 2,
    drill: [
      {
        id: 'pc-1',
        question: 'Tu as QQ sur un flop J-T-9 deux couleurs. L\'adversaire check. Tu :',
        options: ['Bet gros — tu as une overpair', 'Bet petit pour extraire', 'Check derrière — pot control, ce board est très dangereux pour QQ', 'Fold à toute mise adverse'],
        correctIndex: 2,
        explanation: 'QQ sur J-T-9 deux couleurs est une main vulnérable. De nombreuses mains vous battent (Q8s a la quinte, 89s, JJ, TT, 99, etc.) et les draws sont nombreux. Le pot control est sage ici.',
      },
      {
        id: 'pc-2',
        question: 'Dans quelle situation le pot control est-il clairement une erreur ?',
        options: ['AA sur K-J-T deux couleurs', 'AA sur A-7-2 arc-en-ciel', 'QQ sur Q-J-T deux couleurs', 'KK sur 9-T-J deux couleurs'],
        correctIndex: 1,
        explanation: 'AA sur A-7-2 rainbow est le flop parfait pour AA. Tu as le top set sur un board sec. Ici, le pot control est une erreur — tu dois miser pour valeur et construire le pot.',
      },
    ],
  },

  {
    id: 'bluff-spot-identification',
    title: 'Identifier les bons spots de bluff',
    summary: 'Un bon bluff n\'est pas une mise faite par frustration ou espoir — c\'est une action calculée qui exploite la range de l\'adversaire, les cartes du board et ta représentation.',
    content: `Le bluff au poker est souvent malcompris. Bluffer trop souvent ou au mauvais moment détruit de l\'EV. Voici comment identifier les bons spots.

**Les ingrédients d\'un bon bluff :**

**1. Fold equity :**
L\'adversaire doit pouvoir folder. Si son range est très cap-pé (il ne peut avoir que des mains fortes) ou s\'il est un calling station, le bluff perd de la valeur.

**2. Représentation crédible :**
Le board doit avoir évolué de façon à ce que ta range puisse crédiblement avoir une main forte. Si tu check-raises sur A-2-7r au turn, c\'est moins crédible que sur K-Q-J (straights/sets possibles).

**3. Bons blockers :**
Quand tu bluffes, avoir des cartes qui bloquent les fortes mains du caller est un avantage. Bluffer avec un as en main signifie que l\'adversaire a moins de chances d\'avoir AA ou AK.

**4. Historique de la main :**
Ton story doit être cohérente. Si tu as check-callé flop et turn, une mise river sur un board brique est moins crédible qu\'un barrel continu depuis préflop.

**5. Fréquence adaptée :**
Sur une river value-bet/bluff, le ratio optimal dépend de ta représentation. En simplifié : si tu values 2 combos, bluffer 1 combo est approximativement correct pour le pot-sizing habituel.

**Spots classiques de bluff :**
- Barrel sur des turn cards scare pour la range du caller
- River bet quand l\'adversaire a "capped" sa range au turn (il ne peut pas avoir de très fortes mains)
- Check-raise semibluff avec un combo-draw au flop`,
    category: 'postflop',
    relatedLeaks: ['wwsf_bas'],
    difficulty: 3,
    drill: [
      {
        id: 'bsi-1',
        question: 'Quel facteur est le plus important pour qu\'un bluff soit profitable ?',
        options: ['Avoir des cartes fortes dans ta main', 'La fold equity — l\'adversaire doit pouvoir folder', 'Le sizing (toujours overbetter)', 'Bluffer uniquement au river'],
        correctIndex: 1,
        explanation: 'Sans fold equity, un bluff perd de l\'argent à chaque fois. Si l\'adversaire ne peut ou ne veut pas folder, peu importe le reste — le bluff n\'est pas profitable.',
      },
      {
        id: 'bsi-2',
        question: 'Tu barrel le flop et le turn. River : le flush complete. Tu as air. Tu :',
        options: ['Check-fold — tu n\'as rien', 'Bet pour représenter le flush — bonne spot de bluff', 'Bet pour extraire de la valeur', 'Check-raise si l\'adversaire bet'],
        correctIndex: 1,
        explanation: 'La river flush-completing est une excellente carte pour bluffer si tu as représenté un flush draw. Ton story est cohérent, ta range peut crédiblement avoir le flush, et l\'adversaire doit défendre seulement les flushes et top-sets.',
      },
    ],
  },

  {
    id: 'thin-value-betting',
    title: 'Value betting thin : extraire de la valeur avec des mains marginales',
    summary: 'Miser pour valeur avec une main qui bat environ 50% de la range de call de l\'adversaire. Les joueurs intermédiaires ratent des EV massifs en checkant des mains "thin value" par peur.',
    content: `Le value betting thin est l\'une des compétences les plus lucratives à développer. Il consiste à miser pour valeur avec des mains qui battent environ 50% ou plus de la range de call de l\'adversaire.

**La logique du thin value :**
Si l\'adversaire call ta mise river avec 60% de mains qui te battent et 40% de mains que tu bats, miser est mathématiquement perdant. Mais si 60% de ses calls sont battus par ta main, miser est profitable.

**Exemples de thin value :**

**Top pair weak kicker :**
River sur A-J-4-2-8, tu as A7. L\'adversaire peut caller avec AT, AJ, AQ, AK, mais aussi avec KJ, QJ, J9s. Ta main bat toutes ses paires faibles et secondes paires.

**Deuxième paire sur un board brique :**
Après plusieurs streets, si l\'adversaire a juste check-callé, son range est souvent "second pair and worse". Ta deuxième paire peut être la meilleure main.

**Les erreurs à éviter :**
1. **Bet trop gros** : Un thin value bet est souvent un petit bet (25-40%). Si tu bets 75%, tu charges les mains qui te battent et tu gardes peu de mains que tu bats.
2. **Check par peur** : Si tu checks "pour ne pas perdre plus", tu rates tout l\'EV de tes appels.
3. **Ne pas adapter à l\'adversaire** : Face à un calling station, les thin values ont plus de valeur.

**La règle de décision :**
"Est-ce que ma main bat plus de 50% de la range que l\'adversaire va caller avec ?" Si oui, bet. Si non, check.`,
    category: 'postflop',
    relatedLeaks: ['wwsf_bas'],
    difficulty: 3,
    drill: [
      {
        id: 'tvb-1',
        question: 'Tu as A7 sur une board A-J-4-2-8. L\'adversaire a check-callé le flop et turn. Tu :',
        options: ['Check river — tu as juste top pair weak kicker', 'Bet petit pour valeur thin — tu bats ses pairs secondes et draws', 'Bet gros — c\'est une main forte', 'Fold si il bet'],
        correctIndex: 1,
        explanation: 'A7 sur A-J-4-2-8 bat toutes les secondes et troisièmes paires. L\'adversaire qui a check-callé deux rues a souvent des mains que tu bats. Un petit bet river extrait de la valeur thin.',
      },
      {
        id: 'tvb-2',
        question: 'Quel sizing est le plus adapté au value betting thin ?',
        options: ['Petit (25-40% du pot)', 'Moyen (50-60% du pot)', 'Grand (75-100% du pot)', 'Overbets (>100% du pot)'],
        correctIndex: 0,
        explanation: 'Le thin value bet doit être petit. Un petit bet encourage les mains marginales à caller (maximise la range qui te paye), tandis qu\'un gros bet ne garde dans le pot que les mains qui te battent souvent.',
      },
    ],
  },

  {
    id: 'fold-equity-semibluff',
    title: 'Fold equity et semi-bluff',
    summary: 'Un semi-bluff combine de l\'équité réelle (tu peux gagner si callé) avec de la fold equity (l\'adversaire peut folder). C\'est la forme de bluff la plus rentable et la moins risquée.',
    content: `Le semi-bluff est un bluff avec une main qui a de l\'équité — tu ne comptes pas seulement sur le fold de l\'adversaire pour gagner.

**Les composantes du semi-bluff :**

**Fold equity :**
La probabilité que l\'adversaire folder. Si ton semi-bluff génère 40% de folds, tu gagnes le pot 40% du temps immédiatement.

**Equity when called :**
Si l\'adversaire call, tu as encore des chances de gagner via ton draw. Un flush draw donne ~35% d\'équité sur le flop.

**EV du semi-bluff :**
EV = (Fold%) × (Pot) + (Call%) × (Equity when called × (Pot + Bets) - (1 - Equity) × Bet)

**Candidats au semi-bluff :**
- Flush draw (9 outs = ~35% au flop, ~20% au turn)
- OESD (8 outs = ~32% au flop, ~17% au turn)
- Combo draw flush + straight = up to 15 outs = ~54% au flop
- Gutshot + overcard (7-8 outs)

**Sizing du semi-bluff :**
Plus gros que le bluff pur car tu veux souvent que l\'adversaire folder (si tu es callé tu seras souvent derrière). Mais pas trop gros si tu as beaucoup d\'équité — dans ce cas être callé n\'est pas catastrophique.

**Évolutions du semi-bluff :**
- **Float turn** : Caller le flop avec un draw, bluffer au turn si tu ne touches pas mais le board change favorablement
- **Check-raise semibluff** : Vois "check-raise au flop"`,
    category: 'postflop',
    relatedLeaks: ['wwsf_bas', 'fold_cbet_haut'],
    difficulty: 2,
    drill: [
      {
        id: 'fes-1',
        question: 'Tu as 7h8h sur un flop Jh-9c-2h. L\'adversaire c-bet. Quelle est ta meilleure action ?',
        options: ['Fold — tu n\'as pas de paire', 'Call — float pour le turn', 'Raise semibluff — tu as un OESD + flush draw backdoor', 'All-in — tu as 15 outs'],
        correctIndex: 2,
        explanation: '78h sur J-9-2h a un OESD (6 et T complètent la quinte) + backdoor flush draw. Un raise semibluff génère de la fold equity immédiate et tu as beaucoup d\'équité si callé.',
      },
      {
        id: 'fes-2',
        question: 'Avec un flush draw (9 outs), quel est ton equity approximatif au flop ?',
        options: ['15%', '35%', '50%', '65%'],
        correctIndex: 1,
        explanation: '9 outs × 4 (règle des 4/2 au flop) = ~36% d\'équité sur les deux rues restantes. Au turn, 9 outs × 2 = ~18%. C\'est suffisant pour justifier un semi-bluff en présence de fold equity.',
      },
    ],
  },

  {
    id: 'position-advantage',
    title: 'L\'avantage positionnel : pourquoi agir en dernier est si précieux',
    summary: 'Jouer en position (agir après l\'adversaire) est l\'un des avantages les plus sous-estimés au poker. L\'information que tu obtiens en voyant l\'action adverse est un avantage permanent.',
    content: `La position est peut-être le facteur le plus important au poker cash game. Jouer en position — agir après l\'adversaire sur chaque rue — te donne une information supplémentaire critique.

**Ce que la position te donne :**

**Information :**
Tu vois si l\'adversaire check ou bet avant d\'agir. Un check révèle souvent une main médiocre ou une tentative de trap. Cette information vaut des chips.

**Pot control :**
En position, tu peux choisir de voir des rues gratuites (check derrière) ou de construire le pot. Hors position, tu n\'as pas ce choix.

**Bluff timing :**
Tu peux bluffer quand l\'adversaire montre de la faiblesse (check). Hors position, tu dois bluffer sans cette info.

**Impact sur les stats :**
Un joueur en position win rate > un joueur hors position avec les mêmes cartes. C\'est pourquoi les joueurs profitables ont souvent un BB/100 plus élevé depuis BTN que depuis SB.

**Comment exploiter la position :**
1. Ouvre plus large depuis BTN/CO (tu seras en position la plupart du temps)
2. Défends plus de 3-bets en position qu\'hors position
3. Préférence pour les calls vs raises hors position (pot control)

**La règle cardinale :**
Si deux mains ont la même valeur mais l\'une est en position et l\'autre non, la main en position vaut plus. Intègre ça dans ta sélection de range.`,
    category: 'preflop',
    relatedLeaks: ['vpip_haut', 'pfr_bas'],
    difficulty: 1,
    drill: [
      {
        id: 'pa-1',
        question: 'Pourquoi le BTN peut ouvrir une range plus large que UTG ?',
        options: ['Car le BTN paye moins de blindes', 'Car le BTN sera en position postflop contre tous les adversaires sauf SB/BB', 'Car le BTN joue contre moins d\'adversaires', 'Car le BTN a statistiquement plus de chance d\'avoir de bonnes cartes'],
        correctIndex: 1,
        explanation: 'Le BTN sera en position sur tous les adversaires qui callent depuis SB ou BB. Cette position permanente postflop lui permet de jouer profitablement des mains qui seraient perdantes depuis UTG.',
      },
      {
        id: 'pa-2',
        question: 'Tu es hors position au flop. L\'adversaire a check. Tu as une main marginale (deuxième paire). Tu :',
        options: ['Bet pour extraire de la valeur', 'Check pour voir le turn gratuitement et garder le contrôle du pot', 'Raise all-in', 'Fold — les mains marginales ne jouent pas hors position'],
        correctIndex: 1,
        explanation: 'Hors position avec une main marginale, le check permet de voir le turn gratuitement et de contrôler la taille du pot. Miser transforme ta main en "bet-fold" vulnérable à un raise.',
      },
    ],
  },

  {
    id: 'implied-odds',
    title: 'Implied odds : la valeur cachée des mains spéculatives',
    summary: 'Les implied odds mesurent les gains supplémentaires que tu peux espérer si tu complétes ton draw et que l\'adversaire continue de payer. Elles justifient de caller avec des mains spéculatives dans les bons spots.',
    content: `Les implied odds sont les gains potentiels futurs qui justifient un call même quand les pot odds directes sont insuffisantes.

**Pot odds vs Implied odds :**
- Pot odds : rapport entre la mise à caller et la taille du pot
- Implied odds : pot odds + les chips supplémentaires que tu peux gagner si tu complétes

**Exemple :**
Pot de 100bb, adversaire bet 50bb. Pour caller, tu as besoin de 50/(100+50+50) = 25% d\'équité. Si tu as un flush draw (35%), tu appelles même sur les pot odds directes. Mais si tu avais seulement 20% d\'équité, tes implied odds devraient couvrir le manque.

**Quand les implied odds sont bonnes :**
1. **Stacks profonds** : Plus de chips à gagner si tu complètes
2. **Adversaire "stackable"** : Il a tendance à continuer avec des mains secondes
3. **Draw cachée** : Un flush draw sur un board à trois cœurs est visible — l\'adversaire sera prudent. Un set, en revanche, est caché.
4. **En position** : Tu peux mieux contrôler la taille du pot après avoir complété

**Set mining :**
L\'exemple classique d\'implied odds. Caler préflop avec 55 pour set-miner. Tu touches le set 12% du temps. Si les stacks sont assez profonds et que l\'adversaire va payer ton set, le call est profitable.

**Reverse implied odds :**
L\'inverse : des mains comme KJ sur un board A-K-Q peuvent sembler bonnes mais si l\'adversaire a AK, AQ ou une quinte, tu payes cher. Ces mains ont des "reverse implied odds" — tu perds gros quand tu touches.`,
    category: 'postflop',
    relatedLeaks: ['fold_3bet_haut', 'vpip_haut'],
    difficulty: 2,
    drill: [
      {
        id: 'io-1',
        question: 'Pot de 100bb, bet de 50bb. Tu as un gutshot (4 outs = ~18% sur deux rues). Tu :',
        options: ['Call — les implied odds couvrent', 'Fold — pas assez d\'équité directe', 'Raise pour générer fold equity', 'All-in'],
        correctIndex: 0,
        explanation: 'Avec 18% d\'équité, tes pot odds directes (25% requis) sont insuffisantes. Mais si les stacks sont profonds et l\'adversaire va payer ton straight, les implied odds peuvent justifier le call. Si stacks courts → fold.',
      },
      {
        id: 'io-2',
        question: 'Quelle main a les meilleures implied odds préflop ?',
        options: ['AKo (main premium)', '33 (set mining avec stacks profonds)', 'KQo (deux overcards)', 'A2o'],
        correctIndex: 1,
        explanation: '33 en set mining est l\'exemple classique d\'implied odds. AKo est une main premium qui n\'a pas besoin d\'implied odds. 33 est spéculatif mais peut gagner un stack entier quand il touche un set discret.',
      },
    ],
  },
]
