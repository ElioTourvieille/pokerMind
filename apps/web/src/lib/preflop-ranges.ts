export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
export type Rank = (typeof RANKS)[number]

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB'
export const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB']

export const POSITION_LABELS: Record<Position, string> = {
  UTG: 'Under the Gun',
  MP: 'Middle Position',
  CO: 'Cut-Off',
  BTN: 'Button',
  SB: 'Small Blind',
}

// (row, col) → hand string
// row === col → pair, row < col → suited, row > col → offsuit
export function cellToHand(row: number, col: number): string {
  if (row === col) return `${RANKS[row]}${RANKS[row]}`
  if (row < col) return `${RANKS[row]}${RANKS[col]}s`
  return `${RANKS[col]}${RANKS[row]}o`
}

// ── Opening ranges (6-max NL cash, approximate GTO-ish) ───────────────────

const UTG_HANDS: string[] = [
  // Pairs
  'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77',
  // Suited aces
  'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s',
  // Suited kings
  'KQs', 'KJs', 'KTs',
  // Suited queens/jacks
  'QJs', 'QTs', 'JTs', 'J9s',
  // Suited connectors
  'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s',
  // Offsuit broadways
  'AKo', 'AQo', 'AJo',
]

const MP_HANDS: string[] = [
  ...UTG_HANDS,
  '66',
  'A7s', 'A6s', 'A5s',
  'K9s', 'K8s',
  'Q9s', 'J8s',
  'T7s',
  '96s', '95s', '85s', '75s', '74s', '65s', '64s',
  'KQo', 'KJo',
]

const CO_HANDS: string[] = [
  ...MP_HANDS,
  '55', '44', '33',
  'A4s', 'A3s', 'A2s',
  'K7s', 'K6s',
  'Q8s', 'Q7s',
  'J7s', 'J6s',
  'T6s',
  '84s', '73s', '63s', '54s', '53s',
  'ATo', 'QJo', 'JTo',
]

const BTN_HANDS: string[] = [
  ...CO_HANDS,
  '22',
  'K5s', 'K4s', 'K3s', 'K2s',
  'Q6s', 'Q5s', 'Q4s',
  'J5s', 'J4s',
  'T5s', 'T4s',
  '94s', '93s', '83s', '72s', '62s', '52s', '43s', '42s', '32s',
  'A9o', 'A8o', 'A7o',
  'KTo', 'K9o', 'K8o',
  'QTo', 'Q9o', 'Q8o',
  'J9o', 'J8o',
  'T9o', 'T8o',
  '98o', '97o',
  '87o', '86o',
  '76o', '75o',
]

const SB_HANDS: string[] = [
  ...CO_HANDS,
  '22',
  'K5s', 'K4s', 'K3s',
  'Q6s', 'Q5s',
  'J5s',
  'T5s',
  '94s', '83s', '72s', '52s',
  'A9o', 'A8o',
  'KTo', 'K9o',
  'QTo', 'Q9o',
  'J9o',
  'T9o', 'T8o',
  '98o', '97o',
  '87o',
]

export const RANGES: Record<Position, Set<string>> = {
  UTG: new Set(UTG_HANDS),
  MP: new Set(MP_HANDS),
  CO: new Set(CO_HANDS),
  BTN: new Set(BTN_HANDS),
  SB: new Set(SB_HANDS),
}

// ── Stats ──────────────────────────────────────────────────────────────────

function combos(hand: string): number {
  if (hand.endsWith('s')) return 4
  if (hand.endsWith('o')) return 12
  return 6 // pair
}

export const TOTAL_COMBOS = 1326

export function rangeStats(position: Position): { hands: number; combos: number; pct: number } {
  const range = RANGES[position]
  const totalCombos = [...range].reduce((sum, h) => sum + combos(h), 0)
  return {
    hands: range.size,
    combos: totalCombos,
    pct: Math.round((totalCombos / TOTAL_COMBOS) * 100),
  }
}
