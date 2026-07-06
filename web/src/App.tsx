import { useCallback } from 'react'
import { useQuiz } from './hooks/useQuiz'
import { QuizQuestionView } from './components/QuizQuestionView'
import { QuizResults } from './components/QuizResults'
import { QuizSetup } from './components/QuizSetup'
import { StudyView } from './components/StudyView'
import { exitNativeApp, useAndroidBackButton } from './lib/native'
import type { QuizFilters, QuizMode } from './types'

export default function App() {
  const quiz = useQuiz()

  const handleStart = useCallback(
    (filters: QuizFilters, mode: QuizMode) => {
      if (mode === 'study') quiz.startStudy(filters)
      else quiz.startQuiz(filters)
    },
    [quiz],
  )

  // Map the Android hardware back button onto the quiz's own navigation.
  const handleBack = useCallback(() => {
    if (quiz.screen === 'quiz') {
      if (quiz.canGoBack) quiz.goToPrevious()
      else quiz.goHome()
    } else if (quiz.screen === 'study') {
      if (quiz.canStudyPrevious) quiz.studyPrevious()
      else quiz.goHome()
    } else if (quiz.screen === 'results') {
      quiz.goHome()
    } else {
      // Already on the setup/home screen — let back close the app.
      void exitNativeApp()
    }
  }, [quiz])
  useAndroidBackButton(handleBack)

  return (
    <main className="min-h-screen pt-[env(safe-area-inset-top)] bg-[radial-gradient(circle_at_top,_rgba(0,174,239,0.14),_transparent_38%),linear-gradient(180deg,_#f4fbff_0%,_#ffffff_55%,_#eef8fd_100%)]">
      {quiz.screen === 'setup' ? <QuizSetup onStart={handleStart} /> : null}

      {quiz.screen === 'study' && quiz.studyCard ? (
        <StudyView
          card={quiz.studyCard}
          cardNumber={quiz.studyNumber}
          total={quiz.studyTotal}
          canGoBack={quiz.canStudyPrevious}
          canGoForward={quiz.canStudyNext}
          onPrevious={quiz.studyPrevious}
          onNext={quiz.studyNext}
          onHome={quiz.goHome}
        />
      ) : null}

      {quiz.screen === 'quiz' && quiz.currentQuestion ? (
        <QuizQuestionView
          question={quiz.currentQuestion}
          questionNumber={quiz.questionNumber}
          total={quiz.total}
          selectedIndex={quiz.selectedIndex}
          showFeedback={quiz.showFeedback}
          canGoBack={quiz.canGoBack}
          canGoForward={quiz.canGoForward}
          isLastQuestion={quiz.isLastQuestion}
          onSelect={quiz.handleSelect}
          onPrevious={quiz.goToPrevious}
          onNext={quiz.goToNext}
          onHome={quiz.goHome}
          validIndices={quiz.validIndices}
        />
      ) : null}

      {quiz.screen === 'results' ? (
        <QuizResults
          score={quiz.score}
          total={quiz.total}
          onRetry={quiz.retry}
          onRestart={quiz.goHome}
        />
      ) : null}
    </main>
  )
}
