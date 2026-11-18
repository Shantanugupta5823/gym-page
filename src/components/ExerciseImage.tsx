import { useState } from 'react'
import type { Exercise } from '@/db/types'

interface ExerciseImageProps {
  exercise: Exercise | undefined
  className?: string
}

const IMAGES_URL = `${import.meta.env.BASE_URL}exercises/images/`

export const ExerciseImage = ({ exercise, className = '' }: ExerciseImageProps) => {
  const [hasFailed, setHasFailed] = useState(false)
  const imagePath = exercise?.images[0]

  if (!imagePath || hasFailed) {
    return <div className={`flex items-center justify-center bg-surface-2 text-2xl text-muted ${className}`}>🏋</div>
  }

  return (
    <img
      className={`bg-surface-2 object-cover ${className}`}
      src={`${IMAGES_URL}${imagePath}`}
      alt={exercise?.name ?? ''}
      loading="lazy"
      onError={() => setHasFailed(true)}
    />
  )
}
