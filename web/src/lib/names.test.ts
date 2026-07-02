import { describe, expect, it } from 'vitest'
import { db } from '../data/db'
import { buildQuestionPool } from './quiz'
import {
  glossaryAllMeanings,
  glossaryMatchesMeaning,
  techniqueAllNames,
  techniqueMatchesName,
} from './names'
import { getValidOptionIndices } from './quiz-truth'

describe('technique and glossary aliases', () => {
  it('techniqueAllNames includes primary name and aliases', () => {
    const otenKarami = db.techniques.find((technique) => technique.id === 'othen-karami')
    expect(otenKarami).toBeDefined()
    expect(techniqueAllNames(otenKarami!)).toEqual(['Oten Karami', 'Othen Karami'])
    expect(techniqueMatchesName(otenKarami!, 'Othen Karami')).toBe(true)
  })

  it('glossary aliases are accepted as correct answers', () => {
    const entry = db.glossary.find((item) => item.term === 'Hishigi')
    expect(entry).toBeDefined()
    expect(glossaryAllMeanings(entry!)).toEqual([
      'klemmen, ontwrichten',
      'gestrekte klem',
      'verpletteren',
    ])

    const question = buildQuestionPool({ belt: 'all', domain: 'glossary', count: 9999 }).find(
      (item) => item.id === 'glossary-hishigi',
    )
    expect(question).toBeDefined()

    const validIndices = getValidOptionIndices(question!, db)
    for (const index of validIndices) {
      expect(glossaryMatchesMeaning(entry!, question!.options[index]!)).toBe(true)
    }
  })

  it('technique aliases are not offered as distractors for other techniques', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'ne_waza', count: 9999 })
    const otenQuestions = questions.filter((question) =>
      question.options.some((option) => option === 'Oten Karami' || option === 'Othen Karami'),
    )

    for (const question of otenQuestions) {
      if (question.id === 'othen-karami-technique' || question.id === 'othen-karami-number') {
        continue
      }
      const hasOten = question.options.includes('Oten Karami')
      const hasOthen = question.options.includes('Othen Karami')
      expect(hasOten && hasOthen).toBe(false)
    }
  })
})
