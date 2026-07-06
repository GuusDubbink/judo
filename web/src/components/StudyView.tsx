import type { ReactNode } from 'react'
import type { StudyCard, StudyTechniqueCard, StudyTermCard } from '../lib/study'
import { breakdownName, hasDecodableWord } from '../lib/word-breakdown'
import { TechniqueContent } from './TechniqueInfoSheet'

interface StudyViewProps {
  card: StudyCard
  cardNumber: number
  total: number
  canGoBack: boolean
  canGoForward: boolean
  onPrevious: () => void
  onNext: () => void
  onHome: () => void
}

export function StudyView({
  card,
  cardNumber,
  total,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  onHome,
}: StudyViewProps) {
  const progress = (cardNumber / total) * 100

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-6 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onHome}
          className="min-h-11 rounded-lg px-2 text-sm font-medium text-club-blue transition hover:bg-club-blue-light sm:px-3"
        >
          ← Start
        </button>
        <span className="text-sm text-muted">leren</span>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted">
          Kaart {cardNumber} van {total}
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

      <div className="grid grid-cols-2 gap-3 pt-1 sm:pt-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoBack}
          className="min-h-12 rounded-xl border border-border bg-surface px-4 py-3 font-semibold text-ink transition hover:border-club-blue hover:bg-club-blue-soft disabled:cursor-not-allowed disabled:border-border disabled:text-muted disabled:hover:bg-surface"
        >
          Vorige
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoForward}
          className="min-h-12 rounded-xl bg-club-blue px-4 py-3 font-semibold text-white transition hover:bg-club-blue-dark disabled:cursor-not-allowed disabled:bg-club-blue-light disabled:text-muted"
        >
          Volgende
        </button>
      </div>
    </div>
  )
}

function TechniqueCardBody({ card }: { card: StudyTechniqueCard }) {
  const parts = breakdownName(card.name)
  const showBreakdown = hasDecodableWord(card.name)

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{card.name}</h2>
        <p className="text-sm text-muted sm:text-base">{card.category}</p>
        <div className="flex flex-wrap gap-2">
          <Tag>{card.domain}</Tag>
          {card.series ? <Tag>{card.series}</Tag> : null}
          {card.number != null ? <Tag>nr. {card.number}</Tag> : null}
        </div>
      </div>

      {showBreakdown ? (
        <div className="rounded-xl border border-border bg-club-blue-soft p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Woordopbouw</p>
          <dl className="space-y-1.5">
            {parts.map((part, index) => (
              <div
                key={`${part.word}-${index}`}
                className="flex items-baseline justify-between gap-3"
              >
                <dt className="font-semibold text-ink">{part.word}</dt>
                <dd className="text-right text-sm text-muted">{part.meaning ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {card.description || card.youtube ? (
        <TechniqueContent
          key={card.id}
          technique={{
            id: card.id,
            name: card.name,
            description: card.description,
            youtube: card.youtube,
          }}
          showName={false}
          showVideo
          lazyVideo
        />
      ) : null}
    </div>
  )
}

function TermCardBody({ card }: { card: StudyTermCard }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{card.term}</h2>
      <p className="text-lg text-ink sm:text-xl">{card.meaning}</p>
    </div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
      {children}
    </span>
  )
}
