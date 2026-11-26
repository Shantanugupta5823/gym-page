// Minimal typing of the YouTube IFrame Player API, loaded on demand from youtube.com
export interface YouTubePlayer {
  destroy: () => void
}

interface YouTubePlayerOptions {
  videoId: string
  host: string
  width: string
  height: string
  playerVars: Record<string, number | string>
  events: {
    onReady?: () => void
    onError?: (event: { data: number }) => void
  }
}

interface YouTubeNamespace {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const API_URL = 'https://www.youtube.com/iframe_api'
const LOAD_TIMEOUT_MS = 15_000
let apiPromise: Promise<YouTubeNamespace> | null = null

export function loadYouTubeApi (): Promise<YouTubeNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    const timer = setTimeout(() => {
      apiPromise = null
      reject(new Error('YouTube did not load'))
    }, LOAD_TIMEOUT_MS)
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      clearTimeout(timer)
      if (window.YT) resolve(window.YT)
    }
    const script = document.createElement('script')
    script.src = API_URL
    script.async = true
    script.onerror = () => {
      clearTimeout(timer)
      apiPromise = null
      script.remove()
      reject(new Error('YouTube did not load'))
    }
    document.head.appendChild(script)
  })
  return apiPromise
}
