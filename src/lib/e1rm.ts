const EPLEY_DIVISOR = 30

export function getE1rm (weight: number, reps: number): number {
  return weight * (1 + reps / EPLEY_DIVISOR)
}
