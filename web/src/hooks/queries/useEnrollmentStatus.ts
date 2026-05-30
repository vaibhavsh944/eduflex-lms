import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Course, Enrollment } from '@/lib/types'

async function fetchEnrollmentStatus(
  courseId: string, userId: string
): Promise<Enrollment | null> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, course_id, enrolled_at')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('completed')
    .eq('course_id', courseId)
    .eq('user_id', userId)

  const completed = progressRows?.filter(p => p.completed).length ?? 0
  const total = totalLessons ?? 0
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone = total > 0 && completed >= total

  return {
    id: data.id,
    user_id: userId,
    course_id: data.course_id,
    course: {} as Course,
    status: allDone ? 'completed' : 'active',
    progress: pct,
    enrolled_at: data.enrolled_at,
    completed_at: allDone ? new Date().toISOString() : null,
  }
}

export function useEnrollmentStatus(courseId: string | undefined) {
  const user = useAuthStore(s => s.user)

  return useQuery({
    queryKey: ['enrollment', courseId, user?.id],
    queryFn:  async () => {
      try {
        return await fetchEnrollmentStatus(courseId!, user!.id)
      } catch {
        return null
      }
    },
    enabled:  !!courseId && !!user,
    staleTime: 0,
  })
}

export function useEnrollFree(courseId: string) {
  const qc       = useQueryClient()
  const navigate = useNavigate()
  const user     = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('enrollments')
        .insert({ user_id: user.id, course_id: courseId })
        .select('id')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Enrolled successfully! Let\'s start learning.')
      if (user) {
        qc.invalidateQueries({ queryKey: ['enrollment', courseId, user.id] })
        qc.invalidateQueries({ queryKey: ['enrolled-courses', user.id] })
      }
      navigate(`/catalog/${courseId}`)
    },
    onError: (err: any) => {
      if (err.code === '23505') {
        toast.info('You\'re already enrolled in this course.')
        navigate(`/catalog/${courseId}`)
      } else {
        toast.error('Enrollment failed. Please try again.')
      }
    },
  })
}