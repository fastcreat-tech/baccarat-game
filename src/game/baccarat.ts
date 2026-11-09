import type { Card, DealStep, RoundOutcome, RoundResult, Suit } from './types'

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
const DECKS = 8

/** point value of a card in baccarat */
export function cardValue(card: Card): number {
  return card.rank >= 10 ? 0 : card.rank
}

export function handValue(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + cardValue(c), 0) % 10
}

export function rankLabel(rank: number): string {
  if (rank === 1) return 'A'
  if (rank === 11) return 'J'
  if (rank === 12) return 'Q'
  if (rank === 13) return 'K'
  return String(rank)
}

/** build a fresh shuffled 8-deck shoe (Fisher–Yates) */
export function buildShoe(): Card[] {
  const shoe: Card[] = []
  for (let d = 0; d < DECKS; d++) {
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 13; rank++) {
        shoe.push({ suit, rank })
      }
    }
  }
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shoe[i], shoe[j]] = [shoe[j], shoe[i]]
  }
  return shoe
}

/** reshuffle when fewer than this many cards remain (~1 deck) */
export const CUT_CARD_AT = 52

/** banker draw rule when player took a third card of value p3 (0-9) */
function bankerDraws(bankerTotal: number, p3: number | null): boolean {
  if (p3 === null) return bankerTotal <= 5
  switch (bankerTotal) {
    case 0:
    case 1:
    case 2:
      return true
    case 3:
      return p3 !== 8
    case 4:
      return p3 >= 2 && p3 <= 7
    case 5:
      return p3 >= 4 && p3 <= 7
    case 6:
      return p3 === 6 || p3 === 7
    default:
      return false
  }
}

/**
 * Play a full round drawing from the shoe (mutates shoe).
 * Returns the outcome plus the ordered deal sequence for animation.
 */
export function playRound(shoe: Card[]): RoundOutcome {
  const draw = () => {
    const c = shoe.pop()
    if (!c) throw new Error('shoe exhausted')
    return c
  }

  const playerCards: Card[] = [draw(), draw()]
  const bankerCards: Card[] = [draw(), draw()]
  // sequence deals P1, B1, P2, B2 like a real table
  const sequence: DealStep[] = [
    { hand: 'player', card: playerCards[0] },
    { hand: 'banker', card: bankerCards[0] },
    { hand: 'player', card: playerCards[1] },
    { hand: 'banker', card: bankerCards[1] },
  ]

  let playerTotal = handValue(playerCards)
  let bankerTotal = handValue(bankerCards)
  const natural = playerTotal >= 8 || bankerTotal >= 8
  const naturalCheckAt = sequence.length

  if (!natural) {
    let playerThird: Card | null = null
    if (playerTotal <= 5) {
      playerThird = draw()
      playerCards.push(playerThird)
      sequence.push({ hand: 'player', card: playerThird })
    }
    playerTotal = handValue(playerCards)

    if (bankerDraws(bankerTotal, playerThird ? cardValue(playerThird) : null)) {
      const b3 = draw()
      bankerCards.push(b3)
      sequence.push({ hand: 'banker', card: b3 })
    }
    bankerTotal = handValue(bankerCards)
  }

  const result: RoundResult =
    playerTotal > bankerTotal ? 'player' : bankerTotal > playerTotal ? 'banker' : 'tie'

  return {
    playerCards,
    bankerCards,
    playerTotal,
    bankerTotal,
    result,
    playerPair: playerCards[0].rank === playerCards[1].rank,
    bankerPair: bankerCards[0].rank === bankerCards[1].rank,
    sequence,
    naturalCheckAt,
  }
}

export const PAYOUT: Record<string, number> = {
  player: 1,
  banker: 0.95,
  tie: 8,
  playerPair: 11,
  bankerPair: 11,
}

export interface Settlement {
  /** net chip change including returned stakes */
  net: number
  /** gross winnings on top of returned winning stakes */
  profit: number
  breakdown: { type: string; stake: number; payout: number; won: boolean; push: boolean }[]
}

/** settle bets given the outcome; tie pushes player/banker stakes */
export function settle(bets: Record<string, number>, o: RoundOutcome): Settlement {
  const s: Settlement = { net: 0, profit: 0, breakdown: [] }
  for (const [type, stake] of Object.entries(bets)) {
    if (!stake) continue
    let won = false
    let push = false
    if (type === 'player') {
      won = o.result === 'player'
      push = o.result === 'tie'
    } else if (type === 'banker') {
      won = o.result === 'banker'
      push = o.result === 'tie'
    } else if (type === 'tie') {
      won = o.result === 'tie'
    } else if (type === 'playerPair') {
      won = o.playerPair
    } else if (type === 'bankerPair') {
      won = o.bankerPair
    }
    if (won) {
      const payout = Math.floor(stake * PAYOUT[type])
      s.net += stake + payout
      s.profit += payout
    } else if (push) {
      s.net += stake
    } else {
      s.net -= stake
    }
    s.breakdown.push({ type, stake, payout: won ? Math.floor(stake * PAYOUT[type]) : 0, won, push })
  }
  return s
}
