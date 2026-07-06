import { useId, useMemo, useState, type ReactNode } from 'react'
import type { BeltCode, QuizDomainFilter, QuizMode, SetupFilters } from '../types'
import { BELT_ORDER } from '../types'
import { getBelts, getSetupStats } from '../lib/quiz'
import type { ConfigurableQuestionType } from '../lib/settings'
import { studyDeckSize } from '../lib/study'

interface QuizSetupProps {
  mode: QuizMode
  filters: SetupFilters
  questionCount: number
  excludedQuestionTypes: ConfigurableQuestionType[]
  onModeChange: (mode: QuizMode) => void
  onFiltersChange: (filters: SetupFilters) => void
  onOpenSettings: () => void
  onStart: (filters: SetupFilters, mode: QuizMode) => void
}

export function QuizSetup({
  mode,
  filters,
  questionCount,
  excludedQuestionTypes,
  onModeChange,
  onFiltersChange,
  onOpenSettings,
  onStart,
}: QuizSetupProps) {
  const belts = getBelts()
  const { belt, domain } = filters
  const quizFilters = useMemo(
    () => ({ ...filters, count: questionCount, excludedQuestionTypes }),
    [filters, questionCount, excludedQuestionTypes],
  )

  const { techniques, glossaryTerms, questions, quizLength } = useMemo(
    () => getSetupStats(quizFilters),
    [quizFilters],
  )
  const cardCount = useMemo(() => studyDeckSize(quizFilters), [quizFilters])
  const isStudy = mode === 'study'
  const canStart = isStudy ? cardCount > 0 : questions > 0
  const countCapped = !isStudy && questions > 0 && questionCount > questions
  const isGlossaryOnly = domain === 'glossary'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-8 sm:py-10">
      <header className="relative space-y-2 pt-1 text-center sm:space-y-3">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Instellingen"
          className="absolute top-0 right-0 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition hover:border-club-blue hover:bg-club-blue-light hover:text-club-blue"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Judotechnieken</h1>
        <p className="mx-auto max-w-md text-sm text-muted sm:text-base">
          {setupSubtitle(mode, domain)}
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-1.5 shadow-sm">
        <div className="grid grid-cols-2 gap-1.5" role="tablist" aria-label="Modus">
          <ModeTab active={!isStudy} onClick={() => onModeChange('quiz')}>
            Oefenen
          </ModeTab>
          <ModeTab active={isStudy} onClick={() => onModeChange('study')}>
            Leren
          </ModeTab>
        </div>
      </section>

      <section className="overflow-visible rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <BeltFilterInfo belts={belts} />
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip
              active={belt === 'all'}
              onClick={() => onFiltersChange({ ...filters, belt: 'all' })}
            >
              Alle banden
            </FilterChip>
            {(BELT_ORDER as BeltCode[]).map((code) => (
              <FilterChip
                key={code}
                active={belt === code}
                onClick={() => onFiltersChange({ ...filters, belt: code })}
              >
                {belts[code]}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h2 className="mb-3 text-lg font-semibold text-ink">Type</h2>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={domain === 'all'}
              onClick={() => onFiltersChange({ ...filters, domain: 'all' })}
            >
              Alles
            </FilterChip>
            <FilterChip
              active={domain === 'nage_waza'}
              onClick={() => onFiltersChange({ ...filters, domain: 'nage_waza' })}
            >
              Staande technieken
            </FilterChip>
            <FilterChip
              active={domain === 'ne_waza'}
              onClick={() => onFiltersChange({ ...filters, domain: 'ne_waza' })}
            >
              Grondtechnieken
            </FilterChip>
            <FilterChip
              active={domain === 'glossary'}
              onClick={() => onFiltersChange({ ...filters, domain: 'glossary' })}
            >
              Woordenlijst
            </FilterChip>
          </div>
          <p className="mt-4 text-sm text-muted">
            {isStudy
              ? isGlossaryOnly
                ? `${cardCount} woorden in deze selectie.`
                : `${cardCount} technieken in deze selectie.`
              : isGlossaryOnly
                ? `${glossaryTerms} woorden · ${questions} mogelijke vragen.`
                : `${techniques} technieken · ${questions} mogelijke vragen.`}
            {countCapped ? (
              <span className="mt-1 block text-ink">
                Er zijn maar {questions} vragen beschikbaar; je krijgt er {quizLength}.
              </span>
            ) : null}
          </p>
        </div>
      </section>

      <button
        type="button"
        disabled={!canStart}
        onClick={() => onStart(filters, mode)}
        className="min-h-12 rounded-xl bg-club-blue px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-club-blue-dark disabled:cursor-not-allowed disabled:bg-club-blue-light disabled:text-muted"
      >
        {isStudy
          ? canStart
            ? `Begin met leren (${cardCount} kaarten)`
            : 'Niets om te leren'
          : canStart
            ? `Start quiz (${quizLength} vragen)`
            : 'Geen vragen beschikbaar'}
      </button>
    </div>
  )
}

function setupSubtitle(mode: QuizMode, domain: QuizDomainFilter): string {
  if (mode === 'study') {
    if (domain === 'glossary') return 'Blader door de woorden en hun betekenis.'
    return 'Naam, rijtje, betekenis en video — op je eigen tempo.'
  }
  return 'Technieken, overnames, combinaties en woorden.'
}

function BeltFilterInfo({ belts }: { belts: Record<BeltCode, string> }) {
  const tooltipId = useId()
  const [open, setOpen] = useState(false)
  const text = `Hogere banden omvatten alle technieken van lagere banden (${BELT_ORDER.map((code) => belts[code]).join(' → ')}).`

  return (
    <div className="group relative" data-belt-info>
      <h2 className="flex items-center text-lg font-semibold text-ink">
        Band
        <span className="ml-1.5 inline-flex">
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs font-bold text-muted transition hover:border-club-blue hover:text-club-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-blue"
            aria-describedby={open ? tooltipId : undefined}
            aria-label="Uitleg over bandfilter"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            onBlur={(event) => {
              if (!event.currentTarget.closest('[data-belt-info]')?.contains(event.relatedTarget as Node | null)) {
                setOpen(false)
              }
            }}
          >
            i
          </button>
        </span>
      </h2>
      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute top-full right-0 left-0 z-10 mt-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm font-normal text-muted shadow-sm sm:right-auto sm:w-72 ${
          open ? 'block' : 'hidden group-hover:block group-focus-within:block'
        }`}
      >
        {text}
      </span>
    </div>
  )
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-11 rounded-xl px-4 py-2.5 text-base font-semibold transition ${
        active
          ? 'bg-club-blue text-white shadow-sm'
          : 'bg-transparent text-muted hover:bg-club-blue-soft hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? 'border-club-blue bg-club-blue-light text-ink'
          : 'border-border bg-surface text-muted active:bg-club-blue-soft hover:border-club-blue hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
