import { useEffect, useRef, useState } from 'react'
import type { TechniqueInfo } from '../lib/technique-info'
import { BottomSheet } from './BottomSheet'
import { TechniqueContent } from './TechniqueContent'

interface TechniqueInfoSheetProps {
  open: boolean
  techniques: TechniqueInfo[]
  onClose: () => void
}

export function TechniqueInfoSheet({ open, techniques, onClose }: TechniqueInfoSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setActiveIndex(0)
      closeButtonRef.current?.focus()
    }
  }, [open, techniques])

  if (!open || techniques.length === 0) return null

  const activeTechnique = techniques[activeIndex] ?? techniques[0]
  const showTabs = techniques.length > 1

  return (
    <BottomSheet
      open={open}
      title="Meer info"
      overlayLabel="Sluit meer info"
      onClose={onClose}
      closeButtonRef={closeButtonRef}
    >
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
    </BottomSheet>
  )
}
