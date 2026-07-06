import { useCallback, useMemo, useState } from 'react'
import { db } from '../data/db'
import { createQuiz } from '../lib/quiz'
import { getValidOptionIndices, isAnswerCorrect } from '../lib/quiz-truth'
import { SETTINGS_QUESTION_TYPE_ORDER } from '../lib/constants'
import { loadSettings, saveSettings, type AppSettings, type ConfigurableQuestionType } from '../lib/settings'
import { buildStudyDeck, buildStudyIndex, buildStudySections, studySectionAt, type StudyCard } from '../lib/study'
import type { QuizFilters, QuizMissedReview, QuizMode, QuizQuestion, SetupFilters } from '../types'

type Screen = 'setup' | 'quiz' | 'results' | 'study' | 'settings'

const DEFAULT_SETUP_FILTERS: SetupFilters = { belt: 'all', domain: 'all' }

function toQuizFilters(setup: SetupFilters, settings: AppSettings): QuizFilters {
  return {
    ...setup,
    count: settings.questionCount,
    excludedQuestionTypes: settings.excludedQuestionTypes,
  }
}

export function useQuiz() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [setupMode, setSetupMode] = useState<QuizMode>('quiz')
  const [setupFilters, setSetupFilters] = useState<SetupFilters>(DEFAULT_SETUP_FILTERS)
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings())
  const [filters, setFilters] = useState<QuizFilters | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [studyDeck, setStudyDeck] = useState<StudyCard[]>([])
  const [studyIndex, setStudyIndex] = useState(0)

  const currentQuestion = questions[index] ?? null
  const selectedIndex = answers[index] ?? null
  const showFeedback = selectedIndex !== null

  const validIndices = useMemo((): readonly number[] => {
    if (!currentQuestion) return []
    return [...getValidOptionIndices(currentQuestion, db)]
  }, [currentQuestion])

  const score = useMemo(
    () =>
      questions.reduce((total, question, questionIndex) => {
        const answer = answers[questionIndex]
        if (answer === undefined) return total
        return isAnswerCorrect(question, answer, db) ? total + 1 : total
      }, 0),
    [answers, questions],
  )

  const missedReviews = useMemo((): QuizMissedReview[] => {
    const missed: QuizMissedReview[] = []
    for (const [questionIndex, question] of questions.entries()) {
      const answer = answers[questionIndex]
      if (answer === undefined || isAnswerCorrect(question, answer, db)) continue
      missed.push({
        questionNumber: questionIndex + 1,
        type: question.type,
        prompt: question.prompt,
        hint: question.hint,
        selectedOption: question.options[answer] ?? '',
        correctOptions: [...getValidOptionIndices(question, db)].map(
          (optionIndex) => question.options[optionIndex] ?? '',
        ),
      })
    }
    return missed
  }, [answers, questions])

  const studySections = useMemo(() => buildStudySections(studyDeck), [studyDeck])
  const studyCatalog = useMemo(() => buildStudyIndex(studyDeck), [studyDeck])
  const studySection = useMemo(
    () => studySectionAt(studySections, studyIndex),
    [studySections, studyIndex],
  )

  const persistSettings = useCallback((next: AppSettings) => {
    setSettingsState(next)
    saveSettings(next)
  }, [])

  const setQuestionCount = useCallback(
    (count: number) => {
      persistSettings({ ...settings, questionCount: count })
    },
    [persistSettings, settings],
  )

  const setQuestionTypeIncluded = useCallback(
    (type: ConfigurableQuestionType, included: boolean) => {
      const excluded = new Set(settings.excludedQuestionTypes)
      if (included) {
        excluded.delete(type)
      } else if (excluded.size + 1 >= SETTINGS_QUESTION_TYPE_ORDER.length) {
        return
      } else {
        excluded.add(type)
      }
      persistSettings({
        ...settings,
        excludedQuestionTypes: [...excluded],
      })
    },
    [persistSettings, settings],
  )

  const startQuiz = useCallback(
    (setup: SetupFilters) => {
      const nextFilters = toQuizFilters(setup, settings)
      const nextQuestions = createQuiz(nextFilters)
      if (nextQuestions.length === 0) return

      setSetupFilters(setup)
      setSetupMode('quiz')
      setFilters(nextFilters)
      setQuestions(nextQuestions)
      setIndex(0)
      setAnswers({})
      setScreen('quiz')
    },
    [settings],
  )

  const startStudy = useCallback(
    (setup: SetupFilters) => {
      const nextFilters = toQuizFilters(setup, settings)
      const deck = buildStudyDeck(nextFilters)
      if (deck.length === 0) return

      setSetupFilters(setup)
      setSetupMode('study')
      setFilters(nextFilters)
      setStudyDeck(deck)
      setStudyIndex(0)
      setScreen('study')
    },
    [settings],
  )

  const goHome = useCallback(() => {
    setScreen('setup')
    setQuestions([])
    setAnswers({})
    setIndex(0)
    setStudyDeck([])
    setStudyIndex(0)
    setFilters(null)
  }, [])

  const openSettings = useCallback(() => {
    setScreen('settings')
  }, [])

  const closeSettings = useCallback(() => {
    setScreen('setup')
  }, [])

  const studyNext = useCallback(() => {
    setStudyIndex((current) => Math.min(studyDeck.length - 1, current + 1))
  }, [studyDeck.length])

  const studyPrevious = useCallback(() => {
    setStudyIndex((current) => Math.max(0, current - 1))
  }, [])

  const studyGoTo = useCallback(
    (index: number) => {
      setStudyIndex(Math.max(0, Math.min(studyDeck.length - 1, index)))
    },
    [studyDeck.length],
  )

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (!currentQuestion || showFeedback) return
      setAnswers((current) => ({ ...current, [index]: optionIndex }))
    },
    [currentQuestion, index, showFeedback],
  )

  const goToPrevious = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1))
  }, [])

  const goToNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setScreen('results')
      return
    }
    setIndex((current) => current + 1)
  }, [index, questions.length])

  const retry = useCallback(() => {
    const setup = filters
      ? { belt: filters.belt, domain: filters.domain }
      : setupFilters
    startQuiz(setup)
  }, [filters, setupFilters, startQuiz])

  return {
    screen,
    setupMode,
    setupFilters,
    questionCount: settings.questionCount,
    excludedQuestionTypes: settings.excludedQuestionTypes,
    setSetupMode,
    setSetupFilters,
    setQuestionCount,
    setQuestionTypeIncluded,
    openSettings,
    closeSettings,
    currentQuestion,
    questionNumber: index + 1,
    total: questions.length,
    selectedIndex,
    showFeedback,
    validIndices,
    score,
    missedReviews,
    canGoBack: index > 0,
    canGoForward: showFeedback,
    isLastQuestion: index + 1 >= questions.length,
    startQuiz,
    startStudy,
    goHome,
    handleSelect,
    goToPrevious,
    goToNext,
    retry,
    studyCard: studyDeck[studyIndex] ?? null,
    studyNumber: studyIndex + 1,
    studyTotal: studyDeck.length,
    studyCatalog,
    studySection,
    canStudyPrevious: studyIndex > 0,
    canStudyNext: studyIndex + 1 < studyDeck.length,
    studyNext,
    studyPrevious,
    studyGoTo,
  }
}
