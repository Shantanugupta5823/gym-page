import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { TutorialPlayer } from '@/components/TutorialPlayer'
import { setSetting, useSettings } from '@/db/settings'
import { getTutorialId, parseYouTubeId, TUTORIAL_VIDEOS } from '@/db/tutorials'
import { capitalize } from '@/lib/plan'
import type { Exercise } from '@/db/types'

interface ExerciseViewerProps {
  exercise: Exercise
  imageUrl: string | null
  onClose: () => void
}

type View = 'photo' | 'video'

// Full-screen view of an exercise: large photo, how-to steps, and the tutorial video played in the app
export const ExerciseViewer = ({ exercise, imageUrl, onClose }: ExerciseViewerProps) => {
  const settings = useSettings()
  const videoId = getTutorialId(exercise.id, settings.tutorialVideos)
  const [view, setView] = useState<View>(imageUrl || !videoId ? 'photo' : 'video')
  const [isEditingLink, setIsEditingLink] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkError, setLinkError] = useState('')
  const hasCustomVideo = settings.tutorialVideos[exercise.id] !== undefined

  // The phone's back button closes the viewer instead of leaving the screen
  useEffect(() => {
    window.history.pushState({ exerciseViewer: true }, '')
    const onPop = () => onClose()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') window.history.back() }
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  const close = () => window.history.back()
  const showLinkEditor = useCallback(() => setIsEditingLink(true), [])

  async function saveLink (): Promise<void> {
    const id = parseYouTubeId(linkText)
    if (!id) {
      setLinkError('That is not a YouTube or Shorts link')
      return
    }
    await setSetting('tutorialVideos', { ...settings.tutorialVideos, [exercise.id]: id })
    setIsEditingLink(false)
    setLinkText('')
    setLinkError('')
    setView('video')
  }

  async function resetLink (): Promise<void> {
    const { [exercise.id]: _removed, ...rest } = settings.tutorialVideos
    await setSetting('tutorialVideos', rest)
    setIsEditingLink(false)
  }

  const tabClass = (isActive: boolean) =>
    `min-h-11 flex-1 rounded-xl text-sm font-semibold ${isActive ? 'bg-text text-bg' : 'text-muted'}`

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={exercise.name} className="fixed inset-0 z-[60] overflow-y-auto bg-bg">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-4 p-5 pb-10">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading text-2xl font-semibold leading-tight">{exercise.name}</h2>
            <p className="mt-1 text-sm text-muted">{exercise.primaryMuscles.map(capitalize).join(', ')}</p>
          </div>
          <button
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-2 text-lg"
            onClick={close}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="flex gap-1 rounded-2xl bg-surface p-1">
          <button className={tabClass(view === 'photo')} onClick={() => setView('photo')}>Photo</button>
          <button className={tabClass(view === 'video')} onClick={() => setView('video')}>▶ Tutorial</button>
        </div>

        {view === 'photo' && (
          imageUrl
            ? <img src={imageUrl} alt={exercise.name} className="max-h-[60dvh] w-full rounded-2xl bg-surface-2 object-contain" />
            : <div className="flex h-64 items-center justify-center rounded-2xl bg-surface-2 text-5xl">🏋</div>
        )}

        {view === 'video' && (
          <section className="flex flex-col gap-3">
            {videoId
              ? <TutorialPlayer key={videoId} videoId={videoId} onUnavailable={showLinkEditor} />
              : <p className="rounded-2xl bg-surface p-4 text-sm text-muted">No tutorial yet for this exercise. Paste a YouTube or Shorts link below.</p>}

            {isEditingLink || !videoId
              ? (
                <div className="flex flex-col gap-2 rounded-2xl bg-surface p-3">
                  <label className="text-xs text-muted" htmlFor="tutorial-link">YouTube or Shorts link (Share → Copy link)</label>
                  <input
                    id="tutorial-link"
                    className="min-h-11 rounded-xl border border-border bg-surface-2 px-3 text-base"
                    inputMode="url"
                    placeholder="https://youtube.com/shorts/…"
                    value={linkText}
                    onChange={event => { setLinkText(event.target.value); setLinkError('') }}
                  />
                  {linkError && <p role="alert" className="text-xs font-semibold text-red-400">{linkError}</p>}
                  <div className="flex gap-2">
                    <button className="min-h-11 flex-1 rounded-xl bg-push font-semibold text-bg" onClick={saveLink}>Save video</button>
                    {videoId && <button className="min-h-11 flex-1 rounded-xl bg-surface-2 text-sm" onClick={() => setIsEditingLink(false)}>Cancel</button>}
                  </div>
                </div>
                )
              : (
                <div className="flex justify-center gap-4 text-sm">
                  <button className="min-h-11 text-muted underline-offset-4 hover:underline" onClick={showLinkEditor}>Use a different video</button>
                  {hasCustomVideo && TUTORIAL_VIDEOS[exercise.id] && (
                    <button className="min-h-11 text-muted underline-offset-4 hover:underline" onClick={resetLink}>Back to default</button>
                  )}
                </div>
                )}
          </section>
        )}

        {exercise.instructions.length > 0 && (
          <section className="rounded-2xl bg-surface p-4">
            <h3 className="mb-2 font-heading text-base font-semibold">How to do it</h3>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-muted">
              {exercise.instructions.map(step => <li key={step}>{step}</li>)}
            </ol>
          </section>
        )}
      </div>
    </div>,
    document.body
  )
}
