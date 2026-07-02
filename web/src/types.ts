export type BeltCode = 'ge' | 'or' | 'gr' | 'bl' | 'br' | 'zw'
export type Domain = 'nage_waza' | 'ne_waza'
export type QuizDomainFilter = Domain | 'all' | 'glossary'

export const BELT_ORDER: BeltCode[] = ['ge', 'or', 'gr', 'bl', 'br', 'zw']

export interface Technique {
  id: string
  name: string
  /** Alternate spellings or transliterations for the same syllabus entry. */
  aliases?: string[]
  /** Kodokan / IJF standard name (informational; not used for quiz scoring). */
  kodokan_ref?: string
  category: string
  domain: Domain
  belt?: BeltCode | null
  number?: number | null
  series?: string | null
  needs_review?: boolean
  description?: string
  youtube?: string
}

export interface Category {
  domain: Domain
  jp: string
  nl: string
  en: string
}

export interface Counter {
  attack: string
  attack_id?: string | null
  counter: string
  counter_id?: string | null
}

export interface Combination {
  first: string
  first_id?: string | null
  then: string
  then_id?: string | null
}

export interface GlossaryEntry {
  term: string
  nl: string
  /** Alternate Dutch translations accepted as correct in glossary questions. */
  nl_aliases?: string[]
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
  counters: Counter[]
  combinations: Combination[]
  glossary: GlossaryEntry[]
}

export type QuestionType =
  | 'category'
  | 'technique'
  | 'counter'
  | 'combination'
  | 'domain'
  | 'number'
  | 'glossary'

export interface QuizQuestion {
  id: string
  type: QuestionType
  prompt: string
  hint?: string
  options: string[]
  correctIndex: number
  infoTechniqueIds?: string[]
  optionInfoTechniqueIds?: string[]
}

export interface QuizFilters {
  belt: BeltCode | 'all'
  domain: QuizDomainFilter
  count: number
}
