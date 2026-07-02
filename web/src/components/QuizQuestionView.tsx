import type { QuizQuestion } from '../types'
import { QUESTION_TYPE_LABELS } from '../lib/constants'

interface QuizQuestionViewProps {
  question: QuizQuestion
  questionNumber: number
  total: number
  selectedIndex: number | null
  showFeedback: boolean
  canGoBack: boolean
  canGoForward: boolean
  isLastQuestion: boolean
  onSelect: (index: number) => void
  onPrevious: () => void
  onNext: () => void
  onHome: () => void
  validIndices: readonly number[]
}

export function QuizQuestionView({
  question,
  questionNumber,
  total,
  selectedIndex,
  showFeedback,
  canGoBack,
  canGoForward,
  isLastQuestion,
  onSelect,
  onPrevious,
  onNext,
  onHome,
  validIndices,
}: QuizQuestionViewProps) {
  const progress = (questionNumber / total) * 100

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-6 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onHome}
          className="min-h-11 rounded-lg px-2 text-sm font-medium text-club-blue transition hover:bg-club-blue-light sm:px-3"
        >
          ← Start
        </button>
        <span className="text-sm text-muted capitalize">
          {QUESTION_TYPE_LABELS[question.type]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted">
          Vraag {questionNumber} van {total}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-club-blue-light">
          <div
            className="h-full rounded-full bg-club-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-8">
        <p className="text-base text-muted sm:text-lg">{question.prompt}</p>
        {question.hint ? (
          <p className="mt-3 text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl">
            {question.hint}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2.5 sm:gap-3">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedIndex === optionIndex
          const isValid = validIndices.includes(optionIndex)
          let classes =
            'min-h-12 rounded-xl border px-4 py-3.5 text-left text-base font-medium transition sm:px-5 sm:py-4'

          if (!showFeedback) {
            classes += isSelected
              ? ' border-club-blue bg-club-blue-light text-ink'
              : ' border-border bg-surface text-ink active:bg-club-blue-soft hover:border-club-blue hover:bg-club-blue-soft'
          } else if (isValid) {
            classes += ' border-correct bg-green-50 text-ink'
          } else if (isSelected) {
            classes += ' border-wrong bg-red-50 text-ink'
          } else {
            classes += ' border-border bg-surface text-muted'
          }

          return (
            <button
              key={`${question.id}-${option}`}
              type="button"
              disabled={showFeedback}
              onClick={() => onSelect(optionIndex)}
              className={classes}
            >
              {option}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1 sm:pt-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoBack}
          className="min-h-12 rounded-xl border border-border bg-surface px-4 py-3 font-semibold text-ink transition hover:border-club-blue hover:bg-club-blue-soft disabled:cursor-not-allowed disabled:border-border disabled:text-muted disabled:hover:bg-surface"
        >
          Vorige
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoForward}
          className="min-h-12 rounded-xl bg-club-blue px-4 py-3 font-semibold text-white transition hover:bg-club-blue-dark disabled:cursor-not-allowed disabled:bg-club-blue-light disabled:text-muted"
        >
          {isLastQuestion ? 'Resultaat' : 'Volgende'}
        </button>
      </div>
    </div>
  )
}
