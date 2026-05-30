import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useQuestionBank(courseId: string | undefined) {
  return useQuery({
    queryKey: ['question-bank', courseId],
    queryFn: async () => {
      if (!courseId) return []
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useQuestionBankTopics(courseId: string | undefined) {
  return useQuery({
    queryKey: ['question-bank-topics', courseId],
    queryFn: async () => {
      if (!courseId) return []
      const { data, error } = await supabase
        .from('question_bank')
        .select('topic')
        .eq('course_id', courseId)
      if (error) throw error
      const topics = [...new Set(data.map((q: any) => q.topic))].sort()
      return topics as string[]
    },
    enabled: !!courseId,
    staleTime: 1000 * 60 * 10,
  })
}
