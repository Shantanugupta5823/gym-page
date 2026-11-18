import { HashRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { App } from '@/App'
import { seedDatabase } from '@/db/seed'
import '@/index.css'

const root = createRoot(document.getElementById('root') as HTMLElement)

async function bootstrap (): Promise<void> {
  await seedDatabase()
  // Ask the browser not to evict IndexedDB; the grant is the browser's call
  if (navigator.storage?.persist) await navigator.storage.persist()

  root.render(
    <HashRouter>
      <App />
    </HashRouter>
  )
}

bootstrap().catch((error: unknown) => {
  root.render(
    <main className="p-5">
      <h1 className="font-heading text-xl font-semibold">Could not start Gym Log</h1>
      <p className="mt-2 text-sm text-muted">{error instanceof Error ? error.message : 'Unknown error'}</p>
    </main>
  )
})
