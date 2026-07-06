import { describe, expect, it } from 'vitest'
import type { QuizFilters } from '../types'
import { buildStudyDeck, buildStudyIndex, buildStudySections, studyDeckSize, type StudyTechniqueCard } from './study'
import { breakdownName, hasDecodableWord } from './word-breakdown'

const techniqueCards = (filters: QuizFilters): StudyTechniqueCard[] =>
  buildStudyDeck(filters).filter(
    (card): card is StudyTechniqueCard => card.kind === 'technique',
  )

describe('study deck', () => {
  it('glossary filter yields only term cards, one per glossary entry', () => {
    const filters: QuizFilters = { belt: 'all', domain: 'glossary', count: 0 }
    const deck = buildStudyDeck(filters)

    expect(deck.length).toBe(studyDeckSize(filters))
    expect(deck.every((card) => card.kind === 'term')).toBe(true)
  })

  it('technique cards are ordered by category, then serie, then number', () => {
    const cards = techniqueCards({ belt: 'all', domain: 'ne_waza', count: 0 })
    expect(cards.length).toBeGreaterThan(0)

    // Within a single category the serie/number must be non-decreasing.
    const kansetsu = cards.filter((card) => card.category.startsWith('armklemmen'))
    expect(kansetsu.length).toBeGreaterThan(0)

    const seriesRank = (s?: string | null) => (s ? Number(s.match(/\d+/)?.[0] ?? 999) : -1)
    for (let i = 1; i < kansetsu.length; i += 1) {
      const prev = kansetsu[i - 1]
      const curr = kansetsu[i]
      const order =
        seriesRank(prev.series) - seriesRank(curr.series) ||
        (prev.number ?? 999) - (curr.number ?? 999)
      expect(order).toBeLessThanOrEqual(0)
    }
  })

  it('carries serie and number onto ne-waza cards that have them', () => {
    const cards = techniqueCards({ belt: 'all', domain: 'ne_waza', count: 0 })
    const withSeries = cards.filter((card) => card.series)
    expect(withSeries.length).toBeGreaterThan(0)
    for (const card of withSeries) {
      expect(card.number).not.toBeNull()
    }
  })

  it('studyDeckSize matches the built deck length for technique filters', () => {
    const filters: QuizFilters = { belt: 'gr', domain: 'nage_waza', count: 0 }
    expect(buildStudyDeck(filters).length).toBe(studyDeckSize(filters))
  })

  it('buildStudySections groups techniques by category and serie rows', () => {
    const deck = buildStudyDeck({ belt: 'all', domain: 'ne_waza', count: 0 })
    const sections = buildStudySections(deck)

    expect(sections.length).toBeGreaterThan(1)
    expect(sections.reduce((sum, section) => sum + section.count, 0)).toBe(deck.length)

    const kansetsuSeries = sections.filter((section) => section.label.startsWith('armklemmen ·'))
    expect(kansetsuSeries.length).toBeGreaterThan(0)
  })

  it('buildStudyIndex nests series under armklemmen and verwurgingen', () => {
    const deck = buildStudyDeck({ belt: 'all', domain: 'ne_waza', count: 0 })
    const index = buildStudyIndex(deck)

    const kansetsu = index.find((node) => node.kind === 'group' && node.group.id === 'kansetsu_waza')
    const jime = index.find((node) => node.kind === 'group' && node.group.id === 'jime_waza')

    expect(kansetsu?.kind).toBe('group')
    expect(jime?.kind).toBe('group')
    if (kansetsu?.kind === 'group') {
      expect(kansetsu.group.children.length).toBeGreaterThan(1)
      expect(kansetsu.group.count).toBe(
        kansetsu.group.children.reduce((sum, child) => sum + child.count, 0),
      )
    }
    if (jime?.kind === 'group') {
      expect(jime.group.children.length).toBeGreaterThan(1)
    }

    const leafCount = index.reduce(
      (sum, node) => sum + (node.kind === 'group' ? node.group.children.length + 1 : 1),
      0,
    )
    expect(leafCount).toBeGreaterThan(index.length)
  })

  it('buildStudySections groups glossary cards by first letter', () => {
    const deck = buildStudyDeck({ belt: 'all', domain: 'glossary', count: 0 })
    const sections = buildStudySections(deck)

    expect(sections.length).toBeGreaterThan(1)
    expect(sections.every((section) => section.label.length >= 1)).toBe(true)
    expect(sections.reduce((sum, section) => sum + section.count, 0)).toBe(deck.length)
  })
})

describe('word breakdown', () => {
  it('decodes known Japanese words from the glossary', () => {
    const parts = breakdownName('Hon Geza Gatame')
    const gatame = parts.find((part) => part.word === 'Gatame')
    expect(gatame?.meaning).toMatch(/houden/i)
    expect(hasDecodableWord('Hon Geza Gatame')).toBe(true)
  })

  it('returns every word, leaving unknown words without a meaning', () => {
    const parts = breakdownName('Ude Garami')
    expect(parts.map((part) => part.word)).toEqual(['Ude', 'Garami'])
    expect(parts.find((part) => part.word === 'Ude')?.meaning).toBeDefined()
  })

  it('decodes parenthetical spelling variants from the glossary', () => {
    const parts = breakdownName('Hon Kesa Katame')
    const katame = parts.find((part) => part.word === 'Katame')
    expect(katame?.meaning).toMatch(/houden/i)
  })
})
