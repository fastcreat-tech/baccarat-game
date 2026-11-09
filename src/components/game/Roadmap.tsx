import type { HistoryEntry, Stats } from '@/hooks/useBaccarat'
import { cn } from '@/lib/utils'

const RESULT_STYLE: Record<string, { bg: string; label: string }> = {
  banker: { bg: 'oklch(0.55 0.2 25)', label: '庄' },
  player: { bg: 'oklch(0.5 0.16 240)', label: '闲' },
  tie: { bg: 'oklch(0.55 0.14 155)', label: '和' },
}

/** bead-plate roadmap: fills top→bottom, then left→right */
export function Roadmap({ history, stats }: { history: HistoryEntry[]; stats: Stats }) {
  const COLS = 10
  const ROWS = 4
  const cells: (HistoryEntry | null)[] = Array(COLS * ROWS).fill(null)
  const recent = history.slice(-(COLS * ROWS))
  recent.forEach((h, i) => {
    const col = Math.floor(i / ROWS)
    const row = i % ROWS
    cells[row * COLS + col] = h
  })

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[oklch(0.45_0.05_160/0.5)] bg-[oklch(0.2_0.04_160/0.75)] p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-[0.3em] text-[oklch(0.8_0.12_95)]">路单</h2>
        <span className="text-[0.65rem] text-[oklch(0.65_0.03_160)]">近 {recent.length} 局</span>
      </div>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}
        role="img"
        aria-label="历史路单"
      >
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn(
              'flex aspect-square items-center justify-center rounded-full text-[0.6rem] font-bold',
              c ? 'text-white shadow-md' : 'bg-[oklch(0.3_0.04_160/0.4)]',
            )}
            style={c ? { background: RESULT_STYLE[c.result].bg } : undefined}
            title={c ? `${RESULT_STYLE[c.result].label} ${c.playerTotal}:${c.bankerTotal}` : undefined}
          >
            {c ? RESULT_STYLE[c.result].label : ''}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-[oklch(0.26_0.05_160/0.6)] py-1.5">
          <div className="text-sm font-bold text-[oklch(0.78_0.16_25)]">{stats.bankerWins}</div>
          <div className="text-[0.6rem] text-[oklch(0.65_0.03_160)]">庄赢</div>
        </div>
        <div className="rounded-lg bg-[oklch(0.26_0.05_160/0.6)] py-1.5">
          <div className="text-sm font-bold text-[oklch(0.82_0.12_240)]">{stats.playerWins}</div>
          <div className="text-[0.6rem] text-[oklch(0.65_0.03_160)]">闲赢</div>
        </div>
        <div className="rounded-lg bg-[oklch(0.26_0.05_160/0.6)] py-1.5">
          <div className="text-sm font-bold text-[oklch(0.8_0.12_155)]">{stats.ties}</div>
          <div className="text-[0.6rem] text-[oklch(0.65_0.03_160)]">和局</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[oklch(0.4_0.05_160/0.4)] pt-2 text-[0.7rem] text-[oklch(0.7_0.04_160)]">
        <span>总局数 {stats.rounds}</span>
        <span>
          最高 <span className="font-bold text-[oklch(0.85_0.13_95)]">{stats.bestBalance.toLocaleString()}</span>
        </span>
      </div>
    </div>
  )
}
