import { describe, expect, it } from 'vitest'
import { ImportFileError } from '@/lib/errors'
import { PLAN_TEMPLATE, parsePlanFile } from '@/lib/planFile'

const KNOWN = new Set(PLAN_TEMPLATE.days[0].items.map(item => item.exerciseId))

describe('parsePlanFile', () => {
  it('accepts the template', () => {
    expect(parsePlanFile(JSON.stringify(PLAN_TEMPLATE), KNOWN)).toEqual(PLAN_TEMPLATE)
  })

  it('rejects an unknown exercise id and names its position', () => {
    const file = { ...PLAN_TEMPLATE, days: [{ ...PLAN_TEMPLATE.days[0], items: [{ ...PLAN_TEMPLATE.days[0].items[0], exerciseId: 'Nope' }] }] }
    expect(() => parsePlanFile(JSON.stringify(file), KNOWN)).toThrow('Day 1, item 1: unknown exerciseId "Nope"')
  })

  it('rejects repMin above repMax', () => {
    const item = { ...PLAN_TEMPLATE.days[0].items[0], repMin: 12, repMax: 8 }
    const file = { ...PLAN_TEMPLATE, days: [{ ...PLAN_TEMPLATE.days[0], items: [item] }] }
    expect(() => parsePlanFile(JSON.stringify(file), KNOWN)).toThrow('repMin is above repMax')
  })

  it('rejects a bad day type and invalid JSON', () => {
    const file = { ...PLAN_TEMPLATE, days: [{ ...PLAN_TEMPLATE.days[0], type: 'cardio' }] }
    expect(() => parsePlanFile(JSON.stringify(file), KNOWN)).toThrow('"type" must be push, pull, legs or arms')
    expect(() => parsePlanFile('{', KNOWN)).toThrow(ImportFileError)
  })
})
