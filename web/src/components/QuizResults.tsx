interface QuizResultsProps {
  score: number
  total: number
  onRetry: () => void
  onRestart: () => void
}

export function QuizResults({ score, total, onRetry, onRestart }: QuizResultsProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const message =
    percentage >= 90
      ? 'Uitstekend! Je kent je technieken goed.'
      : percentage >= 70
        ? 'Goed bezig. Nog een ronde helpt om het te versterken.'
        : 'Blijf oefenen — herhaling maakt de meester.'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:gap-8 sm:py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-[0.2em] text-club-blue uppercase">
          Resultaat
        </p>
        <h2 className="text-4xl font-bold text-ink sm:text-5xl">
          {score}/{total}
        </h2>
        <p className="text-xl text-muted sm:text-2xl">{percentage}% correct</p>
      </div>

      <p className="max-w-md text-base text-muted sm:text-lg">{message}</p>

      <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="min-h-12 flex-1 rounded-xl bg-club-blue px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-club-blue-dark"
        >
          Nog een keer
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="min-h-12 flex-1 rounded-xl border border-border bg-surface px-6 py-4 font-semibold text-ink transition hover:border-club-blue hover:bg-club-blue-soft"
        >
          Nieuwe selectie
        </button>
      </div>
    </div>
  )
}
