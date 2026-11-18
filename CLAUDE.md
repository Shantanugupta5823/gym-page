# Gym Log — PPL workout tracker (PWA)

A personal, mobile-first gym tracker that runs as an installable PWA on my phone.
It has no backend: all data lives on the device in IndexedDB. It is hosted free on GitHub Pages.

## Goals
- Open the app at the gym, tap **Start workout**, and the right PPL day is already loaded with last session's numbers.
- Logging a set takes 2 taps: the inputs are prefilled from last time, and I tap ✓.
- A simple dashboard shows what I've done this week and whether I'm progressing.
- It works fully offline once installed.

## Tech stack
- Vite + React + TypeScript
- Tailwind CSS (dark theme only)
- Dexie.js (IndexedDB wrapper) for storage; `dexie-react-hooks` for live queries
- Recharts for charts
- `vite-plugin-pwa` (Workbox) for the manifest, service worker and offline cache
- React Router with **HashRouter**, because GitHub Pages has no SPA fallback
- No backend and no auth

## Design tokens (match the mockup)
- Background `#0B0B0C`, surface `#17171A`, surface-2 `#222226`, border `#1F1F23`
- Text `#F4F4F5`, muted `#A1A1AA`
- Accent / Push `#A3E635` (lime), Pull `#7DD3FC` (sky), Legs `#FB923C` (orange)
- Fonts: Space Grotesk for headings and big numbers, Inter for body text
- Radii: cards 16–20px, inputs and buttons 10–14px. Touch targets ≥ 44px
- Bottom nav with 4 tabs: Home, Workout, Progress, Plan

## Screens
1. **Home / Dashboard**
   - Greeting and date
   - "Today" card with the next PPL day name, its muscles, exercise count, estimated time, and a **Start workout** button
   - Week strip (Mon–Sun) showing done, today and upcoming days, colour-coded by Push/Pull/Legs
   - Stat tiles: current streak, workouts this week / planned, total volume this week (tonnes)
   - "Sets per muscle this week" horizontal bars, with a target band of 10–20 sets
   - Recent PRs (last 3)
2. **Workout (active session)**
   - Header: day name, elapsed timer, "Exercise N of M" segmented progress bar, **Finish** button
   - Current exercise: image, name, target muscles, target sets × rep range
   - Set table with columns SET | LAST TIME | KG | REPS | ✓. KG and reps are prefilled from the same set last session. Tapping ✓ saves the set and starts the rest timer
   - Rest timer bar with +30s and Skip. Vibrate (`navigator.vibrate`) when it hits 0
   - "+ Add set", swipe a set to delete it, and a ⋯ menu with: swap exercise, add note, skip
   - "Up next" list. Swipe or tap to move between exercises
   - The session survives an app close or refresh: persist it as an in-progress workout and resume it on open
3. **Progress**
   - Exercise picker
   - Est. 1RM line chart (Epley: `w × (1 + reps/30)`), range 1M / 3M / 1Y
   - PR tiles: heaviest weight, best set (e1RM), best session volume
   - Session history list for that exercise
   - Bodyweight chart, entered from a small "+ log weight" sheet
4. **Plan**
   - Rotation mode: **Rolling** (the next day is whatever comes after the last completed day; the default) or **Fixed weekdays**
   - Day cards (Day 1–6). Expanding a card shows its exercises with sets × reps
   - Edit mode: reorder or add/remove exercises (searchable exercise library with images), change sets/reps/rest
5. **Settings** (open from Plan or a gear icon)
   - Units (kg/lb), default rest time, kg increment (2.5)
   - **Export JSON**, **Import JSON**, and reset data

## Data model (Dexie)
```ts
exercises:  id, name, primaryMuscles[], secondaryMuscles[], equipment, category, images[], instructions[]
planDays:   id, order, name, type ('push'|'pull'|'legs'), items: { exerciseId, sets, repMin, repMax, restSec }[]
workouts:   id, planDayId, startedAt, endedAt?, notes?
sets:       id, workoutId, exerciseId, setIndex, weight, reps, done, createdAt   // index [exerciseId+createdAt]
bodyweight: id, date, kg
settings:   key/value (unit, rotationMode, restDefault, increment)
```

## Progression hint (double progression)
If every working set of an exercise last session hit `repMax`, show a "↑ try +2.5 kg" chip and prefill the weight +increment. Otherwise prefill the same weight.

## Seed plan: PPL × 2 (I will edit this to my exact plan)
- **Push A**: Barbell Bench Press 4×5–8, Incline DB Press 3×8–10, Overhead Press 3×6–8, Lateral Raise 3×12–15, Cable Fly 3×12, Tricep Pushdown 3×10–12
- **Pull A**: Deadlift 3×3–5, Barbell Row 4×6–8, Lat Pulldown 3×8–10, Face Pull 3×15, Barbell Curl 3×8–10, Hammer Curl 3×10–12
- **Legs A**: Back Squat 4×5–8, Romanian Deadlift 3×8–10, Leg Press 3×10–12, Leg Curl 3×10–12, Standing Calf Raise 4×10–15, Hanging Leg Raise 3×12
- **Push B**: Overhead Press 4×5–8, Incline Barbell Bench 3×8–10, Dips 3×8–12, Cable Lateral Raise 3×12–15, Pec Deck 3×12–15, Overhead Tricep Extension 3×10–12
- **Pull B**: Pull-ups 4×6–10, Seated Cable Row 3×8–12, Single-arm DB Row 3×10, Reverse Fly 3×15, Incline DB Curl 3×10–12, Shrugs 3×12
- **Legs B**: Hack Squat 4×8–10, Bulgarian Split Squat 3×10, Leg Extension 3×12–15, Lying Leg Curl 3×12, Hip Thrust 3×10, Seated Calf Raise 4×15

## Exercise images
- Use the open-source **free-exercise-db** dataset (github.com/yuhonas/free-exercise-db): `exercises.json` plus images per exercise. Check its licence and file layout before using it.
- Write a build-time script (`scripts/fetch-exercises.ts`) that does three things:
  1. Download the JSON.
  2. Map the seed exercises above to dataset IDs.
  3. Copy only the needed images (plus the full JSON for the library search) into `public/exercises/`.
- Images are then served from our own origin and precached by the service worker, so they work offline.
- For exercises not in the dataset, fall back to a neutral placeholder.

## PWA requirements
- `manifest`: name "Gym Log", short_name "Gym", `display: standalone`, theme/background `#0B0B0C`, 192 and 512 icons plus a maskable icon. `start_url` and `scope` must respect the Vite `base`.
- Precache the app shell and exercise images. `registerType: 'autoUpdate'`, with a small "new version available — reload" toast.
- Call `navigator.storage.persist()` on first run, so the browser is less likely to evict the data.

## Deployment (GitHub Pages)
- In `vite.config.ts`, set `base: '/gym-log/'` (the repo name).
- Add a GitHub Actions workflow `.github/workflows/deploy.yml`: on push to `main` → `npm ci` → `npm run build` → `actions/upload-pages-artifact` (dist) → `actions/deploy-pages`.
- In repo Settings → Pages → Source, choose **GitHub Actions**.

## Build order (milestones; commit after each)
1. Scaffold the stack, tokens, bottom nav and empty screens. Deploy to Pages early.
2. Dexie schema, seed plan and exercise data, and the image fetch script.
3. Workout logging flow: prefill, ✓, rest timer, resume, finish.
4. Dashboard: next day, week strip, stat tiles, sets per muscle, PRs.
5. Progress screen and charts.
6. Plan editor and settings, including export/import.
7. PWA polish: icons, offline, update toast, `storage.persist`.

## Conventions
- Small components and a `src/db/` folder for all Dexie access (no DB calls inside components except via hooks).
- Keep all date math in one `src/lib/dates.ts`.
- Unit-test the pure logic (next-day rotation, e1RM, PR detection, progression hint) with Vitest.
