import { useRegisterSW } from 'virtual:pwa-register/react'

export const UpdateToast = () => {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-0 top-3 z-[60] mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 p-3 shadow-lg">
      <span className="text-sm">New version available</span>
      <button className="min-h-11 rounded-xl bg-push px-4 text-sm font-semibold text-bg" onClick={() => updateServiceWorker(true)}>
        Reload
      </button>
    </div>
  )
}
