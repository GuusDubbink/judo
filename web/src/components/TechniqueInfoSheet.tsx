import { useEffect, useId, useRef, useState } from 'react'
import type { TechniqueInfo } from '../lib/technique-info'
import { youtubeEmbedUrl } from '../lib/technique-info'

interface TechniqueInfoSheetProps {
  open: boolean
  techniques: TechniqueInfo[]
  onClose: () => void
}

function TechniqueContent({
  technique,
  showName,
  showVideo,
}: {
  technique: TechniqueInfo
  showName: boolean
  showVideo: boolean
}) {
  const embedUrl = technique.youtube ? youtubeEmbedUrl(technique.youtube) : null

  return (
    <div className="space-y-4">
      {showName ? <h3 className="text-lg font-bold text-ink">{technique.name}</h3> : null}

      {technique.description ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Officiële Kodokan-beschrijving (Engels)
          </p>
          <p className="mt-2 text-base leading-relaxed text-ink">{technique.description}</p>
        </div>
      ) : null}

      {showVideo && embedUrl ? (
        <div className="aspect-video overflow-hidden rounded-xl border border-border bg-black">
          <iframe
            src={embedUrl}
            title={`Video: ${technique.name}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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

        <div className="overflow-y-auto px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
