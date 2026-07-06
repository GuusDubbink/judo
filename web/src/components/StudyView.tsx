import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import {
  isInSection,
  type StudyCard,
  type StudyIndexNode,
  type StudySection,
  type StudyTechniqueCard,
  type StudyTermCard,
} from '../lib/study'
import { breakdownName, hasDecodableWord } from '../lib/word-breakdown'
import { TechniqueContent } from './TechniqueInfoSheet'

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
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onHome}
          className="min-h-11 rounded-lg px-2 text-sm font-medium text-club-blue transition hover:bg-club-blue-light sm:px-3"
        >
          ← Start
        </button>
        {showIndex ? (
          <button
            type="button"
            onClick={() => setIndexOpen(true)}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-club-blue transition hover:bg-club-blue-light"
          >
            Inhoud
          </button>
        ) : (
          <span className="text-sm text-muted">leren</span>
        )}
      </div>

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

function StudyIndexSheet({
  open,
  index,
  activeIndex,
  glossary,
  onClose,
  onSelect,
}: {
  open: boolean
  index: StudyIndexNode[]
  activeIndex: number
  glossary: boolean
  onClose: () => void
  onSelect: (startIndex: number) => void
}) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) closeButtonRef.current?.focus()
  }, [open])

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

  useEffect(() => {
    if (!open || !listRef.current) return
    const activeElements = listRef.current.querySelectorAll<HTMLElement>('[data-active="true"]')
    const target = activeElements[activeElements.length - 1] ?? activeElements[0]
    target?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Sluit inhoud"
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
            {glossary ? 'Woordenlijst' : 'Categorieën'}
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

        <div
          ref={listRef}
          className="overflow-y-auto overscroll-y-contain px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
        >
          <ul className="flex flex-col gap-1">
            {index.map((node) =>
              node.kind === 'section' ? (
                <li key={node.section.id}>
                  <IndexRow
                    section={node.section}
                    active={isInSection(node.section, activeIndex)}
                    glossary={glossary}
                    onSelect={onSelect}
                  />
                </li>
              ) : (
                <li key={node.group.id} className="flex flex-col gap-1">
                  <IndexRow
                    section={node.group}
                    active={isInSection(node.group, activeIndex)}
                    glossary={glossary}
                    onSelect={onSelect}
                  />
                  <ul className="ml-3 flex flex-col gap-1 border-l-2 border-club-blue-light pl-3">
                    {node.group.children.map((child) => (
                      <li key={child.id}>
                        <IndexRow
                          section={child}
                          active={isInSection(child, activeIndex)}
                          glossary={glossary}
                          nested
                          onSelect={onSelect}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

function IndexRow({
  section,
  active,
  glossary,
  nested = false,
  onSelect,
}: {
  section: StudySection
  active: boolean
  glossary: boolean
  nested?: boolean
  onSelect: (startIndex: number) => void
}) {
  const countLabel = glossary
    ? `${section.count} ${section.count === 1 ? 'woord' : 'woorden'}`
    : `${section.count} ${section.count === 1 ? 'techniek' : 'technieken'}`

  return (
    <button
      type="button"
      data-active={active ? 'true' : undefined}
      onClick={() => onSelect(section.startIndex)}
      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition sm:px-4 ${
        active
          ? nested
            ? 'bg-club-blue-light text-ink ring-1 ring-club-blue/40'
            : 'bg-club-blue-light text-ink ring-1 ring-club-blue/30'
          : 'text-ink hover:bg-club-blue-soft'
      }`}
    >
      <span className={nested ? 'font-medium' : 'font-semibold'}>{section.label}</span>
      <span className="shrink-0 text-sm text-muted">{countLabel}</span>
    </button>
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
