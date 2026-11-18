import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sheet } from '@/components/Sheet'
import { useNow } from '@/lib/useNow'
import { useSettings } from '@/db/settings'
import { DAY_TYPE_STYLES } from '@/lib/dayType'
import { formatDuration } from '@/lib/dates'
import { RestTimer } from '@/components/workout/RestTimer'
import { ExercisePicker } from '@/components/ExercisePicker'
import { ExerciseCard } from '@/components/workout/ExerciseCard'
import { useExerciseMap, useWorkoutSets } from '@/db/queries'
import { discardWorkout, finishWorkout, setWorkoutNotes, skipExercise, swapExercise } from '@/db/workouts'
import type { Workout } from '@/db/types'

interface ActiveSessionProps {
  workout: Workout
}

interface RestState {
  endsAt: number
  totalSec: number
}

type MenuView = 'closed' | 'menu' | 'swap' | 'note'

const TICK_MS = 250
const MS_PER_SECOND = 1000
const VIBRATE_PATTERN_MS = [300, 150, 300]
const EXTRA_REST_SEC = 30

export const ActiveSession = ({ workout }: ActiveSessionProps) => {
  const navigate = useNavigate()
  const now = useNow(TICK_MS)
  const { unit, increment } = useSettings()
  const exerciseMap = useExerciseMap()
  const sets = useWorkoutSets(workout.id)
  const [pickedIndex, setPickedIndex] = useState<number | null>(null)
  const [rest, setRest] = useState<RestState | null>(null)
  const [menuView, setMenuView] = useState<MenuView>('closed')
  const [noteText, setNoteText] = useState(workout.notes ?? '')

  const workoutId = workout.id ?? 0
  const style = DAY_TYPE_STYLES[workout.dayType]
  const isRestOver = rest !== null && now >= rest.endsAt

  // Vibrate once when the rest countdown reaches zero
  useEffect(() => {
    if (!isRestOver) return
    navigator.vibrate?.(VIBRATE_PATTERN_MS)
    setRest(null)
  }, [isRestOver])

  if (!sets) return null

  const setsFor = (exerciseId: string) => sets.filter(set => set.exerciseId === exerciseId)
  const isItemDone = (exerciseId: string) => {
    const itemSets = setsFor(exerciseId)
    return itemSets.length > 0 && itemSets.every(set => set.done)
  }
  const firstOpenIndex = Math.max(0, workout.items.findIndex(item => !isItemDone(item.exerciseId)))
  const currentIndex = Math.min(pickedIndex ?? firstOpenIndex, workout.items.length - 1)
  const currentItem = workout.items[currentIndex]
  const doneCount = workout.items.filter(item => isItemDone(item.exerciseId)).length
  const elapsedSec = (now - workout.startedAt) / MS_PER_SECOND

  async function handleFinish (): Promise<void> {
    const loggedCount = sets?.filter(set => set.done).length ?? 0
    const openCount = (sets?.length ?? 0) - loggedCount
    const message = loggedCount === 0
      ? 'No sets logged. Discard this workout?'
      : openCount > 0 ? `${openCount} sets are not done and will be removed. Finish?` : ''
    if (message && !window.confirm(message)) return

    await finishWorkout(workoutId)
    navigate('/')
  }

  async function handleDiscard (): Promise<void> {
    if (!window.confirm('Discard this workout and all its sets?')) return
    await discardWorkout(workoutId)
    navigate('/')
  }

  async function handleSkip (): Promise<void> {
    if (!window.confirm('Skip this exercise?')) return
    setMenuView('closed')
    await skipExercise(workoutId, currentIndex)
  }

  return (
    <main className="flex flex-col gap-4 p-5">
      <header className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>{style.label}</p>
          <h1 className="font-heading text-2xl font-semibold">{workout.dayName}</h1>
          <p className="font-heading text-sm text-muted">{formatDuration(elapsedSec)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="min-h-11 min-w-11 rounded-xl bg-surface text-xl" onClick={() => setMenuView('menu')} aria-label="More">⋯</button>
          <button className={`min-h-11 rounded-xl px-4 font-semibold text-bg ${style.bg}`} onClick={handleFinish}>Finish</button>
        </div>
      </header>

      <div>
        <p className="mb-1.5 text-xs text-muted">Exercise {currentIndex + 1} of {workout.items.length} · {doneCount} done</p>
        <div className="flex gap-1">
          {workout.items.map((item, index) => (
            <button
              key={item.exerciseId}
              className="h-3 flex-1 py-1"
              onClick={() => setPickedIndex(index)}
              aria-label={`Exercise ${index + 1}`}
            >
              <span className={`block h-1.5 rounded-full ${isItemDone(item.exerciseId) ? style.bg : index === currentIndex ? 'bg-text' : 'bg-surface-2'}`} />
            </button>
          ))}
        </div>
      </div>

      {currentItem
        ? (
          <ExerciseCard
            key={currentItem.exerciseId}
            workoutId={workoutId}
            item={currentItem}
            exercise={exerciseMap.get(currentItem.exerciseId)}
            sets={setsFor(currentItem.exerciseId)}
            unit={unit}
            increment={increment}
            accentBg={style.bg}
            onSetDone={() => setRest({ endsAt: Date.now() + currentItem.restSec * MS_PER_SECOND, totalSec: currentItem.restSec })}
          />
        )
        : <p className="py-10 text-center text-muted">No exercises left. Tap Finish to save.</p>}

      <div className="flex gap-2">
        <button className="min-h-11 flex-1 rounded-xl bg-surface text-sm disabled:opacity-40" disabled={currentIndex === 0} onClick={() => setPickedIndex(currentIndex - 1)}>
          ← Previous
        </button>
        <button className="min-h-11 flex-1 rounded-xl bg-surface text-sm disabled:opacity-40" disabled={currentIndex >= workout.items.length - 1} onClick={() => setPickedIndex(currentIndex + 1)}>
          Next →
        </button>
      </div>

      <section>
        <h2 className="mb-2 font-heading text-base font-semibold">Up next</h2>
        <ul className="flex flex-col gap-2">
          {workout.items.map((item, index) => index === currentIndex ? null : (
            <li key={item.exerciseId}>
              <button className="flex min-h-12 w-full items-center justify-between rounded-xl bg-surface px-3 text-left text-sm" onClick={() => setPickedIndex(index)}>
                <span className={isItemDone(item.exerciseId) ? 'text-muted line-through' : ''}>{exerciseMap.get(item.exerciseId)?.name ?? item.exerciseId}</span>
                <span className="text-xs text-muted">{setsFor(item.exerciseId).filter(set => set.done).length}/{setsFor(item.exerciseId).length}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {rest && (
        <RestTimer
          endsAt={rest.endsAt}
          totalSec={rest.totalSec}
          now={now}
          accentBg={style.bg}
          onAddTime={() => setRest({ endsAt: rest.endsAt + EXTRA_REST_SEC * MS_PER_SECOND, totalSec: rest.totalSec + EXTRA_REST_SEC })}
          onSkip={() => setRest(null)}
        />
      )}

      {menuView === 'menu' && (
        <Sheet title="Exercise options" onClose={() => setMenuView('closed')}>
          <div className="flex flex-col gap-2">
            <button className="min-h-12 rounded-xl bg-surface-2 text-left px-4" onClick={() => setMenuView('swap')}>Swap exercise</button>
            <button className="min-h-12 rounded-xl bg-surface-2 text-left px-4" onClick={() => setMenuView('note')}>Add workout note</button>
            <button className="min-h-12 rounded-xl bg-surface-2 text-left px-4" onClick={handleSkip}>Skip exercise</button>
            <button className="min-h-12 rounded-xl bg-surface-2 text-left px-4 text-red-400" onClick={handleDiscard}>Discard workout</button>
          </div>
        </Sheet>
      )}

      {menuView === 'swap' && (
        <ExercisePicker
          excludeIds={workout.items.map(item => item.exerciseId)}
          onClose={() => setMenuView('closed')}
          onPick={async exercise => {
            setMenuView('closed')
            await swapExercise(workoutId, currentIndex, exercise.id, increment)
          }}
        />
      )}

      {menuView === 'note' && (
        <Sheet title="Workout note" onClose={() => setMenuView('closed')}>
          <textarea className="min-h-28 w-full rounded-xl border border-border bg-surface-2 p-3" value={noteText} onChange={event => setNoteText(event.target.value)} />
          <button
            className={`mt-3 min-h-12 w-full rounded-xl font-semibold text-bg ${style.bg}`}
            onClick={async () => {
              await setWorkoutNotes(workoutId, noteText)
              setMenuView('closed')
            }}
          >
            Save note
          </button>
        </Sheet>
      )}
    </main>
  )
}
