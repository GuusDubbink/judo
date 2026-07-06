import type { ReactNode } from 'react'

interface ScreenHeaderProps {
  onHome: () => void
  trailing: ReactNode
}

export function ScreenHeader({ onHome, trailing }: ScreenHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onHome}
        aria-label="Terug naar start"
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition hover:border-club-blue hover:bg-club-blue-light hover:text-club-blue"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {trailing}
    </div>
  )
}
