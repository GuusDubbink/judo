import { describe, expect, it } from 'vitest'
import { buildQuestionPool } from './quiz'
import { hasTechniqueInfo, resolveTechniqueInfo, youtubeEmbedUrl } from './technique-info'

describe('youtubeEmbedUrl', () => {
  it('converts youtu.be links with autoplay params', () => {
    expect(youtubeEmbedUrl('https://youtu.be/zIq0xI0ogxk')).toBe(
      'https://www.youtube-nocookie.com/embed/zIq0xI0ogxk?rel=0&modestbranding=1&playsinline=1&autoplay=1&mute=1',
    )
  })

  it('converts youtube.com watch links with autoplay params', () => {
    expect(youtubeEmbedUrl('https://www.youtube.com/watch?v=zIq0xI0ogxk')).toBe(
      'https://www.youtube-nocookie.com/embed/zIq0xI0ogxk?rel=0&modestbranding=1&playsinline=1&autoplay=1&mute=1',
    )
  })

  it('can omit autoplay when disabled', () => {
    expect(youtubeEmbedUrl('https://youtu.be/zIq0xI0ogxk', false)).toBe(
      'https://www.youtube-nocookie.com/embed/zIq0xI0ogxk?rel=0&modestbranding=1&playsinline=1',
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
  it('category questions include the subject technique id at question level', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'all', count: 9999 })
    const category = questions.find((q) => q.id === 'o-soto-gari-category')
    expect(category?.infoTechniqueIds).toEqual(['o-soto-gari'])
    expect(category?.optionInfoTechniqueIds).toBeUndefined()
  })

  it('technique questions put info on each option, not at question level', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'all', count: 9999 })
    const technique = questions.find((q) => q.id === 'o-soto-gari-technique')
    expect(technique?.infoTechniqueIds).toBeUndefined()
    expect(technique?.optionInfoTechniqueIds).toHaveLength(4)
    expect(technique?.optionInfoTechniqueIds).toContain('o-soto-gari')
  })

  it('counter questions include attack at question level and counters on options', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'all', count: 9999 })
    const counter = questions.find((q) => q.id.startsWith('counter-o-soto-gari-'))
    expect(counter?.infoTechniqueIds).toEqual(['o-soto-gari'])
    expect(counter?.optionInfoTechniqueIds).toHaveLength(4)
  })

  it('combination questions include first technique at question level and follow-ups on options', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'all', count: 9999 })
    const combo = questions.find((q) => q.type === 'combination')
    expect(combo?.infoTechniqueIds).toHaveLength(1)
    expect(combo?.optionInfoTechniqueIds).toHaveLength(4)
  })

  it('glossary questions omit technique info', () => {
    const questions = buildQuestionPool({ belt: 'all', domain: 'glossary', count: 9999 })
    expect(questions.every((q) => !q.infoTechniqueIds?.length)).toBe(true)
    expect(questions.every((q) => !q.optionInfoTechniqueIds?.length)).toBe(true)
  })
})
