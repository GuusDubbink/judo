import { QUESTION_COUNTS, SETTINGS_QUESTION_TYPE_ORDER } from './constants'

const SETTINGS_KEY = 'judo-quiz-settings'

export type ConfigurableQuestionType = (typeof SETTINGS_QUESTION_TYPE_ORDER)[number]

export interface AppSettings {
  questionCount: number
  excludedQuestionTypes: ConfigurableQuestionType[]
}

const DEFAULT_SETTINGS: AppSettings = {
  questionCount: 10,
  excludedQuestionTypes: [],
}

function isQuestionCount(value: unknown): value is (typeof QUESTION_COUNTS)[number] {
  return typeof value === 'number' && (QUESTION_COUNTS as readonly number[]).includes(value)
}

function isConfigurableQuestionType(value: unknown): value is ConfigurableQuestionType {
  return (
    typeof value === 'string' &&
    (SETTINGS_QUESTION_TYPE_ORDER as readonly string[]).includes(value)
  )
}

function normalizeSettings(parsed: Partial<AppSettings>): AppSettings {
  const questionCount = isQuestionCount(parsed.questionCount) ? parsed.questionCount : 10
  const excludedQuestionTypes = Array.isArray(parsed.excludedQuestionTypes)
    ? parsed.excludedQuestionTypes.filter(isConfigurableQuestionType)
    : []

  if (excludedQuestionTypes.length >= SETTINGS_QUESTION_TYPE_ORDER.length) {
    return { questionCount, excludedQuestionTypes: [] }
  }

  return { questionCount, excludedQuestionTypes }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return normalizeSettings(JSON.parse(raw) as Partial<AppSettings>)
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
