import type { Domain, QuestionType } from '../types'

export const OPTION_COUNT = 4
export const DISTRACTOR_COUNT = OPTION_COUNT - 1

export const QUESTION_COUNTS = [10, 15, 20] as const

export const DOMAIN_LABELS: Record<Domain, string> = {
  nage_waza: 'Staande techniek (nage waza)',
  ne_waza: 'Grondtechniek (ne waza)',
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  category: 'categorie',
  technique: 'techniek',
  counter: 'counter',
  combination: 'combinatie',
  domain: 'domein',
  number: 'nummer',
  glossary: 'woordenlijst',
}
