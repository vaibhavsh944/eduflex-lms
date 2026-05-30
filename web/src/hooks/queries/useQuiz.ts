import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useQuiz(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['quiz', lessonId],
    queryFn: async () => {
      if (!lessonId) return []
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*, quiz_options(id, option_text, is_correct, order_index)')
        .eq('lesson_id', lessonId)
        .order('order_index')
      if (error) throw error
      // Sort options within each question
      return (data ?? []).map((q) => ({
        ...q,
        quiz_options: [...q.quiz_options].sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        )
      }))
    },
    enabled: !!lessonId,
    staleTime: 1000 * 60 * 10,  // Questions don't change often
  })
}
