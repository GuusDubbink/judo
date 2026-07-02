import data from '@data'
import type {
  BeltCode,
  JudoData,
  QuizFilters,
  QuizQuestion,
  QuestionType,
  Technique,
} from '../types'
import { sample, shuffle } from './shuffle'

const db = data as JudoData

const QUESTION_TYPES: QuestionType[] = ['category', 'belt', 'technique']

function filterTechniques(filters: QuizFilters): Technique[] {
  return db.techniques.filter((technique) => {
    if (filters.belt !== 'all' && technique.belt !== filters.belt) return false
    if (filters.domain !== 'all' && technique.domain !== filters.domain) return false
    return true
  })
}

function pickDistractors<T>(
  pool: T[],
  correct: T,
  count: number,
  key: (item: T) => string,
): T[] {
  const unique = pool.filter((item) => key(item) !== key(correct))
  const picks = sample(unique, count)
  return shuffle([correct, ...picks])
}

function categoryLabel(categoryId: string): string {
  const category = db.categories[categoryId]
  return category ? `${category.nl} (${category.jp})` : categoryId
}

function beltLabel(code: BeltCode): string {
  return db.belts[code]
}

function buildCategoryQuestion(technique: Technique): QuizQuestion | null {
  const correctLabel = categoryLabel(technique.category)
  const pool = Object.keys(db.categories)
    .filter((id) => db.categories[id].domain === technique.domain)
    .map((id) => categoryLabel(id))

  if (pool.length < 4) return null

  const options = pickDistractors(pool, correctLabel, 3, (label) => label)
  const correctIndex = options.indexOf(correctLabel)

  return {
    id: `${technique.id}-category`,
    type: 'category',
    prompt: 'Welke categorie hoort bij deze techniek?',
    hint: technique.name,
    options,
    correctIndex,
    techniqueId: technique.id,
  }
}

function buildBeltQuestion(technique: Technique): QuizQuestion | null {
  if (!technique.belt) return null

  const correctLabel = beltLabel(technique.belt)
  const pool = (Object.keys(db.belts) as BeltCode[]).map((code) => beltLabel(code))
  const options = pickDistractors(pool, correctLabel, 3, (label) => label)
  const correctIndex = options.indexOf(correctLabel)

  return {
    id: `${technique.id}-belt`,
    type: 'belt',
    prompt: 'Bij welke band leer je deze techniek?',
    hint: technique.name,
    options,
    correctIndex,
    techniqueId: technique.id,
  }
}

function buildTechniqueQuestion(technique: Technique, pool: Technique[]): QuizQuestion | null {
  const sameCategory = pool.filter(
    (item) => item.category === technique.category && item.id !== technique.id,
  )
  if (sameCategory.length < 3) return null

  const options = pickDistractors(sameCategory, technique, 3, (item) => item.id).map(
    (item) => item.name,
  )
  const correctIndex = options.indexOf(technique.name)
  const category = db.categories[technique.category]

  return {
    id: `${technique.id}-technique`,
    type: 'technique',
    prompt: `Welke techniek hoort bij ${category?.nl ?? technique.category}?`,
    hint: category?.jp,
    options,
    correctIndex,
    techniqueId: technique.id,
  }
}

function buildQuestion(
  technique: Technique,
  type: QuestionType,
  pool: Technique[],
): QuizQuestion | null {
  switch (type) {
    case 'category':
      return buildCategoryQuestion(technique)
    case 'belt':
      return buildBeltQuestion(technique)
    case 'technique':
      return buildTechniqueQuestion(technique, pool)
    default:
      return null
  }
}

export function createQuiz(filters: QuizFilters): QuizQuestion[] {
  const pool = filterTechniques(filters)
  if (pool.length < 4) return []

  const selectedTechniques = sample(pool, filters.count)
  const questions: QuizQuestion[] = []

  for (const [index, technique] of selectedTechniques.entries()) {
    const type = QUESTION_TYPES[index % QUESTION_TYPES.length]
    const question =
      buildQuestion(technique, type, pool) ??
      buildCategoryQuestion(technique) ??
      buildTechniqueQuestion(technique, pool)

    if (question) questions.push(question)
  }

  return questions
}

export function getMeta() {
  return db.meta
}

export function getBelts() {
  return db.belts
}

export function techniqueCount(filters: QuizFilters): number {
  return filterTechniques(filters).length
}
