import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildShoe,
  playRound,
  settle,
  CUT_CARD_AT,
  type Settlement,
} from '@/game/baccarat'
import type { BetType, Card, Phase, RoundOutcome, RoundResult } from '@/game/types'
import { sfx, setMuted } from '@/game/sound'

export interface HandCard {
  card: Card
  faceUp: boolean
  key: string
}

export interface HistoryEntry {
  result: RoundResult
  playerTotal: number
  bankerTotal: number
}

export interface Stats {
  rounds: number
  playerWins: number
  bankerWins: number
  ties: number
  bestBalance: number
}

const START_BALANCE = 10000
const SAVE_KEY = 'baccarat-save-v1'

interface Save {
  balance: number
  history: HistoryEntry[]
  stats: Stats
  muted: boolean
}

function loadSave(): Save | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Save
    if (typeof p.balance !== 'number' || !isFinite(p.balance) || p.balance < 0) return null
    if (!Array.isArray(p.history) || !p.stats || typeof p.stats.rounds !== 'number') return null
    return p
  } catch {
    return null
  }
}

const emptyBets = (): Record<BetType, number> => ({
  player: 0,
  banker: 0,
  tie: 0,
  playerPair: 0,
  bankerPair: 0,
})

const DEAL_MS = 520
const FLIP_MS = 300

export function useBaccarat() {
  const saved = useRef<Save | null>(loadSave())

  const [balance, setBalance] = useState(saved.current?.balance ?? START_BALANCE)
  const [bets, setBets] = useState<Record<BetType, number>>(emptyBets)
  const [lastBets, setLastBets] = useState<Record<BetType, number> | null>(null)
  const [phase, setPhase] = useState<Phase>('betting')
  const [playerCards, setPlayerCards] = useState<HandCard[]>([])
  const [bankerCards, setBankerCards] = useState<HandCard[]>([])
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null)
  const [settlement, setSettlement] = useState<Settlement | null>(null)
  const [cardsLeft, setCardsLeft] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>(saved.current?.history ?? [])
  const [stats, setStats] = useState<Stats>(
    saved.current?.stats ?? { rounds: 0, playerWins: 0, bankerWins: 0, ties: 0, bestBalance: saved.current?.balance ?? START_BALANCE },
  )
  const [muted, setMutedState] = useState(saved.current?.muted ?? false)
  const [message, setMessage] = useState('选择筹码，点击区域下注')

  const shoeRef = useRef<Card[]>([])
  const timersRef = useRef<number[]>([])
  const uidRef = useRef(0)

  useEffect(() => {
    setMuted(muted)
  }, [muted])

  // init shoe
  useEffect(() => {
    shoeRef.current = buildShoe()
    setCardsLeft(shoeRef.current.length)
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ balance, history, stats, muted }))
    } catch {
      /* storage full / unavailable — play session-only */
    }
  }, [balance, history, stats, muted])

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0)

  const placeChip = useCallback(
    (type: BetType, denom: number) => {
      if (phase !== 'betting') return
      if (balance < denom) {
        setMessage('筹码不足')
        return
      }
      sfx.chip()
      setBalance((b) => b - denom)
      setBets((prev) => ({ ...prev, [type]: prev[type] + denom }))
      setMessage('点击「发牌」开始这一局')
    },
    [phase, balance],
  )

  const clearBets = useCallback(() => {
    if (phase !== 'betting' || totalBet === 0) return
    sfx.click()
    setBalance((b) => b + totalBet)
    setBets(emptyBets())
    setMessage('选择筹码，点击区域下注')
  }, [phase, totalBet])

  const deal = useCallback(() => {
    if (phase !== 'betting' || totalBet <= 0) return
    sfx.click()
    if (shoeRef.current.length < CUT_CARD_AT) {
      shoeRef.current = buildShoe()
      sfx.shuffle()
    }
    const o = playRound(shoeRef.current)
    setCardsLeft(shoeRef.current.length)
    setOutcome(o)
    setSettlement(null)
    setPlayerCards([])
    setBankerCards([])
    setPhase('dealing')
    setMessage('发牌中…')
    setLastBets({ ...bets })

    const timers = timersRef.current
    o.sequence.forEach((step, i) => {
      const key = `${step.hand}-${i}-${uidRef.current++}`
      timers.push(
        window.setTimeout(() => {
          sfx.deal()
          const hc: HandCard = { card: step.card, faceUp: false, key }
          if (step.hand === 'player') setPlayerCards((p) => [...p, hc])
          else setBankerCards((p) => [...p, hc])
          timers.push(
            window.setTimeout(() => {
              sfx.flip()
              const flipOne = (list: HandCard[]) =>
                list.map((c) => (c.key === key ? { ...c, faceUp: true } : c))
              if (step.hand === 'player') setPlayerCards(flipOne)
              else setBankerCards(flipOne)
            }, FLIP_MS),
          )
        }, 250 + i * DEAL_MS),
      )
    })

    const doneAt = 250 + o.sequence.length * DEAL_MS + FLIP_MS + 420
    timers.push(
      window.setTimeout(() => {
        const s = settle(bets, o)
        setSettlement(s)
        setBalance((b) => {
          const nb = b + s.net
          setStats((prev) => ({
            rounds: prev.rounds + 1,
            playerWins: prev.playerWins + (o.result === 'player' ? 1 : 0),
            bankerWins: prev.bankerWins + (o.result === 'banker' ? 1 : 0),
            ties: prev.ties + (o.result === 'tie' ? 1 : 0),
            bestBalance: Math.max(prev.bestBalance, nb),
          }))
          return nb
        })
        setHistory((h) =>
          [...h, { result: o.result, playerTotal: o.playerTotal, bankerTotal: o.bankerTotal }].slice(-60),
        )
        setPhase('settled')
        if (s.profit > 0) {
          if (s.profit >= 1000) sfx.bigWin()
          else sfx.win()
          setMessage(`本局盈利 +${s.profit}`)
        } else if (s.net === 0 && s.breakdown.some((b) => b.push)) {
          sfx.push()
          setMessage('和局，注码退回')
        } else if (s.net > 0) {
          sfx.push()
          setMessage('收回注码')
        } else {
          sfx.lose()
          setMessage(`本局 ${s.net}`)
        }
      }, doneAt),
    )
  }, [phase, totalBet, bets])

  const nextRound = useCallback(
    (keepBets: boolean) => {
      sfx.click()
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      setPlayerCards([])
      setBankerCards([])
      setOutcome(null)
      setSettlement(null)
      setPhase('betting')
      if (keepBets && lastBets) {
        const sum = Object.values(lastBets).reduce((a, b) => a + b, 0)
        if (sum > 0 && balance >= sum) {
          setBalance((b) => b - sum)
          setBets({ ...lastBets })
          setMessage('已重复上局注码，点击「发牌」')
          return
        }
      }
      setBets(emptyBets())
      setMessage('选择筹码，点击区域下注')
    },
    [balance, lastBets],
  )

  const resetAll = useCallback(() => {
    sfx.click()
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    shoeRef.current = buildShoe()
    setCardsLeft(shoeRef.current.length)
    setBalance(START_BALANCE)
    setBets(emptyBets())
    setLastBets(null)
    setPlayerCards([])
    setBankerCards([])
    setOutcome(null)
    setSettlement(null)
    setHistory([])
    setStats({ rounds: 0, playerWins: 0, bankerWins: 0, ties: 0, bestBalance: START_BALANCE })
    setPhase('betting')
    setMessage('新的一靴，祝你好运')
  }, [])

  const bankrupt = balance <= 0 && totalBet === 0 && phase === 'betting'

  return {
    balance,
    bets,
    totalBet,
    phase,
    playerCards,
    bankerCards,
    outcome,
    settlement,
    cardsLeft,
    history,
    stats,
    muted,
    message,
    bankrupt,
    placeChip,
    clearBets,
    deal,
    nextRound,
    resetAll,
    toggleMute: () => setMutedState((m) => !m),
  }
}
