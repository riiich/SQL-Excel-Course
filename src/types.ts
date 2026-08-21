export type SqlValue = string | number | null

export type Difficulty = 'Foundation' | 'Intermediate' | 'Advanced' | 'Expert'

export interface Exercise {
  prompt: string
  task: string
  setupSql: string
  starterSql: string
  solutionSql: string
  expectedColumns: string[]
  expectedRows: SqlValue[][]
  ordered?: boolean
  requiredTerms?: string[]
  hints: string[]
}

export interface RealWorldExample {
  context: string
  title: string
  purpose: string
  code: string
}

export interface Lesson {
  id: string
  moduleId: string
  number: string
  title: string
  eyebrow: string
  difficulty: Difficulty
  duration: number
  summary: string
  objectives: string[]
  keyIdeas: string[]
  realWorldExamples: RealWorldExample[]
  syntax: string
  proTip: string
  concepts: string[]
  exercise: Exercise
}

export interface CurriculumModule {
  id: string
  index: number
  title: string
  summary: string
  accent: string
  lessons: Lesson[]
}

export interface QueryResult {
  columns: string[]
  rows: SqlValue[][]
  duration: number
  affectedRows: number
}

export interface SchemaItem {
  name: string
  type: string
  sql: string
}

export interface CampaignColumn {
  name: string
  type: string
  meaning: string
}

export interface CampaignTable {
  name: string
  description: string
  columns: CampaignColumn[]
  rows: SqlValue[][]
}

export interface CampaignExplanation {
  summary: string
  steps: string[]
  takeaway: string
}

export interface CampaignChallenge extends Exercise {
  id: string
  level: 1 | 2 | 3 | 4 | 5
  title: string
  briefing: string
  skills: string[]
  explanation: CampaignExplanation
  validationMode?: 'sqlite' | 'definition'
}

export interface CampaignChapter {
  id: string
  number: string
  title: string
  concept: string
  concepts: string[]
  setting: string
  synopsis: string
  accent: string
  icon: string
  tables: CampaignTable[]
  setupSql: string
  challenges: CampaignChallenge[]
}

export interface ChallengeQuestion extends Exercise {
  id: string
  title: string
  difficulty: 'Medium' | 'Hard'
  mode: 'Focused' | 'Applied' | 'Mixed'
  skills: string[]
  explanation: string[]
  validationMode?: 'sqlite' | 'definition'
}

export interface ChallengeTopic {
  id: string
  moduleId: string
  number: string
  title: string
  summary: string
  questions: ChallengeQuestion[]
}

export interface ChallengeModule {
  id: string
  index: number
  title: string
  accent: string
  topics: ChallengeTopic[]
}

export type ExcelValue = string | number | null

export interface ExcelColumn {
  key: string
  label: string
  meaning: string
}

export interface ExcelSheet {
  name: string
  description: string
  columns: ExcelColumn[]
  rows: ExcelValue[][]
  tableName?: string
}

export interface ExcelMechanic {
  part: string
  title: string
  explanation: string
  why: string
  example: string
}

export interface ExcelFormulaExercise {
  id: string
  title: string
  task: string
  targetCell: string
  starterFormula: string
  solutionFormula: string
  acceptedFormulas?: string[]
  expectedValue: ExcelValue | string
  resultNote: string
  hints: string[]
  explanation: string[]
}

export interface ExcelFormulaSpotlight {
  formula: string
  powerful: string
  whenToUse: string
  practicalExample: string
  result: string
}

export interface ExcelLesson {
  id: string
  number: string
  title: string
  eyebrow: string
  duration: number
  difficulty: Difficulty
  summary: string
  objectives: string[]
  concepts: string[]
  mechanics: ExcelMechanic[]
  formulaSpotlights: ExcelFormulaSpotlight[]
  realWorldExample: { context: string; title: string; purpose: string; formula: string }
  proTip: string
  workbook: ExcelSheet[]
  exercises: ExcelFormulaExercise[]
}

export interface ProgressState {
  version: 1
  completed: string[]
  completedExercises: string[]
  labOutcomes: Record<string, 'passed' | 'failed'>
  campaignCompleted: string[]
  campaignOutcomes: Record<string, 'passed' | 'failed'>
  campaignRevealed: string[]
  challengeCompleted: string[]
  challengeOutcomes: Record<string, 'passed' | 'failed'>
  challengeRevealed: string[]
  excelCompleted: string[]
  excelCompletedExercises: string[]
  excelOutcomes: Record<string, 'passed' | 'failed'>
  attempts: Record<string, number>
  hints: Record<string, number>
  drafts: Record<string, string>
  lastLesson: string | null
  lastCampaignChapter: string | null
  lastChallengeTopic: string | null
  lastExcelLesson: string | null
}
