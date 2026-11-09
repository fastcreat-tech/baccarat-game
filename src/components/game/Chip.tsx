import { cn } from '@/lib/utils'

export interface ChipDef {
  denom: number
  /** outer ring color */
  ring: string
  /** inner face color */
  face: string
  label?: string
}

export const CHIPS: ChipDef[] = [
  { denom: 5, ring: 'oklch(0.55 0.2 25)', face: 'oklch(0.94 0.02 25)' },
  { denom: 25, ring: 'oklch(0.5 0.15 155)', face: 'oklch(0.93 0.03 155)' },
  { denom: 100, ring: 'oklch(0.35 0.08 265)', face: 'oklch(0.9 0.03 265)' },
  { denom: 500, ring: 'oklch(0.45 0.18 310)', face: 'oklch(0.92 0.03 310)' },
  { denom: 1000, ring: 'oklch(0.72 0.16 85)', face: 'oklch(0.95 0.05 95)' },
]

export function chipColor(denom: number): ChipDef {
  // nearest defined color, cycling for big stacks
  const exact = CHIPS.find((c) => c.denom === denom)
  if (exact) return exact
  return CHIPS[Math.abs(Math.floor(Math.log10(Math.max(1, denom)))) % CHIPS.length]
}

export function Chip({
  def,
  selected,
  disabled,
  onClick,
  size = 'md',
}: {
  def: ChipDef
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  size?: 'md' | 'sm'
}) {
  const dim = size === 'sm' ? 'h-9 w-9 text-[0.6rem]' : 'h-14 w-14 text-xs md:h-16 md:w-16 md:text-sm'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`筹码 ${def.denom}`}
      className={cn(
        'chip relative shrink-0 rounded-full font-bold transition-transform duration-150',
        dim,
        'cursor-pointer hover:-translate-y-1.5 active:translate-y-0 active:scale-95',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(0.8_0.15_95)]',
        disabled && 'cursor-not-allowed opacity-35 hover:translate-y-0',
        selected && '-translate-y-2',
      )}
      style={{
        background: `repeating-conic-gradient(${def.ring} 0deg 30deg, oklch(0.96 0.01 90) 30deg 45deg, ${def.ring} 45deg 90deg)`,
        boxShadow: selected
          ? '0 10px 22px oklch(0 0 0 / 0.5), 0 0 0 3px oklch(0.8 0.15 95 / 0.9)'
          : '0 5px 12px oklch(0 0 0 / 0.45)',
      }}
    >
      <span
        className="absolute inset-[18%] flex items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, oklch(1 0 0 / 0.85), ${def.face} 45%, ${def.face})`,
          color: def.ring,
          boxShadow: `inset 0 0 0 2px ${def.ring}`,
        }}
      >
        {def.denom >= 1000 ? `${def.denom / 1000}K` : def.denom}
      </span>
    </button>
  )
}

/** stacked chips visual for a bet spot */
export function ChipStack({ amount }: { amount: number }) {
  // break amount into chip denominations, show up to 5
  const parts: number[] = []
  let rest = amount
  const denoms = [1000, 500, 100, 25, 5]
  for (const d of denoms) {
    while (rest >= d && parts.length < 5) {
      parts.push(d)
      rest -= d
    }
  }
  if (parts.length === 0) return null
  return (
    <div className="relative flex h-12 items-end justify-center">
      {parts.map((d, i) => {
        const def = chipColor(d)
        return (
          <span
            key={i}
            className="absolute h-8 w-8 rounded-full"
            style={{
              bottom: `${i * 5}px`,
              background: `repeating-conic-gradient(${def.ring} 0deg 30deg, oklch(0.96 0.01 90) 30deg 45deg, ${def.ring} 45deg 90deg)`,
              boxShadow: '0 3px 6px oklch(0 0 0 / 0.45)',
            }}
          >
            <span
              className="absolute inset-[20%] rounded-full"
              style={{ background: def.face, boxShadow: `inset 0 0 0 1.5px ${def.ring}` }}
            />
          </span>
        )
      })}
    </div>
  )
}
