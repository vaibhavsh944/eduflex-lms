import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCompetencyCheck(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['competency-check', lessonId],
    queryFn: async () => {
      if (!lessonId) return { locked: false }
      const { data, error } = await supabase.functions.invoke('competency-check', {
        body: { lesson_id: lessonId }
      })
      if (error) throw error
      return data
    },
    enabled: !!lessonId,
    staleTime: 1000 * 60 * 2,
    retry: false,
  })
}

export function useCompetencyRequirements(courseId: string | undefined) {
  return useQuery({
    queryKey: ['competency-requirements', courseId],
    queryFn: async () => {
      if (!courseId) return []
      const { data, error } = await supabase
        .from('competency_requirements')
        .select('*, required_quiz:required_quiz_id(id, title), lesson!inner(course_id)')
        .eq('lesson.course_id', courseId)
      if (error) throw error
      return data ?? []
    },
    enabled: !!courseId,
  })
}
