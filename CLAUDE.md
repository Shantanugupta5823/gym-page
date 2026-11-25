# Gym Log — rotation workout tracker (PWA)

A personal, mobile-first gym tracker that runs as an installable PWA on my phone.
It has no backend: all data lives on the device in IndexedDB. It is hosted free on GitHub Pages.

## Goals
- Open the app at the gym, tap **Start workout**, and the next rotation day is already loaded with last session's numbers.
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
- Accent / Push `#A3E635` (lime), Pull `#7DD3FC` (sky), Legs `#FB923C` (orange), Delts & Arms `#C4B5FD` (violet)
- Body map coverage: grey `#2C2C33` → dark green → `#4ADE80` (done)
- Fonts: Space Grotesk for headings and big numbers, Inter for body text
- Radii: cards 16–20px, inputs and buttons 10–14px. Touch targets ≥ 44px
- Bottom nav with 4 tabs: Home, Workout, Progress, Plan

## Screens
1. **Home / Dashboard**
   - Greeting and date
   - "Today" card with the next rotation day ("Day N of M") name, its muscles, exercise count, estimated time, and a **Start workout** button
   - **Rotation card**: day pills (done ✓ / next / upcoming) and the **body map**: a male figure you drag to turn 180° (front ↔ back) or flip with Turn.
     Each of the 17 muscles fills from grey through dark green to bright green as this rotation's sets are ticked off; the next workout's muscles are outlined in its day colour.
     Tap a muscle for done/target sets and the days that train it; "Show all muscles" lists every bar.
     A rotation starts whenever Day 1 is started (`src/lib/coverage.ts`). Target = the plan's sets for the muscle, done = ticked sets; primary movers count 1, secondary 0.5 (`getMuscleCredits` in `src/lib/muscles.ts`)
   - Week strip (Mon–Sun) showing done, today and upcoming days, colour-coded by day type
   - Stat tiles: current streak, workouts this week / planned, total volume this week (tonnes)
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
planDays:   id, planId, order, name, type ('push'|'pull'|'legs'|'arms'), items: { exerciseId, sets, repMin, repMax, restSec }[]
workouts:   id, planDayId, startedAt, endedAt?, notes?
sets:       id, workoutId, exerciseId, setIndex, weight, reps, done, createdAt   // index [exerciseId+createdAt]
settings:   key/value (unit, rotationMode, restDefault, increment)
```

## Progression hint (double progression)
If every working set of an exercise last session hit `repMax`, show a "↑ try +2.5 kg" chip and prefill the weight +increment. Otherwise prefill the same weight.

## Seed plan: posture-focused six-day rotation (editable in the Plan tab)
Trained every day, on rotation (not weekdays). Goals: lean, aesthetic physique with every muscle trained; fix rounded shoulders and anterior pelvic tilt; strong leg definition.
Heavy lifts 4-5 sets, everything else 2-3 sets.
- **Block A, every day**: warm-up band pull-aparts, wall slides, upper-back foam roll, pelvic tilt into bridge; cool-down doorway chest stretch and couch (hip flexor) stretch
- **Neck, every day**: plate neck curl + extension on days 1, 3, 5; side isometrics + chin tucks on days 2, 4, 6
- **Forearms (4 exercises)** on days 1, 3, 5; **abs (5: 3 core, 2 obliques)** on days 2, 4, 6
1. **Push A**: Chest (incline DB heavy, flat DB, cable fly, butterfly, low-to-high fly) + Triceps (overhead, rope, machine, dips)
2. **Pull A, back width**: weighted pull-ups heavy, lat pulldowns, straight-arm pulldown, face pulls + Biceps (DB, incline, hammer)
3. **Legs A, quads**: squat, hack squat, leg press, Bulgarian split squat, leg extension, adductor, calves + Shoulders (press, laterals, reverse pec deck)
4. **Push B**: same chest/triceps, flat DB heavy first
5. **Pull B, back thickness**: deadlift heavy, T-bar row, chest-supported row, shrugs, prone Y-raise + Biceps
6. **Legs B, hamstrings and glutes**: RDL (moderate, after deadlifts), hip thrust, lying and seated leg curl, glute-ham raise, abductor, calves + Shoulders (machine press, cable laterals, face pulls)
Exact exercises live in `src/db/seedPlan.ts`. Wall slides, chin tucks and prone Y-raise are custom drills in `src/db/customExercises.ts` (no image).
DB v8 keeps history, reseeds the library and adds this plan as the active one; older plans stay in the plan switcher.

## Exercise library
- Curated, at most 20 per muscle, one list per body-map muscle (17: Neck, Traps, Shoulders, Rear delts, Chest, Back, Lower back, Biceps, Triceps, Forearms, Abs, Obliques, Glutes, Quads, Hamstrings, Adductors, Calves) in `src/db/curatedExercises.ts`.
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
- Unit-test the pure logic (next-day rotation, rotation coverage, e1RM, PR detection, progression hint) with Vitest.
- `PREVIEW=1 npx vite build` makes a relative-path build without the service worker, for hosting a preview outside Pages.
- Body map outlines come from react-body-highlighter (MIT), see `src/components/body/bodyRegions.ts`.
