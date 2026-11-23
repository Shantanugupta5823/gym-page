import { MUSCLE_GROUPS, getMuscleCredits } from '@/lib/muscles'
import { getMainItems } from '@/lib/plan'
import type { MuscleCredits, MuscleGroup } from '@/lib/muscles'
import type { Exercise, PlanDay, PlanItem, Workout, WorkoutSet } from '@/db/types'

export interface MuscleCoverage {
  group: MuscleGroup
  // Credited sets: 1 per set for a primary mover, 0.5 for a secondary one
  done: number
  target: number
  // done / target, capped at 1; 0 when the plan never trains this muscle
  ratio: number
}

export interface Rotation {
  // 1-based count of rotations started with this plan
  number: number
  workouts: Workout[]
  doneDayIds: Set<number>
  isComplete: boolean
}

type CreditLookup = (exerciseId: string) => MuscleCredits

export function makeCreditLookup (exerciseMap: Map<string, Exercise>): CreditLookup {
  const cache = new Map<string, MuscleCredits>()
  return exerciseId => {
    const cached = cache.get(exerciseId)
    if (cached) return cached
    const exercise = exerciseMap.get(exerciseId)
    const credits = exercise ? getMuscleCredits(exercise) : {}
    cache.set(exerciseId, credits)
    return credits
  }
}

// A rotation starts each time the plan's first day is started; workouts from other plans are ignored
export function getCurrentRotation (planDays: PlanDay[], workouts: Workout[]): Rotation {
  const sortedDays = [...planDays].sort((a, b) => a.order - b.order)
  const dayIds = new Set(sortedDays.map(day => day.id))
  const firstDayId = sortedDays[0]?.id
  const planWorkouts = workouts.filter(workout => dayIds.has(workout.planDayId)).sort((a, b) => a.startedAt - b.startedAt)

  let number = 0
  let current: Workout[] = []
  planWorkouts.forEach(workout => {
    if (workout.planDayId === firstDayId || number === 0) {
      number++
      current = []
    }
    current.push(workout)
  })

  const doneDayIds = new Set(current.filter(workout => workout.endedAt !== undefined).map(workout => workout.planDayId))
  return {
    number: Math.max(1, number),
    workouts: current,
    doneDayIds,
    isComplete: sortedDays.length > 0 && sortedDays.every(day => doneDayIds.has(day.id ?? -1))
  }
}

function addCredits (totals: Map<MuscleGroup, number>, credits: MuscleCredits, sets: number): void {
  Object.entries(credits).forEach(([group, credit]) => {
    totals.set(group as MuscleGroup, (totals.get(group as MuscleGroup) ?? 0) + sets * (credit ?? 0))
  })
}

export function getPlanTargets (items: PlanItem[], lookup: CreditLookup): Map<MuscleGroup, number> {
  const totals = new Map<MuscleGroup, number>()
  getMainItems(items).forEach(item => addCredits(totals, lookup(item.exerciseId), item.sets))
  return totals
}

// Target = every working set the plan asks for in one rotation; done = every set ticked off in this rotation
export function getRotationCoverage (planDays: PlanDay[], rotationSets: WorkoutSet[], lookup: CreditLookup): MuscleCoverage[] {
  const targets = getPlanTargets(planDays.flatMap(day => day.items), lookup)
  const done = new Map<MuscleGroup, number>()
  rotationSets.filter(set => set.done).forEach(set => addCredits(done, lookup(set.exerciseId), 1))

  return MUSCLE_GROUPS.map(group => {
    const target = targets.get(group) ?? 0
    const doneCount = done.get(group) ?? 0
    return { group, done: doneCount, target, ratio: target > 0 ? Math.min(1, doneCount / target) : 0 }
  })
}

// The muscles a day trains as a primary mover, strongest first
export function getDayTargets (items: PlanItem[], lookup: CreditLookup): MuscleGroup[] {
  const totals = new Map<MuscleGroup, number>()
  getMainItems(items).forEach(item => {
    Object.entries(lookup(item.exerciseId)).forEach(([group, credit]) => {
      if ((credit ?? 0) >= 1) totals.set(group as MuscleGroup, (totals.get(group as MuscleGroup) ?? 0) + item.sets)
    })
  })
  return MUSCLE_GROUPS.filter(group => totals.has(group)).sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0))
}
