import { useEffect, useState } from 'react'

export function useNow (intervalMs: number): number {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timerId = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timerId)
  }, [intervalMs])

  return now
}
