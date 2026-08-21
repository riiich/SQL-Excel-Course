import type { CampaignChallenge, ChallengeModule, ChallengeQuestion } from '../types'
import { campaignChapters } from './campaign'
import { curriculum, lessons } from './curriculum'
import { getLabExercises } from './labExercises'

type MissionPair = readonly [string, string]

const missionPairs: Record<string, MissionPair> = {
  'select-expressions': ['marketplace-4', 'marketplace-5'],
  'where-null': ['clinic-4', 'clinic-5'],
  'sort-distinct-limit': ['marketplace-3', 'window-5'],
  'group-by-having': ['restaurant-4', 'restaurant-5'],
  'join-basics': ['clinic-3', 'clinic-5'],
  'data-mutations': ['mutations-3', 'mutations-5'],
  'anti-joins': ['clinic-4', 'bank-2'],
  'conditional-aggregation': ['restaurant-4', 'bank-4'],
  'correlated-subqueries': ['bank-3', 'bank-5'],
  'recursive-ctes': ['hierarchy-4', 'hierarchy-5'],
  'ranking-windows': ['window-4', 'window-5'],
  'upserts': ['mutations-4', 'mutations-5'],
  'atomic-transactions': ['transactions-4', 'transactions-5'],
  'data-modeling-tables': ['evacuation-schema-4', 'evacuation-schema-5'],
  'indexes-constraints': ['schema-4', 'performance-5'],
  'views': ['performance-1', 'performance-2'],
  'exists-rewrites': ['bank-2', 'performance-5'],
  'triggers-routines': ['triggers-5', 'routines-5'],
  'revenue-capstone': ['json-5', 'transactions-5'],
}

const campaignQuestion = (missionId: string) => {
  for (const chapter of campaignChapters) {
    const mission = chapter.challenges.find((item) => item.id === missionId)
    if (mission) return { chapter, mission }
  }
  throw new Error(`Unknown campaign mission: ${missionId}`)
}

const fromMission = (lessonId: string, slot: 2 | 3, missionId: string): ChallengeQuestion => {
  const { chapter, mission } = campaignQuestion(missionId)
  const mode = slot === 2 ? 'Applied' : 'Mixed'
  return {
    ...mission,
    id: `${lessonId}-${mode.toLowerCase()}`,
    title: mission.title,
    difficulty: slot === 2 && mission.level < 5 ? 'Medium' : 'Hard',
    mode,
    setupSql: chapter.setupSql,
    explanation: mission.explanation.steps,
    validationMode: mission.validationMode,
  }
}

const focusedQuestion = (lessonId: string): ChallengeQuestion => {
  const lesson = lessons.find((item) => item.id === lessonId)
  if (!lesson) throw new Error(`Unknown lesson: ${lessonId}`)
  const extension = getLabExercises(lesson)[2]
  return {
    ...extension,
    id: `${lessonId}-focused`,
    title: extension.prompt.replace(/^Extension:\s*/i, ''),
    difficulty: 'Medium',
    mode: 'Focused',
    skills: lesson.concepts,
    explanation: [
      `The solution centers on ${lesson.concepts.join(', ')}.`,
      'It first establishes the correct row population and result grain.',
      'The final projection and ordering make the answer deterministic and directly gradeable.',
    ],
  }
}

export const challengeModules: ChallengeModule[] = curriculum.map((module) => ({
  id: module.id,
  index: module.index,
  title: module.title,
  accent: module.accent,
  topics: module.lessons.map((lesson) => {
    const pair = missionPairs[lesson.id]
    if (!pair) throw new Error(`Missing challenge mapping for ${lesson.id}`)
    return {
      id: lesson.id,
      moduleId: module.id,
      number: lesson.number,
      title: lesson.title,
      summary: lesson.summary,
      questions: [
        focusedQuestion(lesson.id),
        fromMission(lesson.id, 2, pair[0]),
        fromMission(lesson.id, 3, pair[1]),
      ],
    }
  }),
}))

export const challengeTopics = challengeModules.flatMap((module) => module.topics)
export const challengeQuestions = challengeTopics.flatMap((topic) => topic.questions)
export const challengeQuestionCount = challengeQuestions.length

export const getChallengeTopic = (id?: string) => challengeTopics.find((topic) => topic.id === id) ?? challengeTopics[0]

export const getChallengeQuestion = (topicId: string, questionId?: string) => {
  const topic = getChallengeTopic(topicId)
  return topic.questions.find((question) => question.id === questionId) ?? topic.questions[0]
}

export const isDefinitionChallenge = (question: ChallengeQuestion | CampaignChallenge) => question.validationMode === 'definition'
