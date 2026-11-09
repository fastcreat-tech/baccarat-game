export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

export interface Card {
  suit: Suit
  rank: number // 1=A ... 13=K
}

export type BetType = 'player' | 'banker' | 'tie' | 'playerPair' | 'bankerPair'

export type RoundResult = 'player' | 'banker' | 'tie'

export interface DealStep {
  hand: 'player' | 'banker'
  card: Card
}

export interface RoundOutcome {
  playerCards: Card[]
  bankerCards: Card[]
  playerTotal: number
  bankerTotal: number
  result: RoundResult
  playerPair: boolean
  bankerPair: boolean
  /** ordered deal sequence, first 4 then optional thirds */
  sequence: DealStep[]
  /** index into sequence where dealing pauses to evaluate naturals */
  naturalCheckAt: number
}

export type Phase =
  | 'betting'
  | 'dealing'
  | 'settled'
