import { useNavigate } from 'react-router-dom'
import { useSettings } from '@/db/settings'
import { startWorkout } from '@/db/workouts'
import type { PlanDay } from '@/db/types'

export function useStartWorkout (): (day: PlanDay) => Promise<void> {
  const navigate = useNavigate()
  const { increment } = useSettings()

  return async day => {
    await startWorkout(day, increment)
    navigate('/workout')
  }
}
