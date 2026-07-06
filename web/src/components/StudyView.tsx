import { useState } from 'react'
import type { StudyCard, StudyIndexNode, StudySection } from '../lib/study'
import { PagerButtons } from './PagerButtons'
import { ScreenHeader } from './ScreenHeader'
import { TechniqueCardBody, TermCardBody } from './StudyCardBody'
import { StudyIndexSheet } from './StudyIndexSheet'

interface StudyViewProps {
  card: StudyCard
  cardNumber: number
  total: number
  index: StudyIndexNode[]
  section: StudySection | null
  canGoBack: boolean
  canGoForward: boolean
  onPrevious: () => void
  onNext: () => void
  onGoTo: (index: number) => void
  onHome: () => void
}

export function StudyView({
  card,
  cardNumber,
  total,
  index,
  section,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  onGoTo,
  onHome,
}: StudyViewProps) {
  const [indexOpen, setIndexOpen] = useState(false)
  const progress = (cardNumber / total) * 100
  const showIndex = index.length > 1
  const sectionCardNumber = section ? cardNumber - section.startIndex : cardNumber
  const isGlossary = card.kind === 'term'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-6 sm:py-8">
      <ScreenHeader
        onHome={onHome}
        trailing={
          showIndex ? (
            <button
              type="button"
              onClick={() => setIndexOpen(true)}
              className="min-h-11 rounded-lg px-3 text-sm font-semibold text-club-blue transition hover:bg-club-blue-light"
            >
              Inhoud
            </button>
          ) : (
            <span className="text-sm text-muted">leren</span>
          )
        }
      />

      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-sm text-muted">
            Kaart {cardNumber} van {total}
          </div>
          {section ? (
            <div className="text-sm font-medium text-ink">
              {section.label}
              <span className="font-normal text-muted">
                {' '}
                · {sectionCardNumber}/{section.count}
              </span>
            </div>
          ) : null}
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-club-blue-light"
          role="progressbar"
          aria-valuenow={cardNumber}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Voortgang: kaart ${cardNumber} van ${total}`}
        >
          <div
            className="h-full rounded-full bg-club-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-8">
        {card.kind === 'technique' ? (
          <TechniqueCardBody card={card} />
        ) : (
          <TermCardBody card={card} />
        )}
      </div>

      <PagerButtons
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      {showIndex ? (
        <StudyIndexSheet
          open={indexOpen}
          index={index}
          activeIndex={cardNumber - 1}
          glossary={isGlossary}
          onClose={() => setIndexOpen(false)}
          onSelect={(startIndex) => {
            onGoTo(startIndex)
            setIndexOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
