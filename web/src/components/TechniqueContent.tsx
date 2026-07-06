import { useEffect, useState } from 'react'
import type { TechniqueInfo } from '../lib/technique-info'
import { YOUTUBE_START_SECONDS, youtubeEmbedUrl, youtubeVideoId } from '../lib/technique-info'
import { isNativePlatform, openExternalUrl } from '../lib/native'

// Our production web origin (DigitalOcean). The native app loads the YouTube
// embed through /youtube.html here, because YouTube rejects the app's own
// `localhost` webview origin (error 153) but accepts this real https domain.
const VIDEO_PROXY_ORIGIN = 'https://judo-app-i4wta.ondigitalocean.app'

function VideoPoster({
  videoId,
  name,
  onClick,
}: {
  videoId: string
  name: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Speel video af: ${name}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-border bg-black"
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        className="h-full w-full object-cover opacity-95 transition group-active:opacity-100"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 shadow-lg transition group-hover:bg-club-blue">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-1 h-7 w-7 fill-white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  )
}

export function TechniqueContent({
  technique,
  showName,
  showVideo,
  lazyVideo = false,
}: {
  technique: TechniqueInfo
  showName: boolean
  showVideo: boolean
  /** When true, show a poster and only load the player after a tap. Used in the
   *  study deck, where auto-loading a player per card would be wasteful. */
  lazyVideo?: boolean
}) {
  const videoId = technique.youtube ? youtubeVideoId(technique.youtube) : null
  const embedUrl = technique.youtube ? youtubeEmbedUrl(technique.youtube) : null
  const native = isNativePlatform()
  const [videoFailed, setVideoFailed] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!native || !videoId) return
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; type?: string; videoId?: string } | null
      if (
        data?.source === 'judo-yt' &&
        data.type === 'error' &&
        data.videoId === videoId
      ) {
        setVideoFailed(true)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [native, videoId])

  const iframeSrc = native
    ? videoId
      ? `${VIDEO_PROXY_ORIGIN}/youtube?v=${videoId}`
      : null
    : embedUrl

  return (
    <div className="flex flex-col gap-4">
      {showName ? <h3 className="text-lg font-bold text-ink">{technique.name}</h3> : null}

      {showVideo && videoId && native && videoFailed ? (
        <VideoPoster
          videoId={videoId}
          name={technique.name}
          onClick={() =>
            void openExternalUrl(
              `https://www.youtube.com/watch?v=${videoId}&t=${YOUTUBE_START_SECONDS}`,
            )
          }
        />
      ) : showVideo && videoId && lazyVideo && !started ? (
        <VideoPoster videoId={videoId} name={technique.name} onClick={() => setStarted(true)} />
      ) : showVideo && iframeSrc ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
          <iframe
            src={iframeSrc}
            title={`Video: ${technique.name}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}

      {technique.description ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Officiële Kodokan-beschrijving (Engels)
          </p>
          <p className="mt-2 text-base leading-relaxed text-ink">{technique.description}</p>
        </div>
      ) : null}
    </div>
  )
}
