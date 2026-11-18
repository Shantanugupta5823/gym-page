import { mkdir, writeFile } from 'node:fs/promises'
import { SEED_PLAN } from '../src/db/seedPlan.ts'

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

const neededIds = [...new Set(SEED_PLAN.flatMap(day => day.items.map(item => item.exerciseId)))]
const missingIds = neededIds.filter(id => !exerciseById.has(id))
if (missingIds.length > 0) throw new Error(`Seed exercises missing from dataset: ${missingIds.join(', ')}`)

await mkdir(`${OUTPUT_DIR}/images`, { recursive: true })
await writeFile(`${OUTPUT_DIR}/exercises.json`, JSON.stringify(exercises))

const imagePaths = neededIds.flatMap(id => exerciseById.get(id)?.images ?? [])
for (const imagePath of imagePaths) {
  const imageResponse = await fetchWithRetry(`${RAW_BASE}/exercises/${imagePath}`)
  await mkdir(`${OUTPUT_DIR}/images/${imagePath.split('/')[0]}`, { recursive: true })
  await writeFile(`${OUTPUT_DIR}/images/${imagePath}`, Buffer.from(await imageResponse.arrayBuffer()))
}

console.log(`Wrote ${exercises.length} exercises and ${imagePaths.length} images to ${OUTPUT_DIR}`)
