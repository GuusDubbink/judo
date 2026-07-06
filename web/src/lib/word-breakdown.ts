import { db } from '../data/db'

/** Lowercase and drop everything but a–z so "Gatame," / "O" match glossary keys. */
const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z]/g, '')

// term (and its "(ook X)" variants) → Dutch meaning. Built once from the glossary.
const glossaryLookup: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const entry of db.glossary) {
    const main = normalize(entry.term.split('(')[0])
    if (main && !map.has(main)) map.set(main, entry.nl)
    for (const match of entry.term.matchAll(/ook\s+([a-zA-Z]+)/gi)) {
      const variant = normalize(match[1])
      if (variant && !map.has(variant)) map.set(variant, entry.nl)
    }
  }
  return map
})()

export interface WordPart {
  word: string
  meaning?: string
}

/**
 * Split a Japanese technique name into its words and attach each word's meaning
 * from the glossary. Words with no glossary entry (typos, compounds) come back
 * with `meaning: undefined` so callers can still show the full name broken down.
 */
export function breakdownName(name: string): WordPart[] {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word, meaning: glossaryLookup.get(normalize(word)) }))
}

/** True when at least one word in the name resolves to a glossary meaning. */
export function hasDecodableWord(name: string): boolean {
  return breakdownName(name).some((part) => part.meaning !== undefined)
}
