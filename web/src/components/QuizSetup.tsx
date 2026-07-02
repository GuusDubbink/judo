import { useMemo, useState, type ReactNode } from 'react'
import type { BeltCode, Domain, QuizFilters } from '../types'
import { getBelts, getMeta, techniqueCount } from '../lib/quiz'

interface QuizSetupProps {
  onStart: (filters: QuizFilters) => void
}

const QUESTION_COUNTS = [10, 15, 20] as const

export function QuizSetup({ onStart }: QuizSetupProps) {
  const meta = getMeta()
  const belts = getBelts()
  const [belt, setBelt] = useState<BeltCode | 'all'>('all')
  const [domain, setDomain] = useState<Domain | 'all'>('all')
  const [count, setCount] = useState<number>(10)

  const filters = useMemo<QuizFilters>(
    () => ({ belt, domain, count }),
    [belt, domain, count],
  )

  const available = techniqueCount(filters)
  const canStart = available >= 4

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-club-blue uppercase">
          Judotechnieken
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Oefenquiz</h1>
        <p className="text-muted">Test je kennis van technieken, categorieën en banden.</p>
        <p className="text-sm text-muted/80">{meta.school}</p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-ink">Band</h2>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={belt === 'all'} onClick={() => setBelt('all')}>
            Alle banden
          </FilterChip>
          {(Object.entries(belts) as [BeltCode, string][]).map(([code, label]) => (
            <FilterChip key={code} active={belt === code} onClick={() => setBelt(code)}>
              {label}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
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
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
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
          {available} technieken beschikbaar in deze selectie.
        </p>
      </section>

      <button
        type="button"
        disabled={!canStart}
        onClick={() => onStart(filters)}
        className="rounded-xl bg-club-blue px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-club-blue-dark disabled:cursor-not-allowed disabled:bg-club-blue-light disabled:text-muted"
      >
        Start quiz
      </button>
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
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-club-blue bg-club-blue-light text-ink'
          : 'border-border bg-surface text-muted hover:border-club-blue hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
