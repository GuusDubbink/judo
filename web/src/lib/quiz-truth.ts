import type { BeltCode, JudoData, QuizFilters, QuizQuestion, Technique } from '../types'
import { BELT_ORDER } from '../types'

const DOMAIN_LABELS: Record<string, string> = {
  nage_waza: 'Staande techniek (nage waza)',
  ne_waza: 'Grondtechniek (ne waza)',
}

export function categoryLabel(db: JudoData, categoryId: string): string {
  const category = db.categories[categoryId]
  return category ? `${category.nl} (${category.jp})` : categoryId
}

function beltsUpTo(selected: BeltCode): BeltCode[] {
  const index = BELT_ORDER.indexOf(selected)
  return BELT_ORDER.slice(0, index + 1)
}

export function filterTechniques(db: JudoData, filters: QuizFilters): Technique[] {
  return db.techniques.filter((technique) => {
    if (filters.belt !== 'all') {
      if (!technique.belt) return false
      if (!beltsUpTo(filters.belt).includes(technique.belt)) return false
    }
    if (filters.domain !== 'all' && technique.domain !== filters.domain) return false
    return true
  })
}

export function counterNamesForAttack(db: JudoData, attackId: string): string[] {
  return db.counters
    .filter((counter) => counter.attack_id === attackId && counter.counter_id)
    .map((counter) => db.techniques.find((technique) => technique.id === counter.counter_id)?.name)
    .filter((name): name is string => Boolean(name))
}

export function combinationNamesForFirst(db: JudoData, firstId: string): string[] {
  return db.combinations
    .filter((combo) => combo.first_id === firstId && combo.then_id)
    .map((combo) => db.techniques.find((technique) => technique.id === combo.then_id)?.name)
    .filter((name): name is string => Boolean(name))
}

function techniqueIdFromQuestionId(questionId: string, suffix: string): string | null {
  if (!questionId.endsWith(suffix)) return null
  return questionId.slice(0, -suffix.length)
}

function parseCounterQuestionId(
  questionId: string,
  db: JudoData,
): { attackId: string; counterId: string } | null {
  for (const counter of db.counters) {
    if (!counter.attack_id || !counter.counter_id) continue
    if (questionId === `counter-${counter.attack_id}-${counter.counter_id}`) {
      return { attackId: counter.attack_id, counterId: counter.counter_id }
    }
  }
  return null
}

function parseCombinationQuestionId(
  questionId: string,
  db: JudoData,
): { firstId: string; thenId: string } | null {
  for (const combo of db.combinations) {
    if (!combo.first_id || !combo.then_id) continue
    if (questionId === `combo-${combo.first_id}-${combo.then_id}`) {
      return { firstId: combo.first_id, thenId: combo.then_id }
    }
  }
  return null
}

function glossaryEntryForQuestion(db: JudoData, question: QuizQuestion): { term: string; nl: string } | null {
  const slug = question.id.replace(/^glossary-/, '')
  return (
    db.glossary.find(
      (entry) => entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug,
    ) ?? null
  )
}

/** Option indices that are factually correct according to judotechnieken.json. */
export function getValidOptionIndices(
  question: QuizQuestion,
  db: JudoData,
  techniquePool: Technique[],
): Set<number> {
  const valid = new Set<number>()
  void techniquePool

  const markMatching = (predicate: (option: string, index: number) => boolean) => {
    question.options.forEach((option, index) => {
      if (predicate(option, index)) valid.add(index)
    })
  }

  switch (question.type) {
    case 'category': {
      const techniqueId = techniqueIdFromQuestionId(question.id, '-category')
      const technique = techniqueId ? db.techniques.find((item) => item.id === techniqueId) : null
      if (!technique) break
      const label = categoryLabel(db, technique.category)
      markMatching((option) => option === label)
      break
    }
    case 'technique': {
      const techniqueId = techniqueIdFromQuestionId(question.id, '-technique')
      const technique = techniqueId ? db.techniques.find((item) => item.id === techniqueId) : null
      if (!technique) break
      markMatching((option) => option === technique.name)
      break
    }
    case 'domain': {
      const techniqueId = techniqueIdFromQuestionId(question.id, '-domain')
      const technique = techniqueId ? db.techniques.find((item) => item.id === techniqueId) : null
      if (!technique) break
      const label = DOMAIN_LABELS[technique.domain]
      markMatching((option) => option === label)
      break
    }
    case 'number': {
      const techniqueId = techniqueIdFromQuestionId(question.id, '-number')
      const technique = techniqueId ? db.techniques.find((item) => item.id === techniqueId) : null
      if (!technique) break
      markMatching((option) => option === technique.name)
      break
    }
    case 'counter': {
      const parsed = parseCounterQuestionId(question.id, db)
      if (!parsed) break
      const validNames = new Set(counterNamesForAttack(db, parsed.attackId))
      markMatching((option) => validNames.has(option))
      break
    }
    case 'combination': {
      const parsed = parseCombinationQuestionId(question.id, db)
      if (!parsed) break
      const validNames = new Set(combinationNamesForFirst(db, parsed.firstId))
      markMatching((option) => validNames.has(option))
      break
    }
    case 'glossary': {
      const entry = glossaryEntryForQuestion(db, question)
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
  db: JudoData,
  techniquePool: Technique[],
): boolean {
  return getValidOptionIndices(question, db, techniquePool).has(optionIndex)
}
