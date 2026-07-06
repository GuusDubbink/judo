import { getTechnique } from '../data/db'

export interface TechniqueInfo {
  id: string
  name: string
  description?: string
  youtube?: string
}

/** Skip intros/logos at the start of every technique video. */
export const YOUTUBE_START_SECONDS = 5

export function youtubeEmbedUrl(url: string, autoplay = true): string | null {
  const trimmed = url.trim()
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/,
  )
  if (!match) return null

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })
  if (autoplay) {
    params.set('autoplay', '1')
    params.set('mute', '1')
  }
  params.set('start', String(YOUTUBE_START_SECONDS))

  return `https://www.youtube-nocookie.com/embed/${match[1]}?${params.toString()}`
}

/** Extract the 11-char YouTube video id from a watch/share/embed URL. */
export function youtubeVideoId(url: string): string | null {
  const match = url
    .trim()
    .match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/)
  return match ? match[1] : null
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

export function resolveSingleTechniqueInfo(id: string | undefined): TechniqueInfo | null {
  if (!id) return null
  return toTechniqueInfo(id)
}

export function hasTechniqueInfo(ids: string[]): boolean {
  return resolveTechniqueInfo(ids).length > 0
}

export function hasEnrichableTechnique(id: string | undefined): boolean {
  return resolveSingleTechniqueInfo(id) !== null
}
