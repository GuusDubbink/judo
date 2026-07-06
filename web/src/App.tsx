import { useCallback } from 'react'
import { useQuiz } from './hooks/useQuiz'
import { QuizQuestionView } from './components/QuizQuestionView'
import { QuizResults } from './components/QuizResults'
import { QuizSetup } from './components/QuizSetup'
import { SettingsView } from './components/SettingsView'
import { StudyView } from './components/StudyView'
import { exitNativeApp, useAndroidBackButton } from './lib/native'
import type { QuizMode, SetupFilters } from './types'

export default function App() {
  const {
    screen,
    setupMode,
    setupFilters,
    questionCount,
    excludedQuestionTypes,
    setSetupMode,
    setSetupFilters,
    setQuestionCount,
    setQuestionTypeIncluded,
    openSettings,
    closeSettings,
    studyCard,
    studyNumber,
    studyTotal,
    studyCatalog,
    studySection,
    canStudyPrevious,
    canStudyNext,
    studyPrevious,
    studyNext,
    studyGoTo,
    currentQuestion,
    questionNumber,
    total,
    selectedIndex,
    showFeedback,
    canGoBack,
    canGoForward,
    isLastQuestion,
    score,
    missedReviews,
    startQuiz,
    startStudy,
    goHome,
    handleSelect,
    goToPrevious,
    goToNext,
    retry,
    validIndices,
  } = useQuiz()

  const handleStart = useCallback(
    (filters: SetupFilters, mode: QuizMode) => {
      if (mode === 'study') startStudy(filters)
      else startQuiz(filters)
    },
    [startStudy, startQuiz],
  )

  const handleBack = useCallback(() => {
    if (screen === 'settings') {
      closeSettings()
    } else if (screen === 'quiz') {
      if (canGoBack) goToPrevious()
      else goHome()
    } else if (screen === 'study') {
      if (canStudyPrevious) studyPrevious()
      else goHome()
    } else if (screen === 'results') {
      goHome()
    } else {
      void exitNativeApp()
    }
  }, [
    screen,
    closeSettings,
    canGoBack,
    goToPrevious,
    goHome,
    canStudyPrevious,
    studyPrevious,
  ])
  useAndroidBackButton(handleBack)

  return (
    <main className="min-h-screen pt-[env(safe-area-inset-top)] bg-[radial-gradient(circle_at_top,_rgba(0,174,239,0.14),_transparent_38%),linear-gradient(180deg,_#f4fbff_0%,_#ffffff_55%,_#eef8fd_100%)]">
      {screen === 'setup' ? (
        <QuizSetup
          mode={setupMode}
          filters={setupFilters}
          questionCount={questionCount}
          excludedQuestionTypes={excludedQuestionTypes}
          onModeChange={setSetupMode}
          onFiltersChange={setSetupFilters}
          onOpenSettings={openSettings}
          onStart={handleStart}
        />
      ) : null}

      {screen === 'settings' ? (
        <SettingsView
          questionCount={questionCount}
          excludedQuestionTypes={excludedQuestionTypes}
          onQuestionCountChange={setQuestionCount}
          onQuestionTypeIncludedChange={setQuestionTypeIncluded}
          onBack={closeSettings}
        />
      ) : null}

      {screen === 'study' && studyCard ? (
        <StudyView
          card={studyCard}
          cardNumber={studyNumber}
          total={studyTotal}
          index={studyCatalog}
          section={studySection}
          canGoBack={canStudyPrevious}
          canGoForward={canStudyNext}
          onPrevious={studyPrevious}
          onNext={studyNext}
          onGoTo={studyGoTo}
          onHome={goHome}
        />
      ) : null}

      {screen === 'quiz' && currentQuestion ? (
        <QuizQuestionView
          question={currentQuestion}
          questionNumber={questionNumber}
          total={total}
          selectedIndex={selectedIndex}
          showFeedback={showFeedback}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          isLastQuestion={isLastQuestion}
          onSelect={handleSelect}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onHome={goHome}
          validIndices={validIndices}
        />
      ) : null}

      {screen === 'results' ? (
        <QuizResults
          score={score}
          total={total}
          missedReviews={missedReviews}
          onRetry={retry}
          onRestart={goHome}
        />
      ) : null}
    </main>
  )
}

