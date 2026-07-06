import { useEffect, useRef } from 'react'
import { isInSection, type StudyIndexNode, type StudySection } from '../lib/study'
import { BottomSheet } from './BottomSheet'

interface StudyIndexSheetProps {
  open: boolean
  index: StudyIndexNode[]
  activeIndex: number
  glossary: boolean
  onClose: () => void
  onSelect: (startIndex: number) => void
}

export function StudyIndexSheet({
  open,
  index,
  activeIndex,
  glossary,
  onClose,
  onSelect,
}: StudyIndexSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) closeButtonRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open || !listRef.current) return
    const activeElements = listRef.current.querySelectorAll<HTMLElement>('[data-active="true"]')
    const target = activeElements[activeElements.length - 1] ?? activeElements[0]
    target?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  return (
    <BottomSheet
      open={open}
      title={glossary ? 'Woordenlijst' : 'Categorieën'}
      overlayLabel="Sluit inhoud"
      onClose={onClose}
      closeButtonRef={closeButtonRef}
    >
      <div
        ref={listRef}
        className="overflow-y-auto overscroll-y-contain px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
      >
        <ul className="flex flex-col gap-1">
          {index.map((node) =>
            node.kind === 'section' ? (
              <li key={node.section.id}>
                <IndexRow
                  section={node.section}
                  active={isInSection(node.section, activeIndex)}
                  glossary={glossary}
                  onSelect={onSelect}
                />
              </li>
            ) : (
              <li key={node.group.id} className="flex flex-col gap-1">
                <IndexRow
                  section={node.group}
                  active={isInSection(node.group, activeIndex)}
                  glossary={glossary}
                  onSelect={onSelect}
                />
                <ul className="ml-3 flex flex-col gap-1 border-l-2 border-club-blue-light pl-3">
                  {node.group.children.map((child) => (
                    <li key={child.id}>
                      <IndexRow
                        section={child}
                        active={isInSection(child, activeIndex)}
                        glossary={glossary}
                        nested
                        onSelect={onSelect}
                      />
                    </li>
                  ))}
                </ul>
              </li>
            ),
          )}
        </ul>
      </div>
    </BottomSheet>
  )
}

function IndexRow({
  section,
  active,
  glossary,
  nested = false,
  onSelect,
}: {
  section: StudySection
  active: boolean
  glossary: boolean
  nested?: boolean
  onSelect: (startIndex: number) => void
}) {
  const countLabel = glossary
    ? `${section.count} ${section.count === 1 ? 'woord' : 'woorden'}`
    : `${section.count} ${section.count === 1 ? 'techniek' : 'technieken'}`

  return (
    <button
      type="button"
      data-active={active ? 'true' : undefined}
      onClick={() => onSelect(section.startIndex)}
      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition sm:px-4 ${
        active
          ? nested
            ? 'bg-club-blue-light text-ink ring-1 ring-club-blue/40'
            : 'bg-club-blue-light text-ink ring-1 ring-club-blue/30'
          : 'text-ink hover:bg-club-blue-soft'
      }`}
    >
      <span className={nested ? 'font-medium' : 'font-semibold'}>{section.label}</span>
      <span className="shrink-0 text-sm text-muted">{countLabel}</span>
    </button>
  )
}
