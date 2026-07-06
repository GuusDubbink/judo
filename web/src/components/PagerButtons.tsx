interface PagerButtonsProps {
  canGoBack: boolean
  canGoForward: boolean
  onPrevious: () => void
  onNext: () => void
  nextLabel?: string
}

export function PagerButtons({
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  nextLabel = 'Volgende',
}: PagerButtonsProps) {
  return (
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
        {nextLabel}
      </button>
    </div>
  )
}
