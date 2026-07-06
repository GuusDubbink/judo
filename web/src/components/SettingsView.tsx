import { QUESTION_COUNTS } from '../lib/constants'
import { ScreenHeader } from './ScreenHeader'

interface SettingsViewProps {
  questionCount: number
  onQuestionCountChange: (count: number) => void
  onBack: () => void
}

export function SettingsView({
  questionCount,
  onQuestionCountChange,
  onBack,
}: SettingsViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-8 sm:py-8">
      <ScreenHeader
        onHome={onBack}
        trailing={<span className="text-sm font-semibold text-ink">Instellingen</span>}
      />

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-ink">Aantal vragen per quiz</h2>
        <p className="mb-4 text-sm text-muted">Standaard 10. Wordt onthouden op dit apparaat.</p>
        <div className="flex flex-wrap gap-2">
          {QUESTION_COUNTS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={questionCount === value}
              onClick={() => onQuestionCountChange(value)}
              className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                questionCount === value
                  ? 'border-club-blue bg-club-blue-light text-ink'
                  : 'border-border bg-surface text-muted active:bg-club-blue-soft hover:border-club-blue hover:text-ink'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
