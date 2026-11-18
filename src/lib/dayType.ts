import type { DayType } from '@/db/types'

interface DayTypeStyle {
  label: string
  text: string
  bg: string
  softBg: string
  border: string
}

export const DAY_TYPES: DayType[] = ['push', 'pull', 'legs']

export const DAY_TYPE_STYLES: Record<DayType, DayTypeStyle> = {
  push: { label: 'Push', text: 'text-push', bg: 'bg-push', softBg: 'bg-push/15', border: 'border-push' },
  pull: { label: 'Pull', text: 'text-pull', bg: 'bg-pull', softBg: 'bg-pull/15', border: 'border-pull' },
  legs: { label: 'Legs', text: 'text-legs', bg: 'bg-legs', softBg: 'bg-legs/15', border: 'border-legs' }
}
