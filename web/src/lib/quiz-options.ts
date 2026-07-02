import type { GlossaryEntry, Technique } from '../types'
import { DISTRACTOR_COUNT } from './constants'
import { sample, shuffle } from './shuffle'

export function pickDistractors<T>(
  pool: T[],
  correct: T,
  count: number,
  key: (item: T) => string,
): T[] | null {
  const unique = pool.filter((item) => key(item) !== key(correct))
  if (unique.length < count) return null
  return shuffle([correct, ...sample(unique, count)])
}

export function buildUniqueNameOptions(
  correct: Technique,
  pool: Technique[],
  distractorCount: number = DISTRACTOR_COUNT,
): { options: string[]; techniqueIds: string[] } | null {
  const usedNames = new Set([correct.name])
  const distractors: Technique[] = []

  for (const candidate of shuffle(pool.filter((item) => item.id !== correct.id))) {
    if (usedNames.has(candidate.name)) continue
    usedNames.add(candidate.name)
    distractors.push(candidate)
    if (distractors.length === distractorCount) break
  }

  if (distractors.length < distractorCount) return null
  const selected = shuffle([correct, ...distractors])
  return {
    options: selected.map((item) => item.name),
    techniqueIds: selected.map((item) => item.id),
  }
}

export function buildUniqueMeaningOptions(
  entry: GlossaryEntry,
  pool: GlossaryEntry[],
  distractorCount: number = DISTRACTOR_COUNT,
): string[] | null {
  const usedMeanings = new Set([entry.nl])
  const distractors: GlossaryEntry[] = []

  for (const candidate of shuffle(pool.filter((item) => item.term !== entry.term))) {
    if (usedMeanings.has(candidate.nl)) continue
    usedMeanings.add(candidate.nl)
    distractors.push(candidate)
    if (distractors.length === distractorCount) break
  }

  if (distractors.length < distractorCount) return null
  const options = shuffle([entry.nl, ...distractors.map((item) => item.nl)])
  return new Set(options).size === options.length ? options : null
}

export function glossaryTermLabel(term: string): string {
  return term.split('(')[0].trim()
}

export function glossarySlug(term: string): string {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}
