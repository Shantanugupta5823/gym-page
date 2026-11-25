import { useCallback, useState } from 'react'
import { ExerciseViewer } from '@/components/ExerciseViewer'
import type { Exercise } from '@/db/types'

interface ExerciseImageProps {
  exercise: Exercise | undefined
  className?: string
  // Tapping opens the full-screen viewer with the big photo and the tutorial video
  isZoomable?: boolean
}

const IMAGES_URL = `${import.meta.env.BASE_URL}exercises/images/`

export const ExerciseImage = ({ exercise, className = '', isZoomable = false }: ExerciseImageProps) => {
  const [hasFailed, setHasFailed] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const closeViewer = useCallback(() => setIsViewerOpen(false), [])
  const imagePath = exercise?.images[0]
  const imageUrl = imagePath && !hasFailed ? `${IMAGES_URL}${imagePath}` : null

  const picture = imageUrl
    ? (
      <img
        className={`bg-surface-2 object-cover ${className}`}
        src={imageUrl}
        alt={exercise?.name ?? ''}
        loading="lazy"
        onError={() => setHasFailed(true)}
      />
      )
    : <div className={`flex items-center justify-center bg-surface-2 text-2xl text-muted ${className}`}>🏋</div>

  if (!isZoomable || !exercise) return picture

  return (
    <>
      <button
        className="relative shrink-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-text"
        onClick={() => setIsViewerOpen(true)}
        aria-label={`Show ${exercise.name} bigger, with tutorial`}
      >
        {picture}
        <span className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-[10px] text-white" aria-hidden="true">▶</span>
      </button>
      {isViewerOpen && <ExerciseViewer exercise={exercise} imageUrl={imageUrl} onClose={closeViewer} />}
    </>
  )
}
