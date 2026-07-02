import type { JudoData, QuizFilters, QuizQuestion } from '../types'
import { OPTION_COUNT } from './constants'
import { getValidOptionIndices } from './quiz-truth'

export interface QuestionValidation {
  questionId: string
  type: QuizQuestion['type']
  hint?: string
  errors: string[]
  ambiguities: string[]
}

export interface ValidationReport {
  filters: QuizFilters
  total: number
  errors: QuestionValidation[]
  ambiguities: QuestionValidation[]
}

function validateQuestion(
  question: QuizQuestion,
  db: JudoData,
): QuestionValidation {
  const result: QuestionValidation = {
    questionId: question.id,
    type: question.type,
    hint: question.hint,
    errors: [],
    ambiguities: [],
  }

  if (question.options.length !== OPTION_COUNT) {
    result.errors.push(`expected ${OPTION_COUNT} options, got ${question.options.length}`)
  }

  const uniqueOptions = new Set(question.options)
  if (uniqueOptions.size !== question.options.length) {
    result.errors.push('duplicate options in question')
  }

  if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
    result.errors.push(`correctIndex ${question.correctIndex} out of range`)
  }

  const validIndices = getValidOptionIndices(question, db)

  if (validIndices.size === 0) {
    result.errors.push('no option matches JSON ground truth')
  }

  if (!validIndices.has(question.correctIndex)) {
    const marked = question.options[question.correctIndex]
    result.errors.push(
      `marked correct option "${marked}" is not valid per JSON (valid: ${[...validIndices].map((i) => `"${question.options[i]}"`).join(', ')})`,
    )
  }

  for (let index = 0; index < question.options.length; index += 1) {
    if (index === question.correctIndex) continue
    if (validIndices.has(index)) {
      result.ambiguities.push(
        `option "${question.options[index]}" is also correct but would be marked wrong`,
      )
    }
  }

  if (validIndices.size > 1) {
    const labels = [...validIndices].map((index) => `"${question.options[index]}"`).join(', ')
    result.ambiguities.push(`multiple valid answers in options: ${labels}`)
  }

  return result
}

export function validateQuestionPool(
  questions: QuizQuestion[],
  db: JudoData,
  filters: QuizFilters,
): ValidationReport {
  const errors: QuestionValidation[] = []
  const ambiguities: QuestionValidation[] = []

  for (const question of questions) {
    const result = validateQuestion(question, db)
    if (result.errors.length > 0) errors.push(result)
    if (result.ambiguities.length > 0) ambiguities.push(result)
  }

  return {
    filters,
    total: questions.length,
    errors,
    ambiguities,
  }
}

export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [
    `filters: belt=${report.filters.belt} domain=${report.filters.domain}`,
    `questions: ${report.total}`,
    `errors: ${report.errors.length}`,
    `ambiguities: ${report.ambiguities.length}`,
  ]

  for (const item of report.errors) {
    lines.push(`ERROR [${item.type}] ${item.questionId}${item.hint ? ` (${item.hint})` : ''}`)
    for (const message of item.errors) lines.push(`  - ${message}`)
  }

  for (const item of report.ambiguities) {
    lines.push(`AMBIGUOUS [${item.type}] ${item.questionId}${item.hint ? ` (${item.hint})` : ''}`)
    for (const message of item.ambiguities) lines.push(`  - ${message}`)
  }

  return lines.join('\n')
}
