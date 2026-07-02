import { useCallback, useMemo, useState } from 'react'
import type { QuizFilters, QuizQuestion } from './types'
import { createQuiz } from './lib/quiz'
import { QuizQuestionView } from './components/QuizQuestionView'
import { QuizResults } from './components/QuizResults'
import { QuizSetup } from './components/QuizSetup'

type Screen = 'setup' | 'quiz' | 'results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [filters, setFilters] = useState<QuizFilters | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const startQuiz = useCallback((nextFilters: QuizFilters) => {
    const nextQuestions = createQuiz(nextFilters)
    if (nextQuestions.length === 0) return

    setFilters(nextFilters)
    setQuestions(nextQuestions)
    setIndex(0)
    setAnswers({})
    setScreen('quiz')
  }, [])

  const currentQuestion = questions[index]
  const selectedIndex = answers[index] ?? null
  const showFeedback = selectedIndex !== null

  const score = useMemo(
    () =>
      questions.reduce(
        (total, question, questionIndex) =>
          answers[questionIndex] === question.correctIndex ? total + 1 : total,
        0,
      ),
    [answers, questions],
  )

  const handleSelect = (optionIndex: number) => {
    if (!currentQuestion || showFeedback) return
    setAnswers((current) => ({ ...current, [index]: optionIndex }))
  }

  const goToPrevious = () => {
    setIndex((current) => Math.max(0, current - 1))
  }

  const goToNext = () => {
    if (index + 1 >= questions.length) {
      setScreen('results')
      return
    }
    setIndex((current) => current + 1)
  }

  const retry = () => {
    if (!filters) return
    startQuiz(filters)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,174,239,0.14),_transparent_38%),linear-gradient(180deg,_#f4fbff_0%,_#ffffff_55%,_#eef8fd_100%)]">
      {screen === 'setup' ? <QuizSetup onStart={startQuiz} /> : null}

      {screen === 'quiz' && currentQuestion ? (
        <QuizQuestionView
          question={currentQuestion}
          questionNumber={index + 1}
          total={questions.length}
          selectedIndex={selectedIndex}
          showFeedback={showFeedback}
          canGoBack={index > 0}
          canGoForward={showFeedback}
          isLastQuestion={index + 1 >= questions.length}
          onSelect={handleSelect}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      ) : null}

      {screen === 'results' ? (
        <QuizResults
          score={score}
          total={questions.length}
          onRetry={retry}
          onRestart={() => setScreen('setup')}
        />
      ) : null}
    </main>
  )
}
