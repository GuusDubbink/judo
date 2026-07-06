import { db } from '../data/db'
import type { QuizFilters } from '../types'
import { DOMAIN_LABELS } from './constants'
import { glossaryTermLabel } from './quiz-options'
import { categoryLabel, filterTechniques } from './quiz-truth'

export interface StudyTechniqueCard {
  kind: 'technique'
  id: string
  name: string
  category: string
  domain: string
  series?: string | null
  number?: number | null
  description?: string
  youtube?: string
}

export interface StudyTermCard {
  kind: 'term'
  term: string
  meaning: string
}

export type StudyCard = StudyTechniqueCard | StudyTermCard

// Order techniques the way they are taught: per category, then per row (serie),
// then by their number within the row. Judoka learn the rijtjes in this order.
const categoryOrder = new Map(Object.keys(db.categories).map((id, index) => [id, index]))

function seriesRank(series?: string | null): number {
  if (!series) return -1
  const match = series.match(/\d+/)
  return match ? Number(match[0]) : 999
}

export function buildStudyDeck(filters: QuizFilters): StudyCard[] {
  if (filters.domain === 'glossary') {
    return db.glossary.map((entry) => ({
      kind: 'term',
      term: glossaryTermLabel(entry.term),
      meaning: entry.nl,
    }))
  }

  return [...filterTechniques(db, filters)]
    .sort((a, b) => {
      const categoryDelta =
        (categoryOrder.get(a.category) ?? 999) - (categoryOrder.get(b.category) ?? 999)
      if (categoryDelta !== 0) return categoryDelta
      const seriesDelta = seriesRank(a.series) - seriesRank(b.series)
      if (seriesDelta !== 0) return seriesDelta
      const numberDelta = (a.number ?? 999) - (b.number ?? 999)
      if (numberDelta !== 0) return numberDelta
      return a.name.localeCompare(b.name)
    })
    .map((technique) => ({
      kind: 'technique',
      id: technique.id,
      name: technique.name,
      category: categoryLabel(db, technique.category),
      domain: DOMAIN_LABELS[technique.domain],
      series: technique.series,
      number: technique.number,
      description: technique.description,
      youtube: technique.youtube,
    }))
}

export function studyDeckSize(filters: QuizFilters): number {
  return filters.domain === 'glossary'
    ? db.glossary.length
    : filterTechniques(db, filters).length
}
