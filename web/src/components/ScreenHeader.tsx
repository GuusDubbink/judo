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
        className="min-h-11 rounded-lg px-2 text-sm font-medium text-club-blue transition hover:bg-club-blue-light sm:px-3"
      >
        ← Start
      </button>
      {trailing}
    </div>
  )
}
