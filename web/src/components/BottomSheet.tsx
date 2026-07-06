import { useId, type ReactNode, type RefObject } from 'react'
import { useModalLock } from '../hooks/useModalLock'

interface BottomSheetProps {
  open: boolean
  title: string
  overlayLabel: string
  onClose: () => void
  closeButtonRef?: RefObject<HTMLButtonElement | null>
  children: ReactNode
}

export function BottomSheet({
  open,
  title,
  overlayLabel,
  onClose,
  closeButtonRef,
  children,
}: BottomSheetProps) {
  const titleId = useId()
  useModalLock(open, onClose)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={overlayLabel}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-t-2xl border border-border bg-surface shadow-xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-ink">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-xl text-muted transition hover:bg-club-blue-light hover:text-ink"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
