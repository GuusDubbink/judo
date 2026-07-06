import type { ReactNode } from 'react'
import type { StudyTechniqueCard, StudyTermCard } from '../lib/study'
import { breakdownName, hasDecodableWord } from '../lib/word-breakdown'
import { TechniqueContent } from './TechniqueContent'

export function TechniqueCardBody({ card }: { card: StudyTechniqueCard }) {
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

export function TermCardBody({ card }: { card: StudyTermCard }) {
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
