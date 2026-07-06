import {
  QUESTION_COUNTS,
  QUESTION_TYPE_SETTING_LABELS,
  SETTINGS_QUESTION_TYPE_ORDER,
} from '../lib/constants'
import type { ConfigurableQuestionType } from '../lib/settings'
import { ScreenHeader } from './ScreenHeader'

interface SettingsViewProps {
  questionCount: number
  excludedQuestionTypes: ConfigurableQuestionType[]
  onQuestionCountChange: (count: number) => void
  onQuestionTypeIncludedChange: (type: ConfigurableQuestionType, included: boolean) => void
  onBack: () => void
}

export function SettingsView({
  questionCount,
  excludedQuestionTypes,
  onQuestionCountChange,
  onQuestionTypeIncludedChange,
  onBack,
}: SettingsViewProps) {
  const excluded = new Set(excludedQuestionTypes)
  const includedCount = SETTINGS_QUESTION_TYPE_ORDER.length - excluded.size

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

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-ink">Soorten vragen</h2>
        <p className="mb-4 text-sm text-muted">
          Alleen voor Oefenen. Woordenlijst kies je op het startscherm bij Type. Tik om een
          soort uit of aan te zetten.
        </p>
        <div className="flex flex-col gap-2">
          {SETTINGS_QUESTION_TYPE_ORDER.map((type) => {
            const included = !excluded.has(type)
            const isLastIncluded = included && includedCount === 1

            return (
              <button
                key={type}
                type="button"
                aria-pressed={included}
                disabled={isLastIncluded}
                onClick={() => onQuestionTypeIncludedChange(type, !included)}
                className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  included
                    ? 'border-club-blue bg-club-blue-light text-ink'
                    : 'border-border bg-surface text-muted hover:border-club-blue hover:text-ink'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span>{QUESTION_TYPE_SETTING_LABELS[type]}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {included ? 'Aan' : 'Uit'}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
