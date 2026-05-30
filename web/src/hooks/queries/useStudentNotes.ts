import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export function useStudentNotes(lessonId: string | undefined) {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['student-notes', lessonId, user?.id],
    queryFn: async () => {
      if (!lessonId || !user) return null
      const { data, error } = await supabase
        .from('student_notes')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user && !!lessonId,
  })
}

export function useSaveNote() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ lessonId, courseId, content }: { lessonId: string; courseId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('student_notes')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          content,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['student-notes', variables.lessonId] })
    },
    onError: () => {
      toast.error('Failed to save notes')
    }
  })
}
