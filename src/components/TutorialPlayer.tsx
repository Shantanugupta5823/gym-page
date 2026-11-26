import { useEffect, useRef, useState } from 'react'
import { loadYouTubeApi } from '@/lib/youtube'
import type { YouTubePlayer } from '@/lib/youtube'

interface TutorialPlayerProps {
  videoId: string
  onUnavailable?: () => void
}

type PlayerState = 'loading' | 'ready' | 'offline' | 'blocked'

// Plays the video inside the app (privacy-enhanced youtube-nocookie player), never opening the YouTube app
export const TutorialPlayer = ({ videoId, onUnavailable }: TutorialPlayerProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<PlayerState>(navigator.onLine ? 'loading' : 'offline')

  useEffect(() => {
    if (!navigator.onLine) return
    let player: YouTubePlayer | null = null
    let isCancelled = false

    loadYouTubeApi()
      .then(YT => {
        if (isCancelled || !mountRef.current) return
        const target = document.createElement('div')
        mountRef.current.replaceChildren(target)
        player = new YT.Player(target, {
          videoId,
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, loop: 1, playlist: videoId, fs: 0 },
          events: {
            onReady: () => setState('ready'),
            // 100: removed, 101/150: owner blocks playback outside YouTube
            onError: () => {
              setState('blocked')
              onUnavailable?.()
            }
          }
        })
      })
      .catch(() => { if (!isCancelled) setState('offline') })

    return () => {
      isCancelled = true
      player?.destroy()
    }
  }, [videoId, onUnavailable])

  return (
    <div className="relative mx-auto aspect-[9/16] max-h-[62dvh] w-full max-w-[350px] overflow-hidden rounded-2xl bg-black">
      <div ref={mountRef} className="absolute inset-0 [&>iframe]:size-full" />
      {state !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted">
          {state === 'loading' && <span className="size-8 animate-spin rounded-full border-2 border-muted border-t-transparent" aria-label="Loading video" />}
          {state === 'offline' && <p>Couldn&apos;t load the video. Tutorials need internet: check your connection and open this again.</p>}
          {state === 'blocked' && <p>This video can&apos;t play inside the app. Paste another link below.</p>}
        </div>
      )}
    </div>
  )
}
