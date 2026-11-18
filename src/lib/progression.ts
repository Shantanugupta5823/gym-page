export interface LastSet {
  weight: number
  reps: number
}

interface PrefillInput {
  lastSets: LastSet[]
  setIndex: number
  repMin: number
  repMax: number
  increment: number
}

// Double progression: every working set hit the top of the rep range
export function shouldIncreaseWeight (lastSets: LastSet[], repMax: number): boolean {
  return lastSets.length > 0 && lastSets.every(set => set.reps >= repMax)
}

export function getPrefill ({ lastSets, setIndex, repMin, repMax, increment }: PrefillInput): LastSet {
  if (lastSets.length === 0) return { weight: 0, reps: repMin }

  const base = lastSets[Math.min(setIndex, lastSets.length - 1)]
  const bump = shouldIncreaseWeight(lastSets, repMax) ? increment : 0
  return { weight: base.weight + bump, reps: base.reps }
}
