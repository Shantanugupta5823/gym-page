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
4. **Plan**
   - Rotation mode: **Rolling** (the next day is whatever comes after the last completed day; the default) or **Fixed weekdays**
   - Day cards (Day 1–6). Expanding a card shows its exercises with sets × reps
   - Edit mode: reorder or add/remove exercises (searchable exercise library with images), change sets/reps/rest
5. **Settings** (open from Plan or a gear icon)
   - Units (kg/lb), default rest time, kg increment (2.5)
   - **Export JSON**, **Import JSON**, and **Reset data**: pick any of workout history / plan / settings, or reset everything

## Data model (Dexie)
```ts
exercises:  id, name, primaryMuscles[], secondaryMuscles[], equipment, category, images[], instructions[]
planDays:   id, order, name, type ('push'|'pull'|'legs'), items: { exerciseId, sets, repMin, repMax, restSec }[]
workouts:   id, planDayId, startedAt, endedAt?, notes?
sets:       id, workoutId, exerciseId, setIndex, weight, reps, done, createdAt   // index [exerciseId+createdAt]
settings:   key/value (unit, rotationMode, restDefault, increment)
```

## Progression hint (double progression)
If every working set of an exercise last session hit `repMax`, show a "↑ try +2.5 kg" chip and prefill the weight +increment. Otherwise prefill the same weight.

## Seed plan: my PPL split (muscle focus per day; editable in the Plan tab)
Rolling rotation follows completed workouts, not weekdays. Each muscle gets 3-5 exercises per day (11-13 per day), 2-3 sets each. Rep ranges by load: heavy 8-12, medium 12-15, light 15-20.
1. **Push A**: Chest, Triceps, Forearms
2. **Pull A**: Back, Biceps, Abs
3. **Legs A**: Quads, Shoulders, Forearms
4. **Push B**: Chest, Triceps, Abs
5. **Pull B**: Back, Biceps, Forearms
6. **Legs B**: Hamstrings, Calves, Shoulders, Abs
Exact exercises live in `src/db/seedPlan.ts`.

## Exercise library
- Curated, at most 20 per muscle group (11 groups incl. Forearms), in `src/db/curatedExercises.ts`. Glutes and hamstrings have fewer because the dataset has few good options.
- Source: **free-exercise-db** (Unlicense). `npm run fetch-exercises` downloads the JSON, keeps only curated exercises, and copies only the first image of each into `public/exercises/`, so images are served from our origin and precached.
- Bodyweight tracking was removed on purpose (the Dr Trust 360 app is used instead; it has no data we can read).

## PWA requirements
- `manifest`: name "Gym Log", short_name "Gym", `display: standalone`, theme/background `#0B0B0C`, 192 and 512 icons plus a maskable icon. `start_url` and `scope` must respect the Vite `base`.
- Precache the app shell and exercise images. `registerType: 'prompt'` (an auto-reload could wipe an open workout), with a small "new version available — reload" toast.
- Call `navigator.storage.persist()` on first run, so the browser is less likely to evict the data.

## Deployment (GitHub Pages)
- In `vite.config.ts`, set `base: '/gym-page/'` (the repo name).
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
