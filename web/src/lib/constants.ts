import type { Domain, QuestionType } from '../types'

export const OPTION_COUNT = 4
export const DISTRACTOR_COUNT = OPTION_COUNT - 1

export const QUESTION_COUNTS = [10, 15, 20] as const

export const QUESTION_TYPE_ORDER: QuestionType[] = [
  'category',
  'technique',
  'domain',
  'number',
  'counter',
  'combination',
  'glossary',
]

/** Question types togglable in settings (glossary is controlled via setup Type filter). */
export const SETTINGS_QUESTION_TYPE_ORDER = QUESTION_TYPE_ORDER.filter(
  (type) => type !== 'glossary',
) as Exclude<QuestionType, 'glossary'>[]

export const DOMAIN_LABELS: Record<Domain, string> = {
  nage_waza: 'Staande techniek (nage waza)',
  ne_waza: 'Grondtechniek (ne waza)',
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  category: 'categorie',
  technique: 'techniek',
  counter: 'overname',
  combination: 'combinatie',
  domain: 'domein',
  number: 'nummer',
  glossary: 'woordenlijst',
}

/** Dutch labels for the settings screen (what each question type asks). */
export const QUESTION_TYPE_SETTING_LABELS: Record<QuestionType, string> = {
  category: 'Categorie van techniek',
  technique: 'Techniek bij categorie',
  domain: 'Staand of grond',
  number: 'Nummer in rijtje',
  counter: 'Overnames',
  combination: 'Combinaties',
  glossary: 'Woordenlijst',
}
