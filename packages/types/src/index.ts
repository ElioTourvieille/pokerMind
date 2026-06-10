export type SitePoker = 'pokerstars' | 'ggpoker'
export type TypeJeu = 'cash' | 'tournoi'
export type Rue = 'preflop' | 'flop' | 'turn' | 'river'
export type TypeAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in' | 'post' | 'post-ante'

export type Carte =
  `${'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'}${'s' | 'h' | 'd' | 'c'}`

export type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'UTG+1' | 'MP' | 'MP+1' | 'LJ' | 'HJ' | 'CO'

export interface Joueur {
  nom: string
  siege: number
  stack: number
  cartes?: Carte[]
  position: Position
}

export interface Action {
  joueur: string
  type: TypeAction
  montant?: number
}

export interface RueMain {
  nom: Rue
  board: Carte[]
  actions: Action[]
}

export interface Stakes {
  petiteBlinde: number
  grandeBlinde: number
}

export interface MainNormalisee {
  site: SitePoker
  idMain: string
  joueeLE: string // ISO 8601
  stakes: Stakes
  typeJeu: TypeJeu
  nomTable: string
  joueurs: Joueur[]
  hero: string
  rues: RueMain[]
  board: Carte[]
  pot: { total: number; rake: number }
  gagnants: { joueur: string; montant: number }[]
}

export interface ReviewIA {
  analyse: string
  questions: string[]
  fuites: string[]
  concepts: string[]
  score: number
}
