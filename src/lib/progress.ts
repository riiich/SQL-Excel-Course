import type { ProgressState } from '../types'

const STORAGE_KEY = 'querycraft.progress.v1'

export const emptyProgress: ProgressState = {
  version: 1,
  completed: [],
  completedExercises: [],
  labOutcomes: {},
  campaignCompleted: [],
  campaignOutcomes: {},
  campaignRevealed: [],
  challengeCompleted: [],
  challengeOutcomes: {},
  challengeRevealed: [],
  excelCompleted: [],
  excelCompletedExercises: [],
  excelOutcomes: {},
  attempts: {},
  hints: {},
  drafts: {},
  lastLesson: null,
  lastCampaignChapter: null,
  lastChallengeTopic: null,
  lastExcelLesson: null,
}

export function loadProgress(): ProgressState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return emptyProgress
    const parsed = JSON.parse(saved) as Partial<ProgressState>
    if (parsed.version !== 1) return emptyProgress
    return {
      ...emptyProgress,
      ...parsed,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      completedExercises: Array.isArray(parsed.completedExercises) ? parsed.completedExercises : [],
      labOutcomes: parsed.labOutcomes ?? {},
      campaignCompleted: Array.isArray(parsed.campaignCompleted) ? parsed.campaignCompleted : [],
      campaignOutcomes: parsed.campaignOutcomes ?? {},
      campaignRevealed: Array.isArray(parsed.campaignRevealed) ? parsed.campaignRevealed : [],
      challengeCompleted: Array.isArray(parsed.challengeCompleted) ? parsed.challengeCompleted : [],
      challengeOutcomes: parsed.challengeOutcomes ?? {},
      challengeRevealed: Array.isArray(parsed.challengeRevealed) ? parsed.challengeRevealed : [],
      excelCompleted: Array.isArray(parsed.excelCompleted) ? parsed.excelCompleted : [],
      excelCompletedExercises: Array.isArray(parsed.excelCompletedExercises) ? parsed.excelCompletedExercises : [],
      excelOutcomes: parsed.excelOutcomes ?? {},
      attempts: parsed.attempts ?? {},
      hints: parsed.hints ?? {},
      drafts: parsed.drafts ?? {},
    }
  } catch {
    return emptyProgress
  }
}

export function saveProgress(progress: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function clearProgress() {
  localStorage.removeItem(STORAGE_KEY)
}
