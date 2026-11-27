import { describe, expect, it } from 'vitest'
import { swapLegsBHamstringWork } from '@/db/planMigrations'
import type { PlanItem } from '@/db/types'

const item = (exerciseId: string, sets = 3): PlanItem => ({ exerciseId, sets, repMin: 10, repMax: 12, restSec: 75 })

describe('swapLegsBHamstringWork', () => {
  it('swaps in the wide leg press and back extension in place and adds a lying curl set', () => {
    const legsB = [item('Romanian_Deadlift', 4), item('Lying_Leg_Curls'), item('Seated_Leg_Curl'), item('Natural_Glute_Ham_Raise', 2), item('Seated_Calf_Raise')]
    expect(swapLegsBHamstringWork(legsB).map(entry => `${entry.exerciseId}:${entry.sets}`)).toEqual([
      'Romanian_Deadlift:4', 'Lying_Leg_Curls:4', 'Custom_Wide_Leg_Press:3', 'Custom_Single_Arm_DB_RDL:2', 'Seated_Calf_Raise:3'
    ])
  })

  it('leaves other days, and days already migrated, untouched', () => {
    const pushA = [item('Incline_Dumbbell_Press', 5), item('Butterfly', 2)]
    expect(swapLegsBHamstringWork(pushA)).toEqual(pushA)
    const migrated = swapLegsBHamstringWork([item('Lying_Leg_Curls'), item('Seated_Leg_Curl')])
    expect(swapLegsBHamstringWork(migrated)).toEqual(migrated)
  })

  it('does not lower a lying curl the user already set higher', () => {
    const result = swapLegsBHamstringWork([item('Lying_Leg_Curls', 5), item('Seated_Leg_Curl')])
    expect(result[0].sets).toBe(5)
  })
})
