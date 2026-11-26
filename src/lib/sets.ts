import type { Exercise } from '@/db/types'

export type SetProblem = 'weight' | 'reps' | null

// Bodyweight moves (pull-ups, dips, leg raises...) may be logged at 0 kg meaning "no added weight"
export function isBodyweight (exercise: Pick<Exercise, 'equipment'> | undefined): boolean {
  return exercise?.equipment === 'body only'
}

// A set can only be ticked off with reps, and with a weight unless the exercise is bodyweight
export function getSetProblem (weight: number, reps: number, exercise: Pick<Exercise, 'equipment'> | undefined): SetProblem {
  if (!(weight > 0) && !isBodyweight(exercise)) return 'weight'
  if (!(reps > 0)) return 'reps'
  return null
}

// Parses what is typed in a number box; null when it is not a valid non-negative number
export function parseNumberInput (text: string): number | null {
  const parsed = Number(text.replace(',', '.'))
  if (text.trim() === '' || Number.isNaN(parsed) || parsed < 0) return null
  return parsed
}
