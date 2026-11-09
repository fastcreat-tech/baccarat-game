import { useState } from 'react'
import { useBaccarat } from '@/hooks/useBaccarat'
import { PlayingCard } from '@/components/game/PlayingCard'
import { Chip, CHIPS } from '@/components/game/Chip'
import { BetSpot } from '@/components/game/BetSpot'
import { Roadmap } from '@/components/game/Roadmap'
import { handValue } from '@/game/baccarat'
import type { BetType } from '@/game/types'
import { cn } from '@/lib/utils'

const RESULT_TEXT: Record<string, string> = {
  player: '闲 赢',
  banker: '庄 赢',
  tie: '和 局',
}

function TotalBadge({ value, visible, label }: { value: number; visible: boolean; label: string }) {
  return (
    <div
      className={cn(
        'flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 border-[oklch(0.75_0.14_95/0.7)] bg-[oklch(0.22_0.04_160/0.9)] shadow-lg transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      aria-label={`${label}点数 ${value}`}
    >
      <span className="text-lg font-black leading-none text-[oklch(0.88_0.12_95)]">{value}</span>
    </div>
  )
}

export default function Home() {
  const g = useBaccarat()
  const [selectedChip, setSelectedChip] = useState(CHIPS[2].denom)

  const betting = g.phase === 'betting'
  const settled = g.phase === 'settled' && g.outcome

  const playerShown = g.playerCards.filter((c) => c.faceUp).map((c) => c.card)
  const bankerShown = g.bankerCards.filter((c) => c.faceUp).map((c) => c.card)
  const showTotals = g.playerCards.length > 0 && g.phase !== 'betting'

  const wonSpot = (type: BetType): boolean => {
    if (!settled || !g.settlement) return false
    return g.settlement.breakdown.some((b) => b.type === type && b.won)
  }

  return (
    <div className="felt min-h-[100dvh] text-[oklch(0.93_0.02_120)]">
      {/* ── header ─────────────────────────────────── */}
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-5 md:px-6">
        <div className="flex items-baseline gap-3">
          <h1 className="font-casino text-2xl font-black tracking-[0.25em] text-[oklch(0.85_0.13_95)] md:text-3xl">
            百家乐
          </h1>
          <span className="text-[0.65rem] uppercase tracking-[0.4em] text-[oklch(0.65_0.06_120)]">
            Baccarat
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="rounded-full border border-[oklch(0.6_0.12_95/0.4)] bg-[oklch(0.2_0.04_160/0.8)] px-4 py-1.5">
            <span className="mr-2 text-[0.65rem] tracking-widest text-[oklch(0.65_0.05_120)]">余额</span>
            <span
              key={g.balance}
              className="animate-balance text-base font-black tabular-nums text-[oklch(0.88_0.13_95)]"
            >
              {g.balance.toLocaleString()}
            </span>
          </div>
          <div className="hidden rounded-full border border-[oklch(0.45_0.05_160/0.5)] bg-[oklch(0.2_0.04_160/0.8)] px-3 py-1.5 text-[0.65rem] text-[oklch(0.7_0.04_160)] sm:block">
            牌靴 {g.cardsLeft}
          </div>
          <button
            type="button"
            onClick={g.toggleMute}
            aria-label={g.muted ? '开启音效' : '静音'}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[oklch(0.45_0.05_160/0.5)] bg-[oklch(0.2_0.04_160/0.8)] text-[oklch(0.75_0.05_120)] transition-colors hover:text-[oklch(0.88_0.13_95)] focus-visible:outline-2 focus-visible:outline-[oklch(0.8_0.15_95)]"
          >
            {g.muted ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
            )}
          </button>
          <button
            type="button"
            onClick={g.resetAll}
            className="cursor-pointer rounded-full border border-[oklch(0.45_0.05_160/0.5)] bg-[oklch(0.2_0.04_160/0.8)] px-3 py-1.5 text-[0.7rem] text-[oklch(0.75_0.05_120)] transition-colors hover:text-[oklch(0.88_0.13_95)] focus-visible:outline-2 focus-visible:outline-[oklch(0.8_0.15_95)]"
          >
            重新开局
          </button>
        </div>
      </header>

      {/* ── main ───────────────────────────────────── */}
      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 md:px-6 lg:grid-cols-[1fr_240px]">
        {/* table */}
        <section className="table-felt relative overflow-hidden rounded-[2rem] border-2 border-[oklch(0.55_0.1_95/0.35)] p-4 shadow-2xl md:p-6">
          {/* shoe decoration */}
          <div className="absolute right-5 top-5 hidden flex-col items-center gap-1 opacity-70 md:flex" aria-hidden="true">
            <div className="h-16 w-12 rotate-6 rounded-md border border-[oklch(0.5_0.05_160/0.6)] bg-[oklch(0.24_0.04_160)] shadow-lg" />
            <span className="text-[0.55rem] tracking-widest text-[oklch(0.6_0.04_160)]">牌靴</span>
          </div>

          {/* banker */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tracking-[0.5em] text-[oklch(0.78_0.16_25)]">庄</span>
              <TotalBadge
                label="庄家"
                value={settled && g.outcome ? g.outcome.bankerTotal : handValue(bankerShown)}
                visible={showTotals && bankerShown.length > 0}
              />
            </div>
            <div className="flex min-h-[6.5rem] items-center gap-2 md:min-h-[7.5rem]">
              {g.bankerCards.map((c, i) => (
                <PlayingCard key={c.key} hc={c} index={i} />
              ))}
            </div>
          </div>

          {/* center banner */}
          <div className="relative my-2 flex h-16 items-center justify-center md:my-3">
            {settled && g.outcome ? (
              <div className="animate-result flex flex-col items-center">
                <span
                  className={cn(
                    'font-casino text-3xl font-black tracking-[0.3em] md:text-4xl',
                    g.outcome.result === 'banker' && 'text-[oklch(0.75_0.18_25)]',
                    g.outcome.result === 'player' && 'text-[oklch(0.78_0.14_240)]',
                    g.outcome.result === 'tie' && 'text-[oklch(0.78_0.14_155)]',
                  )}
                >
                  {RESULT_TEXT[g.outcome.result]}
                </span>
                {g.settlement && g.settlement.profit > 0 && (
                  <span className="mt-1 text-sm font-bold tracking-widest text-[oklch(0.88_0.13_95)]">
                    +{g.settlement.profit.toLocaleString()}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-center text-xs tracking-[0.25em] text-[oklch(0.7_0.05_140)] md:text-sm">
                {g.message}
              </p>
            )}
          </div>

          {/* player */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex min-h-[6.5rem] items-center gap-2 md:min-h-[7.5rem]">
              {g.playerCards.map((c, i) => (
                <PlayingCard key={c.key} hc={c} index={i} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <TotalBadge
                label="闲家"
                value={settled && g.outcome ? g.outcome.playerTotal : handValue(playerShown)}
                visible={showTotals && playerShown.length > 0}
              />
              <span className="text-sm font-bold tracking-[0.5em] text-[oklch(0.82_0.12_240)]">闲</span>
            </div>
          </div>

          {/* betting spots */}
          <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.35fr) minmax(0,1.35fr) minmax(0,1.35fr) minmax(0,1fr)' }}>
            <BetSpot label="闲对" odds="1 赔 11" amount={g.bets.playerPair} onClick={() => g.placeChip('playerPair', selectedChip)} disabled={!betting} tone="pair" highlight={wonSpot('playerPair')} />
            <BetSpot label="闲" odds="1 赔 1" amount={g.bets.player} onClick={() => g.placeChip('player', selectedChip)} disabled={!betting} tone="player" highlight={wonSpot('player')} />
            <BetSpot label="和" odds="1 赔 8" amount={g.bets.tie} onClick={() => g.placeChip('tie', selectedChip)} disabled={!betting} tone="tie" highlight={wonSpot('tie')} />
            <BetSpot label="庄" odds="1 赔 0.95" amount={g.bets.banker} onClick={() => g.placeChip('banker', selectedChip)} disabled={!betting} tone="banker" highlight={wonSpot('banker')} />
            <BetSpot label="庄对" odds="1 赔 11" amount={g.bets.bankerPair} onClick={() => g.placeChip('bankerPair', selectedChip)} disabled={!betting} tone="pair" highlight={wonSpot('bankerPair')} />
          </div>
        </section>

        {/* sidebar */}
        <aside className="flex flex-col gap-4">
          <Roadmap history={g.history} stats={g.stats} />
          <div className="rounded-2xl border border-[oklch(0.45_0.05_160/0.5)] bg-[oklch(0.2_0.04_160/0.75)] p-4 text-[0.7rem] leading-relaxed text-[oklch(0.7_0.04_160)] backdrop-blur-md">
            <h2 className="mb-1.5 text-xs font-bold tracking-[0.3em] text-[oklch(0.8_0.12_95)]">规则</h2>
            8 副牌靴。A 计 1 点，10/J/Q/K 计 0 点，取总和个位数。闲 ≤5 点补牌；庄家按补牌表行动。任意一方首两张 8/9 点即天生赢家。庄赢抽 5% 水，和局退回闲庄注码。
          </div>
        </aside>
      </main>

      {/* ── controls ───────────────────────────────── */}
      <footer className="sticky bottom-0 z-10 border-t border-[oklch(0.45_0.05_160/0.4)] bg-[oklch(0.16_0.03_160/0.92)] backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-end gap-2 md:gap-3" role="group" aria-label="选择筹码面额">
            {CHIPS.map((c) => (
              <Chip
                key={c.denom}
                def={c}
                selected={selectedChip === c.denom}
                disabled={!betting}
                onClick={() => setSelectedChip(c.denom)}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {betting && (
              <>
                <button
                  type="button"
                  onClick={g.clearBets}
                  disabled={g.totalBet === 0}
                  className="cursor-pointer rounded-full border border-[oklch(0.55_0.05_160/0.6)] px-4 py-2.5 text-sm font-bold text-[oklch(0.8_0.05_140)] transition-all hover:bg-[oklch(0.3_0.05_160/0.5)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[oklch(0.8_0.15_95)]"
                >
                  清除
                </button>
                <button
                  type="button"
                  onClick={g.deal}
                  disabled={g.totalBet === 0}
                  className="cursor-pointer rounded-full bg-gradient-to-b from-[oklch(0.85_0.15_95)] to-[oklch(0.68_0.15_80)] px-7 py-2.5 text-sm font-black tracking-[0.3em] text-[oklch(0.2_0.04_90)] shadow-[0_4px_16px_oklch(0.7_0.15_90/0.4)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  发牌
                </button>
              </>
            )}
            {g.phase === 'settled' && (
              <>
                <button
                  type="button"
                  onClick={() => g.nextRound(true)}
                  disabled={g.bankrupt}
                  className="cursor-pointer rounded-full border border-[oklch(0.7_0.13_95/0.6)] px-4 py-2.5 text-sm font-bold text-[oklch(0.85_0.12_95)] transition-all hover:bg-[oklch(0.3_0.05_160/0.5)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[oklch(0.8_0.15_95)]"
                >
                  重复下注
                </button>
                <button
                  type="button"
                  onClick={() => g.nextRound(false)}
                  className="cursor-pointer rounded-full bg-gradient-to-b from-[oklch(0.85_0.15_95)] to-[oklch(0.68_0.15_80)] px-7 py-2.5 text-sm font-black tracking-[0.3em] text-[oklch(0.2_0.04_90)] shadow-[0_4px_16px_oklch(0.7_0.15_90/0.4)] transition-all hover:brightness-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  下一局
                </button>
              </>
            )}
            {g.phase === 'dealing' && (
              <span className="px-4 py-2.5 text-xs tracking-[0.3em] text-[oklch(0.7_0.05_140)]">发牌中…</span>
            )}
          </div>
        </div>
      </footer>

      {/* ── bankrupt overlay ───────────────────────── */}
      {g.bankrupt && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-[oklch(0.12_0.02_160/0.85)] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="筹码耗尽"
        >
          <div className="animate-result mx-4 flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-[oklch(0.6_0.12_95/0.5)] bg-[oklch(0.22_0.04_160)] p-8 text-center shadow-2xl">
            <span className="font-casino text-3xl font-black tracking-[0.2em] text-[oklch(0.85_0.13_95)]">
              筹码耗尽
            </span>
            <p className="text-sm leading-relaxed text-[oklch(0.75_0.05_140)]">
              这一靴打完了。重整旗鼓，再来一局？
            </p>
            <button
              type="button"
              onClick={g.resetAll}
              autoFocus
              className="cursor-pointer rounded-full bg-gradient-to-b from-[oklch(0.85_0.15_95)] to-[oklch(0.68_0.15_80)] px-8 py-3 text-sm font-black tracking-[0.3em] text-[oklch(0.2_0.04_90)] transition-all hover:brightness-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              领取 10,000 筹码
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
