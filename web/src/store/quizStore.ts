import { create } from 'zustand'
import type { StudentAnswers } from '@/lib/types'

interface QuizState {
  // Current attempt
  attemptId: string | null
  startedAt: string | null        // ISO string, from DB — used to compute remaining time
  timeLimitSeconds: number | null
  answers: StudentAnswers
  currentQuestionIndex: number
  // Results (after submission)
  submitted: boolean
  score: number | null
  passed: boolean | null
  gradeResults: Record<string, { correct: boolean; correct_option_id: string; explanation: string }>
  // Actions
  startAttempt: (attemptId: string, startedAt: string, timeLimitSeconds?: number) => void
  setAnswer: (questionId: string, value: string) => void
  goToQuestion: (index: number) => void
  setResults: (score: number, passed: boolean, gradeResults: QuizState['gradeResults']) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  attemptId: null,
  startedAt: null,
  timeLimitSeconds: null,
  answers: {},
  currentQuestionIndex: 0,
  submitted: false,
  score: null,
  passed: null,
  gradeResults: {},
  startAttempt: (attemptId, startedAt, timeLimitSeconds) =>
    set({ attemptId, startedAt, timeLimitSeconds: timeLimitSeconds ?? null, answers: {}, currentQuestionIndex: 0, submitted: false, score: null, passed: null }),
  setAnswer: (questionId, value) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: value } })),
  goToQuestion: (index) => set({ currentQuestionIndex: index }),
  setResults: (score, passed, gradeResults) =>
    set({ submitted: true, score, passed, gradeResults }),
  reset: () =>
    set({ attemptId: null, startedAt: null, timeLimitSeconds: null, answers: {}, currentQuestionIndex: 0, submitted: false, score: null, passed: null, gradeResults: {} }),
}))
