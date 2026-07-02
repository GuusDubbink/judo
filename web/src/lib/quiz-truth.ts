import { db, getTechnique, techniqueById } from '../data/db'
import type { BeltCode, JudoData, QuizFilters, QuizQuestion, Technique } from '../types'
import { BELT_ORDER } from '../types'
import { DOMAIN_LABELS } from './constants'
import { glossarySlug } from './quiz-options'

export { db }

export function categoryLabel(data: JudoData, categoryId: string): string {
  const category = data.categories[categoryId]
  return category ? `${category.nl} (${category.jp})` : categoryId
}

function beltsUpTo(selected: BeltCode): BeltCode[] {
  const index = BELT_ORDER.indexOf(selected)
  return BELT_ORDER.slice(0, index + 1)
}

export function filterTechniques(data: JudoData, filters: QuizFilters): Technique[] {
  if (filters.domain === 'glossary') return []

  return data.techniques.filter((technique) => {
    if (filters.belt !== 'all') {
      if (!technique.belt) return false
      if (!beltsUpTo(filters.belt).includes(technique.belt)) return false
    }
    if (filters.domain !== 'all' && technique.domain !== filters.domain) return false
    return true
  })
}

export function counterNamesForAttack(data: JudoData, attackId: string): string[] {
  return data.counters
    .filter((counter) => counter.attack_id === attackId && counter.counter_id)
    .map((counter) => getTechnique(counter.counter_id!)?.name)
    .filter((name): name is string => Boolean(name))
}

export function combinationNamesForFirst(data: JudoData, firstId: string): string[] {
  return data.combinations
    .filter((combo) => combo.first_id === firstId && combo.then_id)
    .map((combo) => getTechnique(combo.then_id!)?.name)
    .filter((name): name is string => Boolean(name))
}

function techniqueIdFromQuestionId(questionId: string, suffix: string): string | null {
  if (!questionId.endsWith(suffix)) return null
  return questionId.slice(0, -suffix.length)
}

function parseCounterQuestionId(
  questionId: string,
  data: JudoData,
): { attackId: string; counterId: string } | null {
  for (const counter of data.counters) {
    if (!counter.attack_id || !counter.counter_id) continue
    if (questionId === `counter-${counter.attack_id}-${counter.counter_id}`) {
      return { attackId: counter.attack_id, counterId: counter.counter_id }
    }
  }
  return null
}

function parseCombinationQuestionId(
  questionId: string,
  data: JudoData,
): { firstId: string; thenId: string } | null {
  for (const combo of data.combinations) {
    if (!combo.first_id || !combo.then_id) continue
    if (questionId === `combo-${combo.first_id}-${combo.then_id}`) {
      return { firstId: combo.first_id, thenId: combo.then_id }
    }
  }
  return null
}

function glossaryEntryForQuestion(
  data: JudoData,
  question: QuizQuestion,
): { term: string; nl: string } | null {
  const slug = question.id.replace(/^glossary-/, '')
  return (
    data.glossary.find((entry) => glossarySlug(entry.term) === slug) ?? null
  )
}

/** Option indices that are factually correct according to judotechnieken.json. */
export function getValidOptionIndices(
  question: QuizQuestion,
  data: JudoData = db,
): Set<number> {
  const valid = new Set<number>()

  const markMatching = (predicate: (option: string) => boolean) => {
    question.options.forEach((option, index) => {
      if (predicate(option)) valid.add(index)
    })
  }

  switch (question.type) {
    case 'category': {
      const techniqueId = techniqueIdFromQuestionId(question.id, '-category')
      const technique = techniqueId ? techniqueById.get(techniqueId) : undefined
      if (!technique) break
      const label = categoryLabel(data, technique.category)
      markMatching((option) => option === label)
      break
    }
    case 'technique':
    case 'number': {
      const suffix = question.type === 'technique' ? '-technique' : '-number'
      const techniqueId = techniqueIdFromQuestionId(question.id, suffix)
      const technique = techniqueId ? techniqueById.get(techniqueId) : undefined
      if (!technique) break
      markMatching((option) => option === technique.name)
      break
    }
    case 'domain': {
      const techniqueId = techniqueIdFromQuestionId(question.id, '-domain')
      const technique = techniqueId ? techniqueById.get(techniqueId) : undefined
      if (!technique) break
      const label = DOMAIN_LABELS[technique.domain]
      markMatching((option) => option === label)
      break
    }
    case 'counter': {
      const parsed = parseCounterQuestionId(question.id, data)
      if (!parsed) break
      const validNames = new Set(counterNamesForAttack(data, parsed.attackId))
      markMatching((option) => validNames.has(option))
      break
    }
    case 'combination': {
      const parsed = parseCombinationQuestionId(question.id, data)
      if (!parsed) break
      const validNames = new Set(combinationNamesForFirst(data, parsed.firstId))
      markMatching((option) => validNames.has(option))
      break
    }
    case 'glossary': {
      const entry = glossaryEntryForQuestion(data, question)
      if (!entry) break
      markMatching((option) => option === entry.nl)
      break
    }
  }

  return valid
}

export function isAnswerCorrect(
  question: QuizQuestion,
  optionIndex: number,
  data: JudoData = db,
): boolean {
  return getValidOptionIndices(question, data).has(optionIndex)
}
