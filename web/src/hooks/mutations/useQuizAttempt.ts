import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useQuizStore } from '@/store/quizStore'

export function useStartQuizAttempt() {
  const user = useAuthStore((s) => s.user)
  const startAttempt = useQuizStore((s) => s.startAttempt)

  return useMutation({
    mutationFn: async ({ lessonId, courseId }: { lessonId: string; courseId: string }) => {
      if (!user) throw new Error('Not authenticated')

      // Check for existing in_progress attempt first (refresh recovery)
      const { data: existing } = await supabase
        .from('quiz_attempts')
        .select('id, started_at')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('status', 'in_progress')
        .maybeSingle()

      if (existing) {
        return { id: existing.id, started_at: existing.started_at }
      }

      // Insert new attempt
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({ user_id: user.id, lesson_id: lessonId, course_id: courseId })
        .select('id, started_at')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      startAttempt(data.id, data.started_at)
    }
  })
}

export function useSubmitQuiz() {
  const qc = useQueryClient()
  const { setResults } = useQuizStore()

  return useMutation({
    mutationFn: async ({
      attemptId,
      answers,
      courseId
    }: {
      attemptId: string
      answers: Record<string, string>
      courseId: string
    }) => {
      const { data, error } = await supabase.functions.invoke('grade-quiz', {
        body: { attempt_id: attemptId, answers }
      })
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      setResults(data.score, data.passed, data.results)
      qc.invalidateQueries({ queryKey: ['course-player'] })
      qc.invalidateQueries({ queryKey: ['quiz-attempts', variables.courseId] })
    }
  })
}
