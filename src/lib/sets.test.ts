import { describe, expect, it } from 'vitest'
import { getSetProblem, parseNumberInput } from '@/lib/sets'

const barbell = { equipment: 'barbell' }
const bodyweight = { equipment: 'body only' }

describe('getSetProblem', () => {
  it('blocks a weighted exercise with no weight', () => {
    expect(getSetProblem(0, 10, barbell)).toBe('weight')
  })

  it('lets bodyweight exercises be logged at 0 kg', () => {
    expect(getSetProblem(0, 10, bodyweight)).toBeNull()
  })

  it('always needs reps', () => {
    expect(getSetProblem(60, 0, barbell)).toBe('reps')
    expect(getSetProblem(0, 0, bodyweight)).toBe('reps')
  })

  it('accepts a normal set, and treats an unknown exercise as weighted', () => {
    expect(getSetProblem(62.5, 8, barbell)).toBeNull()
    expect(getSetProblem(0, 8, undefined)).toBe('weight')
  })
})

describe('parseNumberInput', () => {
  it('reads decimals with a comma or a dot and rejects junk', () => {
    expect(parseNumberInput('62,5')).toBe(62.5)
    expect(parseNumberInput(' 40 ')).toBe(40)
    expect(parseNumberInput('')).toBeNull()
    expect(parseNumberInput('abc')).toBeNull()
    expect(parseNumberInput('-5')).toBeNull()
  })
})
