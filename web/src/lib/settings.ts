import { QUESTION_COUNTS } from './constants'

const SETTINGS_KEY = 'judo-quiz-settings'

export interface AppSettings {
  questionCount: number
}

const DEFAULT_SETTINGS: AppSettings = { questionCount: 10 }

function isQuestionCount(value: unknown): value is (typeof QUESTION_COUNTS)[number] {
  return typeof value === 'number' && (QUESTION_COUNTS as readonly number[]).includes(value)
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    if (isQuestionCount(parsed.questionCount)) {
      return { questionCount: parsed.questionCount }
    }
  } catch {
    // ignore corrupt storage
  }
  return DEFAULT_SETTINGS
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
