import { getTechnique } from '../data/db'

export interface TechniqueInfo {
  id: string
  name: string
  description?: string
  youtube?: string
}

export function youtubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim()
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/,
  )
  if (!match) return null
  return `https://www.youtube-nocookie.com/embed/${match[1]}`
}

function toTechniqueInfo(id: string): TechniqueInfo | null {
  const technique = getTechnique(id)
  if (!technique) return null
  if (!technique.description && !technique.youtube) return null
  return {
    id: technique.id,
    name: technique.name,
    description: technique.description,
    youtube: technique.youtube,
  }
}

export function resolveTechniqueInfo(ids: string[]): TechniqueInfo[] {
  const seen = new Set<string>()
  const result: TechniqueInfo[] = []

  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    const info = toTechniqueInfo(id)
    if (info) result.push(info)
  }

  return result
}

export function hasTechniqueInfo(ids: string[]): boolean {
  return resolveTechniqueInfo(ids).length > 0
}
