import { useEffect, useId, useRef, useState } from 'react'
import type { TechniqueInfo } from '../lib/technique-info'
import { youtubeEmbedUrl, youtubeVideoId } from '../lib/technique-info'
import { isNativePlatform, openExternalUrl } from '../lib/native'

// Our production web origin (DigitalOcean). The native app loads the YouTube
// embed through /youtube.html here, because YouTube rejects the app's own
// `localhost` webview origin (error 153) but accepts this real https domain —
// the same origin on which the web app's inline embed already works.
const VIDEO_PROXY_ORIGIN = 'https://judo-app-i4wta.ondigitalocean.app'

interface TechniqueInfoSheetProps {
  open: boolean
  techniques: TechniqueInfo[]
  onClose: () => void
}

/** YouTube thumbnail with a play button; used for both the native error
 *  fallback and the lazy (tap-to-load) video in study mode. */
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
  // Native: embed via the /youtube.html proxy on our real https domain (a valid
  // origin YouTube accepts). If that proxy still reports a player error it posts
  // a message back and we fall back to opening the video in the in-app browser.
  // Web: embed YouTube directly (unchanged). This component is keyed by
  // technique id in the parent, so `videoFailed`/`started` reset per technique.
  const videoId = technique.youtube ? youtubeVideoId(technique.youtube) : null
  const embedUrl = technique.youtube ? youtubeEmbedUrl(technique.youtube) : null
  const native = isNativePlatform()
  const [videoFailed, setVideoFailed] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!native) return
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; type?: string } | null
      if (data && data.source === 'judo-yt' && data.type === 'error') setVideoFailed(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [native])

  // Clean URL (no `.html`) on purpose: `serve` 301-redirects `/youtube.html` to
  // `/youtube` and drops the query string, which would strip the video id.
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
          onClick={() => void openExternalUrl(`https://www.youtube.com/watch?v=${videoId}`)}
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

export function TechniqueInfoSheet({ open, techniques, onClose }: TechniqueInfoSheetProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setActiveIndex(0)
      closeButtonRef.current?.focus()
    }
  }, [open, techniques])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open || techniques.length === 0) return null

  const activeTechnique = techniques[activeIndex] ?? techniques[0]
  const showTabs = techniques.length > 1

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Sluit meer info"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-t-2xl border border-border bg-surface shadow-xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-ink">
            Meer info
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-xl text-muted transition hover:bg-club-blue-light hover:text-ink"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        {showTabs ? (
          <div
            className="flex shrink-0 gap-2 overflow-x-auto border-b border-border px-5 py-3"
            role="tablist"
            aria-label="Technieken"
          >
            {techniques.map((technique, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={technique.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveIndex(index)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-club-blue text-white'
                      : 'bg-club-blue-light text-ink hover:bg-club-blue-soft'
                  }`}
                >
                  {technique.name}
                </button>
              )
            })}
          </div>
        ) : null}

        <div className="overflow-y-auto overscroll-y-contain px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <TechniqueContent
            key={activeTechnique.id}
            technique={activeTechnique}
            showName={!showTabs}
            showVideo={open}
          />
        </div>
      </div>
    </div>
  )
}
