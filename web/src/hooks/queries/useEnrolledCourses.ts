import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export type CourseFilter = 'in_progress' | 'completed' | 'archived'

export function useEnrolledCourses(filter: CourseFilter = 'in_progress') {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['enrolled-courses', user?.id, filter],
    queryFn: async () => {
      let query = supabase
        .from('enrollments')
        .select(`
          id, enrolled_at, progress_pct, last_lesson_id, completed_at,
          course:courses (
            id, title, slug, thumbnail_url, category, level,
            duration_minutes, lesson_count,
            instructor:profiles!courses_instructor_id_fkey (id, full_name, avatar_url)
          )
        `)
        .eq('user_id', user!.id)

      if (filter === 'in_progress') query = query.is('completed_at', null)
      if (filter === 'completed') query = query.not('completed_at', 'is', null)
      if (filter === 'archived') query = query.eq('status', 'archived')

      const { data, error } = await query.order('enrolled_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((e: any) => ({ ...e, enrollment_id: e.id }))
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  })
}
