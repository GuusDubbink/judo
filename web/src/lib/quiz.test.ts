import { describe, expect, it } from 'vitest'
import type { QuizFilters } from '../types'
import { BELT_ORDER } from '../types'
import { buildQuestionPool, getDb } from './quiz'
import { counterNamesForAttack, combinationNamesForFirst } from './quiz-truth'
import { validateQuestionPool } from './quiz-validate'

const db = getDb()

const FILTER_SCENARIOS: QuizFilters[] = [
  { belt: 'all', domain: 'all', count: 9999 },
  ...BELT_ORDER.map((belt) => ({ belt, domain: 'all' as const, count: 9999 })),
  { belt: 'all', domain: 'nage_waza', count: 9999 },
  { belt: 'all', domain: 'ne_waza', count: 9999 },
]

describe('quiz ground truth', () => {
  it.each(FILTER_SCENARIOS)(
    'every question is correct and unambiguous (belt=$belt domain=$domain)',
    (filters) => {
      const questions = buildQuestionPool(filters)
      const report = validateQuestionPool(questions, db, filters)

      expect(report.errors, JSON.stringify(report.errors, null, 2)).toHaveLength(0)
      expect(report.ambiguities, JSON.stringify(report.ambiguities, null, 2)).toHaveLength(0)
    },
  )

  it('O Soto Gari has two valid counters in JSON', () => {
    const names = counterNamesForAttack(db, 'o-soto-gari')
    expect(names).toEqual(expect.arrayContaining(['O Soto Gari', 'Sumi Otoshi']))
    expect(names).toHaveLength(2)
  })

  it('O Uchi Gari has three valid counters with resolved ids in JSON', () => {
    const names = counterNamesForAttack(db, 'o-uchi-gari')
    expect(names).toEqual(
      expect.arrayContaining(['Yoko Guruma', 'Uchi Mata', 'Kata Guruma']),
    )
    expect(names).toHaveLength(3)
  })

  it('counter questions for multi-counter attacks never list another valid counter as distractor', () => {
    const filters: QuizFilters = { belt: 'all', domain: 'all', count: 9999 }
    const questions = buildQuestionPool(filters).filter((question) => question.type === 'counter')

    for (const attackId of ['o-soto-gari', 'o-uchi-gari']) {
      const attackQuestions = questions.filter((question) =>
        question.id.startsWith(`counter-${attackId}-`),
      )
      expect(attackQuestions.length).toBeGreaterThan(0)

      const validNames = new Set(counterNamesForAttack(db, attackId))

      for (const question of attackQuestions) {
        const markedCorrect = question.options[question.correctIndex]
        expect(validNames.has(markedCorrect)).toBe(true)

        const otherOptions = question.options.filter(
          (_, index) => index !== question.correctIndex,
        )
        for (const option of otherOptions) {
          expect(validNames.has(option)).toBe(false)
        }
      }
    }
  })

  it('combination questions exclude other valid follow-ups as distractors', () => {
    const filters: QuizFilters = { belt: 'all', domain: 'all', count: 9999 }
    const questions = buildQuestionPool(filters).filter(
      (question) => question.type === 'combination',
    )

    const multiComboFirsts = new Map<string, number>()
    for (const combo of db.combinations) {
      if (!combo.first_id) continue
      multiComboFirsts.set(combo.first_id, (multiComboFirsts.get(combo.first_id) ?? 0) + 1)
    }

    const firstsWithMultiple = [...multiComboFirsts.entries()]
      .filter(([, count]) => count > 1)
      .map(([firstId]) => firstId)

    for (const firstId of firstsWithMultiple) {
      const comboQuestions = questions.filter((question) =>
        question.id.startsWith(`combo-${firstId}-`),
      )
      if (comboQuestions.length === 0) continue

      const validNames = new Set(combinationNamesForFirst(db, firstId))
      for (const question of comboQuestions) {
        const markedCorrect = question.options[question.correctIndex]
        expect(validNames.has(markedCorrect)).toBe(true)

        const otherOptions = question.options.filter(
          (_, index) => index !== question.correctIndex,
        )
        for (const option of otherOptions) {
          expect(validNames.has(option)).toBe(false)
        }
      }
    }
  })
})

describe('quiz scoring truth', () => {
  it('marked correctIndex always matches JSON for every generated question', () => {
    const filters: QuizFilters = { belt: 'all', domain: 'all', count: 9999 }
    const questions = buildQuestionPool(filters)
    const report = validateQuestionPool(questions, db, filters)

    for (const question of questions) {
      const item = report.errors.find((entry) => entry.questionId === question.id)
      expect(item, `question ${question.id} failed validation`).toBeUndefined()
    }
  })
})
