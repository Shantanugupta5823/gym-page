import { MUSCLE_GROUPS } from '@/lib/muscles'
import type { MuscleGroup } from '@/lib/muscles'

interface MuscleBarsProps {
  counts: Map<MuscleGroup, number>
}

const TARGET_MIN = 10
const TARGET_MAX = 20

export const MuscleBars = ({ counts }: MuscleBarsProps) => (
  <section className="rounded-2xl bg-surface p-4">
    <h2 className="font-heading text-base font-semibold">Sets per muscle this week</h2>
    <p className="mb-3 text-xs text-muted">Target band {TARGET_MIN}–{TARGET_MAX} sets</p>
    <ul className="flex flex-col gap-2.5">
      {MUSCLE_GROUPS.map(group => {
        const count = counts.get(group) ?? 0
        const isInBand = count >= TARGET_MIN && count <= TARGET_MAX

        return (
          <li key={group} className="flex items-center gap-3 text-sm">
            <span className="w-20 text-muted">{group}</span>
            <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div className="absolute inset-y-0 bg-white/10" style={{ left: `${(TARGET_MIN / TARGET_MAX) * 100}%`, right: 0 }} />
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${isInBand ? 'bg-push' : 'bg-muted'}`}
                style={{ width: `${Math.min(100, (count / TARGET_MAX) * 100)}%` }}
              />
            </div>
            <span className="w-6 text-right font-heading">{count}</span>
          </li>
        )
      })}
    </ul>
  </section>
)
