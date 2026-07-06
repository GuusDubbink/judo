import { db } from '../data/db'

/** Lowercase and drop everything but a–z so "Gatame," / "O" match glossary keys. */
const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z]/g, '')

function addGlossaryAlias(map: Map<string, string>, alias: string, meaning: string): void {
  const key = normalize(alias)
  if (key && !map.has(key)) map.set(key, meaning)
}

// term + spelling variants ("(katame)", "ook harai", …) → Dutch meaning. Built once.
const glossaryLookup: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const entry of db.glossary) {
    addGlossaryAlias(map, entry.term.split('(')[0], entry.nl)
    for (const match of entry.term.matchAll(/ook\s+([a-zA-Z]+)/gi)) {
      addGlossaryAlias(map, match[1], entry.nl)
    }
    for (const match of entry.term.matchAll(/\(([a-zA-Z]+)\)/g)) {
      addGlossaryAlias(map, match[1], entry.nl)
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
