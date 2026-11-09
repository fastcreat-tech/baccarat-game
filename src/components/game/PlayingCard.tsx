import { rankLabel } from '@/game/baccarat'
import type { HandCard } from '@/hooks/useBaccarat'
import { cn } from '@/lib/utils'

const SUIT_GLYPH: Record<string, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
}

export function PlayingCard({ hc, index }: { hc: HandCard; index: number }) {
  const red = hc.card.suit === 'hearts' || hc.card.suit === 'diamonds'
  const label = rankLabel(hc.card.rank)
  const glyph = SUIT_GLYPH[hc.card.suit]
  return (
    <div
      className="card-scene animate-deal"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={cn('card-inner', hc.faceUp && 'card-flipped')}>
        {/* back */}
        <div className="card-face card-back" aria-hidden="true">
          <div className="card-back-pattern" />
        </div>
        {/* front */}
        <div
          className={cn(
            'card-face card-front',
            red ? 'text-[oklch(0.5_0.22_25)]' : 'text-[oklch(0.25_0.04_260)]',
          )}
        >
          <div className="flex flex-col items-start leading-none">
            <span className="text-[clamp(0.8rem,2vw,1.05rem)] font-bold">{label}</span>
            <span className="text-[clamp(0.7rem,1.8vw,0.95rem)]">{glyph}</span>
          </div>
          <span className="text-[clamp(1.3rem,3.4vw,2rem)]">{glyph}</span>
          <div className="flex rotate-180 flex-col items-start leading-none">
            <span className="text-[clamp(0.8rem,2vw,1.05rem)] font-bold">{label}</span>
            <span className="text-[clamp(0.7rem,1.8vw,0.95rem)]">{glyph}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
