import data from '@data'
import type {
  Combination,
  Counter,
  GlossaryEntry,
  JudoData,
  QuizFilters,
  QuizQuestion,
  Technique,
} from '../types'
import {
  categoryLabel,
  combinationNamesForFirst,
  counterNamesForAttack,
  filterTechniques,
} from './quiz-truth'
import { sample, shuffle } from './shuffle'

const db = data as JudoData

const DOMAIN_LABELS: Record<string, string> = {
  nage_waza: 'Staande techniek (nage waza)',
  ne_waza: 'Grondtechniek (ne waza)',
}

function pickDistractors<T>(
  pool: T[],
  correct: T,
  count: number,
  key: (item: T) => string,
): T[] | null {
  const unique = pool.filter((item) => key(item) !== key(correct))
  if (unique.length < count) return null
  const picks = sample(unique, count)
  return shuffle([correct, ...picks])
}

function buildTechniqueNameOptions(
  correct: Technique,
  pool: Technique[],
  distractorCount: number,
): string[] | null {
  const usedNames = new Set([correct.name])
  const distractors: Technique[] = []
  const candidates = shuffle(pool.filter((item) => item.id !== correct.id))

  for (const candidate of candidates) {
    if (usedNames.has(candidate.name)) continue
    usedNames.add(candidate.name)
    distractors.push(candidate)
    if (distractors.length === distractorCount) break
  }

  if (distractors.length < distractorCount) return null
  return shuffle([correct.name, ...distractors.map((item) => item.name)])
}

function glossaryTermLabel(term: string): string {
  return term.split('(')[0].trim()
}

function buildCategoryQuestion(technique: Technique): QuizQuestion | null {
  const correctLabel = categoryLabel(db, technique.category)
  const pool = Object.keys(db.categories)
    .filter((id) => db.categories[id].domain === technique.domain)
    .map((id) => categoryLabel(db, id))

  const options = pickDistractors(pool, correctLabel, 3, (label) => label)
  if (!options) return null

  return {
    id: `${technique.id}-category`,
    type: 'category',
    prompt: 'Welke categorie hoort bij deze techniek?',
    hint: technique.name,
    options,
    correctIndex: options.indexOf(correctLabel),
  }
}

function buildTechniqueQuestion(technique: Technique): QuizQuestion | null {
  const otherCategories = db.techniques.filter((item) => item.category !== technique.category)
  const options = buildTechniqueNameOptions(technique, otherCategories, 3)
  if (!options) return null

  return {
    id: `${technique.id}-technique`,
    type: 'technique',
    prompt: 'Welke techniek hoort bij deze categorie?',
    hint: categoryLabel(db, technique.category),
    options,
    correctIndex: options.indexOf(technique.name),
  }
}

function buildDomainQuestion(technique: Technique): QuizQuestion | null {
  const correctLabel = DOMAIN_LABELS[technique.domain]
  const wrongDomain = technique.domain === 'nage_waza' ? 'ne_waza' : 'nage_waza'
  const decoys = Object.values(db.categories)
    .filter((category) => category.domain === wrongDomain)
    .map((category) => category.nl)

  const pool = [correctLabel, DOMAIN_LABELS[wrongDomain], ...decoys]
  const uniquePool = [...new Set(pool)]
  const options = pickDistractors(uniquePool, correctLabel, 3, (label) => label)
  if (!options) return null

  return {
    id: `${technique.id}-domain`,
    type: 'domain',
    prompt: 'Is dit een staande of grondtechniek?',
    hint: technique.name,
    options,
    correctIndex: options.indexOf(correctLabel),
  }
}

function buildNumberQuestion(technique: Technique, pool: Technique[]): QuizQuestion | null {
  if (technique.number == null) return null

  const sameCategory = pool.filter(
    (item) => item.category === technique.category && item.id !== technique.id,
  )
  const options = buildTechniqueNameOptions(technique, sameCategory, 3)
  if (!options) return null

  const category = db.categories[technique.category]

  return {
    id: `${technique.id}-number`,
    type: 'number',
    prompt: `Welke techniek is nummer ${technique.number} bij ${category?.nl ?? technique.category}?`,
    hint: category?.jp,
    options,
    correctIndex: options.indexOf(technique.name),
  }
}

function buildCounterQuestion(counter: Counter, pool: Technique[]): QuizQuestion | null {
  if (!counter.attack_id || !counter.counter_id) return null

  const attack = pool.find((technique) => technique.id === counter.attack_id)
  const counterTechnique = db.techniques.find((technique) => technique.id === counter.counter_id)
  if (!attack || !counterTechnique) return null

  const otherValidNames = new Set(
    counterNamesForAttack(db, counter.attack_id).filter((name) => name !== counterTechnique.name),
  )
  const optionPool = pool.filter(
    (technique) =>
      technique.id !== counter.counter_id && !otherValidNames.has(technique.name),
  )
  const options = buildTechniqueNameOptions(counterTechnique, optionPool, 3)
  if (!options) return null

  return {
    id: `counter-${counter.attack_id}-${counter.counter_id}`,
    type: 'counter',
    prompt: 'Welke counter hoort bij deze techniek?',
    hint: attack.name,
    options,
    correctIndex: options.indexOf(counterTechnique.name),
  }
}

function buildCombinationQuestion(
  combination: Combination,
  pool: Technique[],
): QuizQuestion | null {
  if (!combination.first_id || !combination.then_id) return null

  const first = pool.find((technique) => technique.id === combination.first_id)
  const thenTechnique = db.techniques.find((technique) => technique.id === combination.then_id)
  if (!first || !thenTechnique) return null

  const otherValidNames = new Set(
    combinationNamesForFirst(db, combination.first_id).filter(
      (name) => name !== thenTechnique.name,
    ),
  )
  const optionPool = pool.filter(
    (technique) =>
      technique.id !== combination.then_id && !otherValidNames.has(technique.name),
  )
  const options = buildTechniqueNameOptions(thenTechnique, optionPool, 3)
  if (!options) return null

  return {
    id: `combo-${combination.first_id}-${combination.then_id}`,
    type: 'combination',
    prompt: 'Welke techniek volgt hierop in de combinatie?',
    hint: first.name,
    options,
    correctIndex: options.indexOf(thenTechnique.name),
  }
}

function buildGlossaryQuestion(entry: GlossaryEntry, pool: GlossaryEntry[]): QuizQuestion | null {
  const usedMeanings = new Set([entry.nl])
  const distractors: GlossaryEntry[] = []
  const candidates = shuffle(pool.filter((item) => item.term !== entry.term))

  for (const candidate of candidates) {
    if (usedMeanings.has(candidate.nl)) continue
    usedMeanings.add(candidate.nl)
    distractors.push(candidate)
    if (distractors.length === 3) break
  }

  if (distractors.length < 3) return null

  const options = shuffle([entry.nl, ...distractors.map((item) => item.nl)])
  if (new Set(options).size !== options.length) return null

  const label = glossaryTermLabel(entry.term)

  return {
    id: `glossary-${entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    type: 'glossary',
    prompt: `Wat betekent ${label}?`,
    options,
    correctIndex: options.indexOf(entry.nl),
  }
}

export function buildQuestionPool(filters: QuizFilters): QuizQuestion[] {
  const pool = filterTechniques(db, filters)
  const techniqueIds = new Set(pool.map((technique) => technique.id))
  const questions: QuizQuestion[] = []
  const seen = new Set<string>()

  const add = (question: QuizQuestion | null) => {
    if (!question || seen.has(question.id)) return
    seen.add(question.id)
    questions.push(question)
  }

  for (const technique of pool) {
    add(buildCategoryQuestion(technique))
    add(buildTechniqueQuestion(technique))
    add(buildDomainQuestion(technique))
    add(buildNumberQuestion(technique, pool))
  }

  for (const counter of db.counters) {
    if (counter.attack_id && techniqueIds.has(counter.attack_id)) {
      add(buildCounterQuestion(counter, pool))
    }
  }

  for (const combination of db.combinations) {
    if (combination.first_id && techniqueIds.has(combination.first_id)) {
      add(buildCombinationQuestion(combination, pool))
    }
  }

  for (const entry of db.glossary) {
    add(buildGlossaryQuestion(entry, db.glossary))
  }

  return questions
}

export function createQuiz(filters: QuizFilters): QuizQuestion[] {
  const pool = buildQuestionPool(filters)
  if (pool.length === 0) return []
  return shuffle(pool).slice(0, Math.min(filters.count, pool.length))
}

export function getMeta() {
  return db.meta
}

export function getBelts() {
  return db.belts
}

export function availableQuestionCount(filters: QuizFilters): number {
  return buildQuestionPool(filters).length
}

export function techniqueCount(filters: QuizFilters): number {
  return filterTechniques(db, filters).length
}

export function getDb(): JudoData {
  return db
}
