import type { PlanItem } from './types.ts'

const SEATED_CURL = 'Seated_Leg_Curl'
const GLUTE_HAM_RAISE = 'Natural_Glute_Ham_Raise'
const LYING_CURL = 'Lying_Leg_Curls'
const WIDE_LEG_PRESS: PlanItem = { exerciseId: 'Custom_Wide_Leg_Press', sets: 3, repMin: 10, repMax: 15, restSec: 120 }
const SINGLE_LEG_RDL: PlanItem = { exerciseId: 'Custom_Single_Arm_DB_RDL', sets: 2, repMin: 10, repMax: 12, restSec: 75 }
const LYING_CURL_SETS = 4

// Seated leg curl -> wide leg press, glute-ham raise -> single-arm dumbbell RDL, and one more lying curl set where
// the seated curl was dropped. Days without those exercises (or already holding the replacements) are unchanged
export function swapLegsBHamstringWork (items: PlanItem[]): PlanItem[] {
  const ids = new Set(items.map(item => item.exerciseId))
  const hasSeatedCurl = ids.has(SEATED_CURL) && !ids.has(WIDE_LEG_PRESS.exerciseId)
  const hasGluteHam = ids.has(GLUTE_HAM_RAISE) && !ids.has(SINGLE_LEG_RDL.exerciseId)

  return items.map(item => {
    if (hasSeatedCurl && item.exerciseId === SEATED_CURL) return { ...WIDE_LEG_PRESS }
    if (hasGluteHam && item.exerciseId === GLUTE_HAM_RAISE) return { ...SINGLE_LEG_RDL }
    if (hasSeatedCurl && item.exerciseId === LYING_CURL && item.sets < LYING_CURL_SETS) return { ...item, sets: LYING_CURL_SETS }
    return item
  })
}
