import { ImportFileError } from '@/lib/errors'
import { DAY_TYPES } from '@/lib/dayType'
import type { DayType, ItemPhase, PlanItem } from '@/db/types'

export interface PlanFileDay {
  name: string
  type: DayType
  items: PlanItem[]
}

export interface PlanFile {
  version: 1
  name?: string
  days: PlanFileDay[]
}

const PLAN_FILE_VERSION = 1
const ITEM_PHASES: ItemPhase[] = ['warmup', 'stretch']
const MAIN_NUMBER_FIELDS = ['sets', 'repMin', 'repMax', 'restSec'] as const
const PREP_NUMBER_FIELDS = ['sets', 'repMin', 'repMax'] as const

export const PLAN_TEMPLATE: PlanFile = {
  version: PLAN_FILE_VERSION,
  name: 'Four-day rotation',
  days: [
    {
      name: 'Push',
      type: 'push',
      items: [
        { exerciseId: 'Arm_Circles', sets: 1, repMin: 30, repMax: 30, restSec: 0, phase: 'warmup' },
        { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 3, repMin: 8, repMax: 12, restSec: 150 },
        { exerciseId: 'Triceps_Pushdown', sets: 2, repMin: 12, repMax: 15, restSec: 90 },
        { exerciseId: 'Behind_Head_Chest_Stretch', sets: 2, repMin: 30, repMax: 30, restSec: 0, phase: 'stretch' }
      ]
    }
  ]
}

function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPositiveInt (value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

// Parses and validates a plan file; every problem is reported with its day/item position
export function parsePlanFile (text: string, knownExerciseIds: Set<string>): PlanFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ImportFileError('The file is not valid JSON')
  }
  if (!isRecord(parsed) || parsed.version !== PLAN_FILE_VERSION) throw new ImportFileError('Expected { "version": 1, "days": [...] }')
  if (!Array.isArray(parsed.days) || parsed.days.length === 0) throw new ImportFileError('"days" must be a non-empty list')

  const days = parsed.days.map((rawDay: unknown, dayIndex: number): PlanFileDay => {
    const where = `Day ${dayIndex + 1}`
    if (!isRecord(rawDay)) throw new ImportFileError(`${where} must be an object`)
    if (typeof rawDay.name !== 'string' || rawDay.name.trim() === '') throw new ImportFileError(`${where}: "name" is required`)
    if (!DAY_TYPES.includes(rawDay.type as DayType)) throw new ImportFileError(`${where}: "type" must be push, pull, legs or arms`)
    if (!Array.isArray(rawDay.items) || rawDay.items.length === 0) throw new ImportFileError(`${where}: "items" must be a non-empty list`)

    const items = rawDay.items.map((rawItem: unknown, itemIndex: number): PlanItem => {
      const itemWhere = `${where}, item ${itemIndex + 1}`
      if (!isRecord(rawItem)) throw new ImportFileError(`${itemWhere} must be an object`)
      if (typeof rawItem.exerciseId !== 'string' || !knownExerciseIds.has(rawItem.exerciseId)) {
        throw new ImportFileError(`${itemWhere}: unknown exerciseId "${String(rawItem.exerciseId)}"`)
      }
      if (rawItem.phase !== undefined && !ITEM_PHASES.includes(rawItem.phase as ItemPhase)) {
        throw new ImportFileError(`${itemWhere}: "phase" must be warmup or stretch`)
      }
      const phase = rawItem.phase as ItemPhase | undefined
      const badField = (phase ? PREP_NUMBER_FIELDS : MAIN_NUMBER_FIELDS).find(field => !isPositiveInt(rawItem[field]))
      if (badField) throw new ImportFileError(`${itemWhere}: "${badField}" must be a whole number above 0`)
      if ((rawItem.repMin as number) > (rawItem.repMax as number)) throw new ImportFileError(`${itemWhere}: repMin is above repMax`)
      return {
        exerciseId: rawItem.exerciseId,
        sets: rawItem.sets as number,
        repMin: rawItem.repMin as number,
        repMax: rawItem.repMax as number,
        restSec: phase ? 0 : rawItem.restSec as number,
        ...(phase ? { phase } : {})
      }
    })
    return { name: rawDay.name.trim(), type: rawDay.type as DayType, items }
  })

  const name = typeof parsed.name === 'string' && parsed.name.trim() !== '' ? parsed.name.trim() : undefined
  return { version: PLAN_FILE_VERSION, ...(name ? { name } : {}), days }
}
