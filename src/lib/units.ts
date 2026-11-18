import type { Unit } from '@/db/types'

const LB_PER_KG = 2.20462

function roundTo (value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function toDisplayWeight (kg: number, unit: Unit): number {
  return unit === 'lb' ? roundTo(kg * LB_PER_KG, 1) : roundTo(kg, 2)
}

export function fromDisplayWeight (value: number, unit: Unit): number {
  return unit === 'lb' ? roundTo(value / LB_PER_KG, 3) : value
}
