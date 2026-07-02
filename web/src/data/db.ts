import data from '@data'
import type { JudoData, Technique } from '../types'

export const db: JudoData = data

export const techniqueById = new Map<string, Technique>(
  db.techniques.map((technique) => [technique.id, technique]),
)

export function getTechnique(id: string): Technique | undefined {
  return techniqueById.get(id)
}
