import { db } from '../data/db'
import type { QuizFilters } from '../types'
import { DOMAIN_LABELS } from './constants'
import { glossaryTermLabel } from './quiz-options'
import { categoryLabel, filterTechniques } from './quiz-truth'

export interface StudyTechniqueCard {
  kind: 'technique'
  id: string
  name: string
  categoryId: string
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

export interface StudySection {
  id: string
  label: string
  startIndex: number
  count: number
}

export interface StudySectionGroup {
  id: string
  label: string
  startIndex: number
  count: number
  children: StudySection[]
}

export type StudyIndexNode =
  | { kind: 'section'; section: StudySection }
  | { kind: 'group'; group: StudySectionGroup }

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
      categoryId: technique.category,
      category: categoryLabel(db, technique.category),
      domain: DOMAIN_LABELS[technique.domain],
      series: technique.series,
      number: technique.number,
      description: technique.description,
      youtube: technique.youtube,
    }))
}

function termSectionLetter(term: string): string {
  const letter = term.trim().charAt(0).toUpperCase()
  return /[A-ZÀ-Ý]/.test(letter) ? letter : '#'
}

function categoryRunEnd(deck: StudyCard[], start: number, categoryId: string): number {
  let end = start
  while (end < deck.length) {
    const card = deck[end]
    if (card.kind !== 'technique' || card.categoryId !== categoryId) break
    end += 1
  }
  return end
}

function serieRunEnd(
  deck: StudyCard[],
  start: number,
  categoryId: string,
  series: string,
): number {
  let end = start
  while (end < deck.length) {
    const card = deck[end]
    if (card.kind !== 'technique' || card.categoryId !== categoryId || card.series !== series) {
      break
    }
    end += 1
  }
  return end
}

function isInSection(section: StudySection, cardIndex: number): boolean {
  return cardIndex >= section.startIndex && cardIndex < section.startIndex + section.count
}

/** Finest-grain sections for breadcrumbs (serie row when applicable). */
export function buildStudySections(deck: StudyCard[]): StudySection[] {
  const sections: StudySection[] = []

  for (let index = 0; index < deck.length; index += 1) {
    const card = deck[index]
    let id: string
    let label: string

    if (card.kind === 'term') {
      id = `letter-${termSectionLetter(card.term)}`
      label = termSectionLetter(card.term)
    } else if (card.series) {
      const category = db.categories[card.categoryId]
      id = `${card.categoryId}:${card.series}`
      label = category ? `${category.nl} · ${card.series}` : `${card.category} · ${card.series}`
    } else {
      id = card.categoryId
      label = card.category
    }

    const last = sections[sections.length - 1]
    if (last?.id === id) {
      last.count += 1
    } else {
      sections.push({ id, label, startIndex: index, count: 1 })
    }
  }

  return sections
}

/**
 * Navigation tree for the Inhoud sheet. Categories with rijtjes (armklemmen,
 * verwurgingen) nest their series under a selectable parent row.
 */
export function buildStudyIndex(deck: StudyCard[]): StudyIndexNode[] {
  const nodes: StudyIndexNode[] = []
  let index = 0

  while (index < deck.length) {
    const card = deck[index]

    if (card.kind === 'term') {
      const letter = termSectionLetter(card.term)
      const id = `letter-${letter}`
      let end = index + 1
      while (end < deck.length) {
        const next = deck[end]
        if (next.kind !== 'term' || termSectionLetter(next.term) !== letter) break
        end += 1
      }
      nodes.push({
        kind: 'section',
        section: { id, label: letter, startIndex: index, count: end - index },
      })
      index = end
      continue
    }

    const categoryId = card.categoryId
    const categoryEnd = categoryRunEnd(deck, index, categoryId)
    const hasSeries = deck
      .slice(index, categoryEnd)
      .some((item) => item.kind === 'technique' && item.series)

    if (hasSeries) {
      const children: StudySection[] = []
      let serieStart = index
      while (serieStart < categoryEnd) {
        const tech = deck[serieStart] as StudyTechniqueCard
        const series = tech.series as string
        const serieEnd = serieRunEnd(deck, serieStart, categoryId, series)
        children.push({
          id: `${categoryId}:${series}`,
          label: series,
          startIndex: serieStart,
          count: serieEnd - serieStart,
        })
        serieStart = serieEnd
      }
      nodes.push({
        kind: 'group',
        group: {
          id: categoryId,
          label: card.category,
          startIndex: index,
          count: categoryEnd - index,
          children,
        },
      })
    } else {
      nodes.push({
        kind: 'section',
        section: {
          id: categoryId,
          label: card.category,
          startIndex: index,
          count: categoryEnd - index,
        },
      })
    }

    index = categoryEnd
  }

  return nodes
}

export function studySectionAt(
  sections: StudySection[],
  cardIndex: number,
): StudySection | null {
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    if (isInSection(sections[i], cardIndex)) return sections[i]
  }
  return null
}

export { isInSection }

export function studyDeckSize(filters: QuizFilters): number {
  return filters.domain === 'glossary'
    ? db.glossary.length
    : filterTechniques(db, filters).length
}
