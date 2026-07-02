import { describe, expect, it } from 'vitest'
import { buildQuestionPool } from './quiz'
import { hasTechniqueInfo, resolveTechniqueInfo, youtubeEmbedUrl } from './technique-info'

describe('youtubeEmbedUrl', () => {
  it('converts youtu.be links', () => {
    expect(youtubeEmbedUrl('https://youtu.be/zIq0xI0ogxk')).toBe(
      'https://www.youtube-nocookie.com/embed/zIq0xI0ogxk',
    )
  })

  it('converts youtube.com watch links', () => {
    expect(youtubeEmbedUrl('https://www.youtube.com/watch?v=zIq0xI0ogxk')).toBe(
      'https://www.youtube-nocookie.com/embed/zIq0xI0ogxk',
    )
  })

  it('returns null for invalid URLs', () => {
    expect(youtubeEmbedUrl('https://example.com/video')).toBeNull()
    expect(youtubeEmbedUrl('')).toBeNull()
  })
})

describe('resolveTechniqueInfo', () => {
  it('returns technique with description and youtube', () => {
    const info = resolveTechniqueInfo(['o-soto-gari'])
    expect(info).toHaveLength(1)
    expect(info[0].name).toBe('O Soto Gari')
    expect(info[0].description).toBeTruthy()
    expect(info[0].youtube).toBeTruthy()
  })

  it('returns description-only when youtube is missing', () => {
    const info = resolveTechniqueInfo(['sasae-tsuri-komi-ashi'])
    expect(info).toHaveLength(1)
    expect(info[0].description).toBeTruthy()
    expect(info[0].youtube).toBeUndefined()
  })

  it('skips techniques without enrichment data', () => {
    expect(resolveTechniqueInfo(['soto-gake'])).toHaveLength(0)
    expect(hasTechniqueInfo(['soto-gake'])).toBe(false)
  })

  it('deduplicates repeated ids', () => {
    const info = resolveTechniqueInfo(['o-soto-gari', 'o-soto-gari'])
    expect(info).toHaveLength(1)
  })
})

describe('question infoTechniqueIds', () => {
  it('category questions include the subject technique id', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'all', count: 9999 })
    const category = questions.find((q) => q.id === 'o-soto-gari-category')
    expect(category?.infoTechniqueIds).toEqual(['o-soto-gari'])
  })

  it('counter questions include attack and counter ids', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'all', count: 9999 })
    const counter = questions.find((q) => q.id.startsWith('counter-o-soto-gari-'))
    expect(counter?.infoTechniqueIds).toHaveLength(2)
    expect(counter?.infoTechniqueIds?.[0]).toBe('o-soto-gari')
  })

  it('combination questions include first and follow-up ids', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'all', count: 9999 })
    const combo = questions.find((q) => q.type === 'combination')
    expect(combo?.infoTechniqueIds).toHaveLength(2)
  })

  it('glossary questions omit infoTechniqueIds', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'glossary', count: 9999 })
    expect(questions.every((q) => !q.infoTechniqueIds?.length)).toBe(true)
  })
})
