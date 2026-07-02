import type { QuizQuestion } from '../types'

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
}: QuizQuestionViewProps) {
  const progress = (questionNumber / total) * 100

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Vraag {questionNumber} van {total}
          </span>
          <span className="capitalize">{questionTypeLabel(question.type)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-club-blue-light">
          <div
            className="h-full rounded-full bg-club-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-lg text-muted">{question.prompt}</p>
        {question.hint ? (
          <p className="mt-4 text-3xl font-bold tracking-tight text-ink">{question.hint}</p>
        ) : null}
      </div>

      <div className="grid gap-3">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedIndex === optionIndex
          const isCorrect = optionIndex === question.correctIndex
          let classes =
            'rounded-xl border px-5 py-4 text-left text-base font-medium transition'

          if (!showFeedback) {
            classes += isSelected
              ? ' border-club-blue bg-club-blue-light text-ink'
              : ' border-border bg-surface text-ink hover:border-club-blue hover:bg-club-blue-soft'
          } else if (isCorrect) {
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

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoBack}
          className="flex-1 rounded-xl border border-border bg-surface px-5 py-3 font-semibold text-ink transition hover:border-club-blue hover:bg-club-blue-soft disabled:cursor-not-allowed disabled:border-border disabled:text-muted disabled:hover:bg-surface"
        >
          Vorige
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoForward}
          className="flex-1 rounded-xl bg-club-blue px-5 py-3 font-semibold text-white transition hover:bg-club-blue-dark disabled:cursor-not-allowed disabled:bg-club-blue-light disabled:text-muted"
        >
          {isLastQuestion ? 'Bekijk resultaat' : 'Volgende'}
        </button>
      </div>
    </div>
  )
}

function questionTypeLabel(type: QuizQuestion['type']): string {
  switch (type) {
    case 'category':
      return 'categorie'
    case 'belt':
      return 'band'
    case 'technique':
      return 'techniek'
    default:
      return type
  }
}
