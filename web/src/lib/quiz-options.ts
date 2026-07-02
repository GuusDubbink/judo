import type { GlossaryEntry, Technique } from '../types'
import { DISTRACTOR_COUNT } from './constants'
import { glossaryAllMeanings, techniqueAllNames } from './names'
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
  const usedNames = new Set(techniqueAllNames(correct))
  const distractors: Technique[] = []

  for (const candidate of shuffle(pool.filter((item) => item.id !== correct.id))) {
    const candidateNames = techniqueAllNames(candidate)
    if (candidateNames.some((name) => usedNames.has(name))) continue
    for (const name of candidateNames) usedNames.add(name)
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
  correctMeaning?: string,
): string[] | null {
  const answer = correctMeaning ?? entry.nl
  if (!glossaryAllMeanings(entry).includes(answer)) return null

  const usedMeanings = new Set(glossaryAllMeanings(entry))
  const distractors: GlossaryEntry[] = []

  for (const candidate of shuffle(pool.filter((item) => item.term !== entry.term))) {
    const candidateMeanings = glossaryAllMeanings(candidate)
    if (candidateMeanings.some((meaning) => usedMeanings.has(meaning))) continue
    for (const meaning of candidateMeanings) usedMeanings.add(meaning)
    distractors.push(candidate)
    if (distractors.length === distractorCount) break
  }

  if (distractors.length < distractorCount) return null
  const options = shuffle([answer, ...distractors.map((item) => item.nl)])
  return new Set(options).size === options.length ? options : null
}

export function glossaryTermLabel(term: string): string {
  return term.split('(')[0].trim()
}

export function glossarySlug(term: string): string {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}
