import { useCallback, useMemo, useState } from 'react'
import { db } from '../data/db'
import { createQuiz } from '../lib/quiz'
import { getValidOptionIndices, isAnswerCorrect } from '../lib/quiz-truth'
import { buildStudyDeck, buildStudyIndex, buildStudySections, studySectionAt, type StudyCard } from '../lib/study'
import type { QuizFilters, QuizQuestion } from '../types'

type Screen = 'setup' | 'quiz' | 'results' | 'study'

export function useQuiz() {
  const [screen, setScreen] = useState<Screen>('setup')
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

  const studySections = useMemo(() => buildStudySections(studyDeck), [studyDeck])
  const studyCatalog = useMemo(() => buildStudyIndex(studyDeck), [studyDeck])
  const studySection = useMemo(
    () => studySectionAt(studySections, studyIndex),
    [studySections, studyIndex],
  )

  const startQuiz = useCallback((nextFilters: QuizFilters) => {
    const nextQuestions = createQuiz(nextFilters)
    if (nextQuestions.length === 0) return

    setFilters(nextFilters)
    setQuestions(nextQuestions)
    setIndex(0)
    setAnswers({})
    setScreen('quiz')
  }, [])

  const startStudy = useCallback((nextFilters: QuizFilters) => {
    const deck = buildStudyDeck(nextFilters)
    if (deck.length === 0) return

    setFilters(nextFilters)
    setStudyDeck(deck)
    setStudyIndex(0)
    setScreen('study')
  }, [])

  const goHome = useCallback(() => {
    setScreen('setup')
    setFilters(null)
    setQuestions([])
    setAnswers({})
    setIndex(0)
    setStudyDeck([])
    setStudyIndex(0)
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
    if (!filters) return
    startQuiz(filters)
  }, [filters, startQuiz])

  return {
    screen,
    currentQuestion,
    questionNumber: index + 1,
    total: questions.length,
    selectedIndex,
    showFeedback,
    validIndices,
    score,
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
