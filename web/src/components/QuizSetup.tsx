import { useId, useMemo, useState, type ReactNode } from 'react'
import type { BeltCode, QuizDomainFilter, QuizFilters } from '../types'
import { BELT_ORDER } from '../types'
import { QUESTION_COUNTS } from '../lib/constants'
import { getBelts, getMeta, getSetupStats } from '../lib/quiz'

interface QuizSetupProps {
  onStart: (filters: QuizFilters) => void
}

export function QuizSetup({ onStart }: QuizSetupProps) {
  const meta = getMeta()
  const belts = getBelts()
  const [belt, setBelt] = useState<BeltCode | 'all'>('all')
  const [domain, setDomain] = useState<QuizDomainFilter>('all')
  const [count, setCount] = useState<number>(10)

  const filters = useMemo<QuizFilters>(
    () => ({ belt, domain, count }),
    [belt, domain, count],
  )

  const { techniques, glossaryTerms, questions, quizLength } = useMemo(
    () => getSetupStats(filters),
    [filters],
  )
  const canStart = questions > 0
  const countCapped = canStart && count > questions
  const isGlossaryOnly = domain === 'glossary'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-8 sm:py-10">
      <header className="space-y-2 text-center sm:space-y-3">
        <p className="text-sm font-semibold tracking-[0.2em] text-club-blue uppercase">
          Judotechnieken
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">Oefenquiz</h1>
        <p className="text-sm text-muted sm:text-base">
          Test je kennis van technieken, counters, combinaties en woorden.
        </p>
        <p className="text-sm text-muted/80">{meta.school}</p>
      </header>

      <section className="overflow-visible rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="mb-4">
          <BeltFilterInfo belts={belts} />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={belt === 'all'} onClick={() => setBelt('all')}>
            Alle banden
          </FilterChip>
          {(BELT_ORDER as BeltCode[]).map((code) => (
            <FilterChip key={code} active={belt === code} onClick={() => setBelt(code)}>
              {belts[code]}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Type</h2>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={domain === 'all'} onClick={() => setDomain('all')}>
            Alles
          </FilterChip>
          <FilterChip active={domain === 'nage_waza'} onClick={() => setDomain('nage_waza')}>
            Staande technieken
          </FilterChip>
          <FilterChip active={domain === 'ne_waza'} onClick={() => setDomain('ne_waza')}>
            Grondtechnieken
          </FilterChip>
          <FilterChip active={domain === 'glossary'} onClick={() => setDomain('glossary')}>
            Woordenlijst
          </FilterChip>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Aantal vragen</h2>
        <div className="flex flex-wrap gap-2">
          {QUESTION_COUNTS.map((value) => (
            <FilterChip
              key={value}
              active={count === value}
              onClick={() => setCount(value)}
            >
              {value}
            </FilterChip>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          {isGlossaryOnly
            ? `${glossaryTerms} woorden · ${questions} mogelijke vragen in deze selectie.`
            : `${techniques} technieken · ${questions} mogelijke vragen in deze selectie.`}
          {countCapped ? (
            <span className="mt-1 block text-ink">
              Er zijn maar {questions} vragen beschikbaar; je krijgt er {quizLength}.
            </span>
          ) : null}
        </p>
      </section>

      <button
        type="button"
        disabled={!canStart}
        onClick={() => onStart(filters)}
        className="min-h-12 rounded-xl bg-club-blue px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-club-blue-dark disabled:cursor-not-allowed disabled:bg-club-blue-light disabled:text-muted"
      >
        {canStart ? `Start quiz (${quizLength} vragen)` : 'Geen vragen beschikbaar'}
      </button>
    </div>
  )
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
