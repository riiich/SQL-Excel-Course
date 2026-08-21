import type { Exercise, QueryResult, SqlValue } from '../types'

export interface Validation {
  passed: boolean
  title: string
  message: string
}

const normalizeValue = (value: SqlValue) => {
  if (typeof value === 'number') return Number(value.toFixed(8))
  return value
}

const rowKey = (row: SqlValue[]) => JSON.stringify(row.map(normalizeValue))

export function validateResult(sql: string, result: QueryResult, exercise: Exercise): Validation {
  if (!result.columns.length) {
    return { passed: false, title: 'No result set yet', message: 'Finish with a SELECT statement so the result can be checked.' }
  }

  const actualColumns = result.columns.map((column) => column.toLowerCase())
  const expectedColumns = exercise.expectedColumns.map((column) => column.toLowerCase())
  if (JSON.stringify(actualColumns) !== JSON.stringify(expectedColumns)) {
    return {
      passed: false,
      title: 'Check your columns',
      message: `Expected ${exercise.expectedColumns.join(', ')} — received ${result.columns.join(', ')}.`,
    }
  }

  const missingTerm = exercise.requiredTerms?.find((term) => !sql.toUpperCase().includes(term.toUpperCase()))
  if (missingTerm) {
    return { passed: false, title: 'Right result, different technique', message: `This lesson asks you to practice ${missingTerm}. Keep the result, but rewrite with that construct.` }
  }

  const actual = result.rows.map(rowKey)
  const expected = exercise.expectedRows.map(rowKey)
  if (!exercise.ordered) {
    actual.sort()
    expected.sort()
  }

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    return {
      passed: false,
      title: 'Almost—inspect the rows',
      message: `Expected ${expected.length} matching row${expected.length === 1 ? '' : 's'}, but this result differs. Check filters, grouping, and ordering.`,
    }
  }

  return { passed: true, title: 'Query accepted', message: 'Your result and requested technique both match. Nicely reasoned.' }
}
