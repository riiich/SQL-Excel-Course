import { describe, expect, it } from 'vitest'
import initSqlJs from 'sql.js'
import { campaignChapters } from '../data/campaign'
import { challengeModules, challengeQuestionCount, challengeQuestions, challengeTopics } from '../data/challenges'
import { excelLessons } from '../data/excelCurriculum'
import { lessons } from '../data/curriculum'
import { getDeepDive } from '../data/deepDives'
import { getLabExercises } from '../data/labExercises'
import type { QueryResult, SqlValue } from '../types'
import { validateResult } from './validate'

describe('curriculum exercises', () => {
  const exerciseCases = lessons.flatMap((lesson) => getLabExercises(lesson).map((exercise, index) => [`${lesson.id}:${index}`, exercise] as const))

  it.each(exerciseCases)(
    '%s canonical solution executes and passes',
    async (_id, exercise) => {
      const SQL = await initSqlJs()
      const database = new SQL.Database()
      database.run(exercise.setupSql)
      const results = database.exec(exercise.solutionSql)
      const last = results[results.length - 1]
      const result: QueryResult = {
        columns: last?.columns ?? [],
        rows: (last?.values ?? []) as SqlValue[][],
        duration: 0,
        affectedRows: database.getRowsModified(),
      }

      expect(validateResult(exercise.solutionSql, result, exercise)).toMatchObject({ passed: true })
      database.close()
    },
  )
})

describe('SQL Ops campaign', () => {
  const missionCases = campaignChapters.flatMap((chapter) => chapter.challenges.map((challenge) => [challenge.id, chapter, challenge] as const))

  it('contains fifteen concepts with five progressive missions each', () => {
    expect(campaignChapters).toHaveLength(15)
    for (const chapter of campaignChapters) {
      expect(chapter.challenges).toHaveLength(5)
      expect(chapter.challenges.map((challenge) => challenge.level)).toEqual([1, 2, 3, 4, 5])
      expect(chapter.concepts.length).toBeGreaterThanOrEqual(3)
    }
  })

  it.each(missionCases)('%s has five hints, reference data, and an explained answer', (_id, chapter, challenge) => {
    expect(challenge.hints).toHaveLength(5)
    expect(challenge.explanation.steps.length).toBeGreaterThanOrEqual(3)
    expect(challenge.explanation.takeaway.length).toBeGreaterThan(20)
    expect(chapter.tables.length).toBeGreaterThan(0)
  })

  it.each(missionCases)('%s canonical solution executes and passes', async (_id, chapter, challenge) => {
    if (challenge.validationMode === 'definition') {
      const normalizedSolution = challenge.solutionSql.toUpperCase().replace(/\s+/g, ' ')
      for (const term of challenge.requiredTerms ?? []) expect(normalizedSolution).toContain(term.toUpperCase())
      return
    }
    const SQL = await initSqlJs()
    const database = new SQL.Database()
    database.run(chapter.setupSql)
    const results = database.exec(challenge.solutionSql)
    const last = results[results.length - 1]
    const result: QueryResult = {
      columns: last?.columns ?? [],
      rows: (last?.values ?? []) as SqlValue[][],
      duration: 0,
      affectedRows: database.getRowsModified(),
    }

    expect(validateResult(challenge.solutionSql, result, challenge)).toMatchObject({ passed: true })
    database.close()
  })
})

describe('Challenge Yourself', () => {
  it('organizes all nineteen SQL topics into modules with three challenges each', () => {
    expect(challengeModules.length).toBeGreaterThan(0)
    expect(challengeTopics).toHaveLength(lessons.length)
    expect(challengeQuestionCount).toBe(lessons.length * 3)
    expect(challengeQuestionCount).toBe(57)

    for (const topic of challengeTopics) {
      expect(topic.questions).toHaveLength(3)
      expect(topic.questions.map((question) => question.mode)).toEqual(['Focused', 'Applied', 'Mixed'])
      expect(topic.questions.every((question) => question.difficulty === 'Medium' || question.difficulty === 'Hard')).toBe(true)
      expect(topic.questions.some((question) => question.difficulty === 'Hard')).toBe(true)
    }
  })

  it.each(challengeQuestions.map((question) => [question.id, question] as const))(
    '%s has substantial guidance and an explained answer',
    (_id, question) => {
      expect(question.hints.length).toBeGreaterThanOrEqual(3)
      expect(question.explanation.length).toBeGreaterThanOrEqual(3)
      expect(question.skills.length).toBeGreaterThan(0)
      expect(question.solutionSql.trim().length).toBeGreaterThan(0)
    },
  )

  it.each(challengeQuestions.map((question) => [question.id, question] as const))(
    '%s canonical solution executes and passes',
    async (_id, question) => {
      if (question.validationMode === 'definition') {
        const normalizedSolution = question.solutionSql.toUpperCase().replace(/\s+/g, ' ')
        for (const term of question.requiredTerms ?? []) expect(normalizedSolution).toContain(term.toUpperCase())
        return
      }

      const SQL = await initSqlJs()
      const database = new SQL.Database()
      database.run(question.setupSql)
      const results = database.exec(question.solutionSql)
      const last = results[results.length - 1]
      const result: QueryResult = {
        columns: last?.columns ?? [],
        rows: (last?.values ?? []) as SqlValue[][],
        duration: 0,
        affectedRows: database.getRowsModified(),
      }

      expect(validateResult(question.solutionSql, result, question)).toMatchObject({ passed: true })
      database.close()
    },
  )
})

describe('Excel course', () => {
  it('contains ten lessons with a separate three-formula lab for each lesson', () => {
    expect(excelLessons).toHaveLength(10)
    for (const lesson of excelLessons) {
      expect(lesson.exercises).toHaveLength(3)
      expect(lesson.workbook.length).toBeGreaterThan(0)
      expect(lesson.mechanics.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('explains the power, use, and result of each covered formula or concept', () => {
    for (const lesson of excelLessons) {
      expect(lesson.formulaSpotlights.length).toBeGreaterThanOrEqual(lesson.concepts.length)
      for (const spotlight of lesson.formulaSpotlights) {
        expect(spotlight.powerful.length).toBeGreaterThan(20)
        expect(spotlight.whenToUse.length).toBeGreaterThan(20)
        expect(spotlight.practicalExample.length).toBeGreaterThan(10)
        expect(spotlight.result.length).toBeGreaterThan(10)
      }
    }
  })
})

describe('lesson content', () => {
  it.each(lessons.map((lesson) => [lesson.id, lesson] as const))('%s has detailed mechanics and use cases', (_id, lesson) => {
    const deepDive = getDeepDive(lesson.id)
    expect(deepDive).toBeDefined()
    expect(deepDive.mechanics.length).toBeGreaterThanOrEqual(4)
    expect(deepDive.useCases.length).toBeGreaterThanOrEqual(4)
    expect(deepDive.pitfalls.length).toBeGreaterThanOrEqual(3)
  })

  it('covers all SQLite built-in window-function families', () => {
    const reference = getDeepDive('ranking-windows').reference ?? []
    const names = reference.map((item) => item.name).join(' ')
    for (const name of ['ROW_NUMBER', 'RANK', 'DENSE_RANK', 'PERCENT_RANK', 'CUME_DIST', 'NTILE', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE']) {
      expect(names).toContain(name)
    }
  })
})

describe('result validation', () => {
  const exercise = lessons[0].exercise

  it('rejects a correct result with the wrong columns', () => {
    const result: QueryResult = { columns: ['wrong', 'name'], rows: exercise.expectedRows, duration: 0, affectedRows: 0 }
    expect(validateResult('', result, exercise)).toMatchObject({ passed: false, title: 'Check your columns' })
  })

  it('accepts unordered equivalents when ordering is not required', () => {
    const portable = { ...exercise, ordered: false }
    const result: QueryResult = { columns: exercise.expectedColumns, rows: [...exercise.expectedRows].reverse(), duration: 0, affectedRows: 0 }
    expect(validateResult('', result, portable)).toMatchObject({ passed: true })
  })

  it('rejects a missing required technique even when rows match', () => {
    const techniqueExercise = { ...exercise, requiredTerms: ['NOT EXISTS'] }
    const result: QueryResult = { columns: exercise.expectedColumns, rows: exercise.expectedRows, duration: 0, affectedRows: 0 }
    expect(validateResult('SELECT 1', result, techniqueExercise)).toMatchObject({ passed: false, title: 'Right result, different technique' })
  })
})
