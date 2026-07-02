export type BeltCode = 'ge' | 'or' | 'gr' | 'bl' | 'br' | 'zw'
export type Domain = 'nage_waza' | 'ne_waza'

export interface Technique {
  id: string
  name: string
  category: string
  domain: Domain
  belt?: BeltCode | null
  number?: number | null
  series?: string | null
  needs_review?: boolean
}

export interface Category {
  domain: Domain
  jp: string
  nl: string
  en: string
}

export interface JudoData {
  meta: {
    school: string
    language: string
    source: string
  }
  belts: Record<BeltCode, string>
  categories: Record<string, Category>
  techniques: Technique[]
}

export type QuestionType = 'category' | 'belt' | 'technique'

export interface QuizQuestion {
  id: string
  type: QuestionType
  prompt: string
  hint?: string
  options: string[]
  correctIndex: number
  techniqueId: string
}

export interface QuizFilters {
  belt: BeltCode | 'all'
  domain: Domain | 'all'
  count: number
}
