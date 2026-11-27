import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useActiveWorkout } from '@/db/queries'

const UPDATE_CHECK_MS = 15 * 60_000

// An installed app resumed from the background never reloads, so the browser never looks for a new version.
// Check when the app comes back into view and every 15 minutes; apply the update right away unless a workout
// is open (reloading mid-set would interrupt it), in which case ask first
export const UpdateToast = () => {
  const activeWorkout = useActiveWorkout()
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW (_url, registration) {
      if (!registration) return
      const check = () => {
        if (navigator.onLine) registration.update().catch(() => undefined)
      }
      setInterval(check, UPDATE_CHECK_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
    }
  })

  const isWorkoutOpen = activeWorkout !== undefined && activeWorkout !== null

  useEffect(() => {
    if (needRefresh && activeWorkout === null) updateServiceWorker(true)
  }, [needRefresh, activeWorkout, updateServiceWorker])

  if (!needRefresh || !isWorkoutOpen) return null

  return (
    <div className="fixed inset-x-0 top-3 z-[60] mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 p-3 shadow-lg">
      <span className="text-sm">New version ready. Your workout is saved</span>
      <button className="min-h-11 rounded-xl bg-push px-4 text-sm font-semibold text-bg" onClick={() => updateServiceWorker(true)}>
        Reload
      </button>
    </div>
  )
}
