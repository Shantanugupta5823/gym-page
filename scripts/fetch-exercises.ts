import { mkdir, rm, writeFile } from 'node:fs/promises'
import { SEED_PLAN } from '../src/db/seedPlan.ts'
import { CURATED_EXERCISES, PREP_EXERCISE_IDS } from '../src/db/curatedExercises.ts'
import { CUSTOM_EXERCISE_IDS } from '../src/db/customExercises.ts'

const RAW_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main'
const OUTPUT_DIR = 'public/exercises'
const FETCH_TIMEOUT_MS = 30_000
const FETCH_RETRIES = 3

interface DatasetExercise {
  id: string
  images: string[]
}

async function fetchWithRetry (url: string): Promise<Response> {
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
      if (response.ok) return response
      if (attempt === FETCH_RETRIES) throw new Error(`${url} responded ${response.status}`)
    } catch (error) {
      if (attempt === FETCH_RETRIES) throw error
    }
  }
  throw new Error(`${url} failed`)
}

// Dataset is under the Unlicense (public domain)
const jsonResponse = await fetchWithRetry(`${RAW_BASE}/dist/exercises.json`)
const exercises = await jsonResponse.json() as DatasetExercise[]
const exerciseById = new Map(exercises.map(exercise => [exercise.id, exercise]))

// Custom drills are not in the dataset; the app adds them itself
const curatedIds = [...new Set([...Object.values(CURATED_EXERCISES).flat(), ...PREP_EXERCISE_IDS])].filter(id => !CUSTOM_EXERCISE_IDS.has(id))
const seedIds = SEED_PLAN.flatMap(day => day.items.map(item => item.exerciseId))

const missingIds = curatedIds.filter(id => !exerciseById.has(id))
if (missingIds.length > 0) throw new Error(`Curated exercises missing from dataset: ${missingIds.join(', ')}`)
const uncuratedSeedIds = seedIds.filter(id => !curatedIds.includes(id) && !CUSTOM_EXERCISE_IDS.has(id))
if (uncuratedSeedIds.length > 0) throw new Error(`Seed plan uses uncurated exercises: ${uncuratedSeedIds.join(', ')}`)

// The app shows only the first image, so only that one is shipped
const library = curatedIds.map(id => {
  const exercise = exerciseById.get(id) as DatasetExercise
  return { ...exercise, images: exercise.images.slice(0, 1) }
})

await rm(OUTPUT_DIR, { recursive: true, force: true })
await mkdir(`${OUTPUT_DIR}/images`, { recursive: true })
await writeFile(`${OUTPUT_DIR}/exercises.json`, JSON.stringify(library))

for (const exercise of library) {
  for (const imagePath of exercise.images) {
    const imageResponse = await fetchWithRetry(`${RAW_BASE}/exercises/${imagePath}`)
    await mkdir(`${OUTPUT_DIR}/images/${imagePath.split('/')[0]}`, { recursive: true })
    await writeFile(`${OUTPUT_DIR}/images/${imagePath}`, Buffer.from(await imageResponse.arrayBuffer()))
  }
}

console.log(`Wrote ${library.length} exercises to ${OUTPUT_DIR}`)
