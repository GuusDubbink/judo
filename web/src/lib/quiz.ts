import { db } from '../data/db'
import type { Combination, Counter, GlossaryEntry, QuizFilters, QuizQuestion, Technique } from '../types'
import { DISTRACTOR_COUNT, DOMAIN_LABELS } from './constants'
import {
  buildUniqueMeaningOptions,
  buildUniqueNameOptions,
  glossarySlug,
  glossaryTermLabel,
  pickDistractors,
} from './quiz-options'
import {
  categoryLabel,
  combinationNamesForFirst,
  counterNamesForAttack,
  filterTechniques,
} from './quiz-truth'
import { shuffle } from './shuffle'

function buildCategoryQuestion(technique: Technique): QuizQuestion | null {
  const correctLabel = categoryLabel(db, technique.category)
  const pool = Object.keys(db.categories)
    .filter((id) => db.categories[id].domain === technique.domain)
    .map((id) => categoryLabel(db, id))

  const options = pickDistractors(pool, correctLabel, DISTRACTOR_COUNT, (label) => label)
  if (!options) return null

  return {
    id: `${technique.id}-category`,
    type: 'category',
    prompt: 'Welke categorie hoort bij deze techniek?',
    hint: technique.name,
    options,
    correctIndex: options.indexOf(correctLabel),
    infoTechniqueIds: [technique.id],
  }
}

function buildTechniqueQuestion(technique: Technique): QuizQuestion | null {
  const otherCategories = db.techniques.filter((item) => item.category !== technique.category)
  const built = buildUniqueNameOptions(technique, otherCategories)
  if (!built) return null

  return {
    id: `${technique.id}-technique`,
    type: 'technique',
    prompt: 'Welke techniek hoort bij deze categorie?',
    hint: categoryLabel(db, technique.category),
    options: built.options,
    correctIndex: built.options.indexOf(technique.name),
    optionInfoTechniqueIds: built.techniqueIds,
  }
}

function buildDomainQuestion(technique: Technique): QuizQuestion | null {
  const correctLabel = DOMAIN_LABELS[technique.domain]
  const wrongDomain = technique.domain === 'nage_waza' ? 'ne_waza' : 'nage_waza'
  const options = shuffle([correctLabel, DOMAIN_LABELS[wrongDomain]])

  return {
    id: `${technique.id}-domain`,
    type: 'domain',
    prompt: 'Is dit een staande of grondtechniek?',
    hint: technique.name,
    options,
    correctIndex: options.indexOf(correctLabel),
    infoTechniqueIds: [technique.id],
  }
}

function buildNumberQuestion(technique: Technique, pool: Technique[]): QuizQuestion | null {
  if (technique.number == null) return null

  const sameCategory = pool.filter(
    (item) => item.category === technique.category && item.id !== technique.id,
  )

  // Grond-categorieën als armklemmen (kansetsu waza) en verwurgingen (jime waza)
  // hernummeren per serie, dus "nummer 3 bij armklemmen" heeft één juist antwoord
  // per serie — ambigu. Scope de vraag daarom op de serie en trek de afleiders bij
  // voorkeur uit dezelfde serie, zodat de vraag het rijtje oefent.
  let distractorPool = sameCategory
  if (technique.series) {
    const sameSeries = sameCategory.filter((item) => item.series === technique.series)
    const uniqueNames = new Set(sameSeries.map((item) => item.name))
    if (uniqueNames.size >= DISTRACTOR_COUNT) distractorPool = sameSeries
  }

  const built = buildUniqueNameOptions(technique, distractorPool)
  if (!built) return null

  const position = technique.series
    ? `nummer ${technique.number} van de ${technique.series}`
    : `nummer ${technique.number}`

  return {
    id: `${technique.id}-number`,
    type: 'number',
    prompt: `Welke techniek is ${position} bij ${categoryLabel(db, technique.category)}?`,
    options: built.options,
    correctIndex: built.options.indexOf(technique.name),
    optionInfoTechniqueIds: built.techniqueIds,
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
  const built = buildUniqueNameOptions(counterTechnique, optionPool)
  if (!built) return null

  return {
    id: `counter-${counter.attack_id}-${counter.counter_id}`,
    type: 'counter',
    prompt: 'Welke counter hoort bij deze techniek?',
    hint: attack.name,
    options: built.options,
    correctIndex: built.options.indexOf(counterTechnique.name),
    infoTechniqueIds: [attack.id],
    optionInfoTechniqueIds: built.techniqueIds,
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
  const built = buildUniqueNameOptions(thenTechnique, optionPool)
  if (!built) return null

  return {
    id: `combo-${combination.first_id}-${combination.then_id}`,
    type: 'combination',
    prompt: 'Welke techniek volgt hierop in de combinatie?',
    hint: first.name,
    options: built.options,
    correctIndex: built.options.indexOf(thenTechnique.name),
    infoTechniqueIds: [first.id],
    optionInfoTechniqueIds: built.techniqueIds,
  }
}

function buildGlossaryQuestion(entry: GlossaryEntry, pool: GlossaryEntry[]): QuizQuestion | null {
  const options = buildUniqueMeaningOptions(entry, pool)
  if (!options) return null

  return {
    id: `glossary-${glossarySlug(entry.term)}`,
    type: 'glossary',
    prompt: `Wat betekent ${glossaryTermLabel(entry.term)}?`,
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

  if (filters.domain === 'all' || filters.domain === 'glossary') {
    for (const entry of db.glossary) {
      add(buildGlossaryQuestion(entry, db.glossary))
    }
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

export function getSetupStats(filters: QuizFilters): {
  techniques: number
  glossaryTerms: number
  questions: number
  quizLength: number
} {
  const questions = buildQuestionPool(filters)
  const isGlossaryOnly = filters.domain === 'glossary'
  return {
    techniques: isGlossaryOnly ? 0 : filterTechniques(db, filters).length,
    glossaryTerms: isGlossaryOnly ? db.glossary.length : 0,
    questions: questions.length,
    quizLength: Math.min(filters.count, questions.length),
  }
}
