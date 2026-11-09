import { ChipStack } from './Chip'
import { cn } from '@/lib/utils'

export function BetSpot({
  label,
  odds,
  amount,
  onClick,
  disabled,
  tone,
  highlight,
}: {
  label: string
  odds: string
  amount: number
  onClick: () => void
  disabled: boolean
  tone: 'player' | 'banker' | 'tie' | 'pair'
  highlight: boolean
}) {
  const tones: Record<string, string> = {
    player: 'border-[oklch(0.65_0.15_240/0.55)] hover:border-[oklch(0.75_0.15_240/0.9)]',
    banker: 'border-[oklch(0.6_0.2_25/0.55)] hover:border-[oklch(0.7_0.2_25/0.9)]',
    tie: 'border-[oklch(0.6_0.14_155/0.55)] hover:border-[oklch(0.7_0.14_155/0.9)]',
    pair: 'border-[oklch(0.65_0.13_310/0.45)] hover:border-[oklch(0.75_0.13_310/0.8)]',
  }
  const textTone: Record<string, string> = {
    player: 'text-[oklch(0.82_0.12_240)]',
    banker: 'text-[oklch(0.78_0.16_25)]',
    tie: 'text-[oklch(0.8_0.12_155)]',
    pair: 'text-[oklch(0.82_0.1_310)]',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`下注 ${label}`}
      className={cn(
        'group relative flex min-h-[5.5rem] min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border-2 bg-[oklch(0.28_0.06_160/0.55)] px-1 py-2 backdrop-blur-sm transition-all duration-200 md:px-2',
        'cursor-pointer hover:bg-[oklch(0.33_0.07_160/0.6)] active:scale-[0.98]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(0.8_0.15_95)]',
        tones[tone],
        disabled && 'cursor-not-allowed opacity-60 hover:bg-[oklch(0.28_0.06_160/0.55)]',
        amount > 0 && 'border-[oklch(0.8_0.15_95/0.85)] bg-[oklch(0.34_0.08_160/0.7)]',
        highlight && 'bet-win',
      )}
    >
      <span className={cn('text-sm font-bold tracking-widest md:text-base', textTone[tone])}>
        {label}
      </span>
      <span className="text-[0.65rem] text-[oklch(0.75_0.03_160)] md:text-xs">{odds}</span>
      {amount > 0 && (
        <>
          <ChipStack amount={amount} />
          <span className="rounded-full bg-[oklch(0.2_0.03_160/0.85)] px-2 py-0.5 text-[0.7rem] font-bold text-[oklch(0.88_0.12_95)]">
            {amount.toLocaleString()}
          </span>
        </>
      )}
    </button>
  )
}
