import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/store/quizStore'

export function useStartAdvancedAttempt() {
  const startAttempt = useQuizStore((s) => s.startAttempt)

  return useMutation({
    mutationFn: async ({ quizId }: { quizId: string }) => {
      const { data, error } = await supabase.functions.invoke('start-attempt', {
        body: { quiz_id: quizId }
      })
      if (error) throw error
      if (data.error === 'ATTEMPTS_EXHAUSTED') throw new Error('ATTEMPTS_EXHAUSTED')
      if (data.error === 'DEADLINE_PASSED') throw new Error('DEADLINE_PASSED')
      return data
    },
    onSuccess: (data) => {
      startAttempt(data.id, data.started_at)
    }
  })
}

export function useSubmitAdvancedQuiz() {
  const queryClient = useQueryClient()
  const { setResults } = useQuizStore()

  return useMutation({
    mutationFn: async ({
      attemptId, answers, courseId, autoSubmitted
    }: {
      attemptId: string
      answers: Record<string, string>
      courseId: string
      autoSubmitted?: boolean
    }) => {
      const { data, error } = await supabase.functions.invoke('submit-quiz', {
        body: { attempt_id: attemptId, answers, auto_submitted: !!autoSubmitted }
      })
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      setResults(data.score, data.passed, data.results)
      queryClient.invalidateQueries({ queryKey: ['course-player'] })
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', variables.courseId] })
      queryClient.invalidateQueries({ queryKey: ['competency-check'] })
    }
  })
}

export function useLogProctoringFlag() {
  return useMutation({
    mutationFn: async ({
      attemptId, eventType
    }: {
      attemptId: string
      eventType: 'tab_switch' | 'focus_lost'
    }) => {
      const { data, error } = await supabase.functions.invoke('proctoring-flag', {
        body: { attempt_id: attemptId, event_type: eventType }
      })
      if (error) throw error
      return data
    }
  })
}
