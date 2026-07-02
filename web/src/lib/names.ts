import type { GlossaryEntry, Technique } from '../types'

/** Primary display name plus optional alternate spellings for the same syllabus entry. */
export function techniqueAllNames(technique: Technique): string[] {
  return [technique.name, ...(technique.aliases ?? [])]
}

export function techniqueNameSet(technique: Technique): Set<string> {
  return new Set(techniqueAllNames(technique))
}

export function techniqueMatchesName(technique: Technique, name: string): boolean {
  return techniqueNameSet(technique).has(name)
}

export function techniqueOverlapsNames(technique: Technique, names: Set<string>): boolean {
  return techniqueAllNames(technique).some((name) => names.has(name))
}

/** Primary Dutch meaning plus optional alternate translations. */
export function glossaryAllMeanings(entry: GlossaryEntry): string[] {
  return [entry.nl, ...(entry.nl_aliases ?? [])]
}

export function glossaryMeaningSet(entry: GlossaryEntry): Set<string> {
  return new Set(glossaryAllMeanings(entry))
}

export function glossaryMatchesMeaning(entry: GlossaryEntry, meaning: string): boolean {
  return glossaryMeaningSet(entry).has(meaning)
}

export function glossaryOverlapsMeanings(entry: GlossaryEntry, meanings: Set<string>): boolean {
  return glossaryAllMeanings(entry).some((meaning) => meanings.has(meaning))
}
