import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export function useAssignment(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['assignment', lessonId],
    queryFn: async () => {
      if (!lessonId) return null
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('lesson_id', lessonId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!lessonId,
  })
}

export function useSubmissionHistory(assignmentId: string | undefined) {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['submissions', assignmentId, user?.id],
    queryFn: async () => {
      if (!assignmentId) return []
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user!.id)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user && !!assignmentId,
  })
}

export function useSubmitAssignment() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      assignmentId,
      courseId,
      textContent,
      file,
    }: {
      assignmentId: string
      courseId: string
      textContent?: string
      file?: File
    }) => {
      if (!user) throw new Error('Not authenticated')

      let fileUrl: string | null = null
      let fileName: string | null = null
      let fileSizeBytes: number | null = null

      if (file) {
        const path = `${user.id}/${assignmentId}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(path, file, { upsert: false })
        if (uploadError) throw uploadError

        // Get a signed URL valid for 7 days (for student to download their own file)
        const { data: signedUrl } = await supabase.storage
          .from('submissions')
          .createSignedUrl(path, 60 * 60 * 24 * 7)

        fileUrl = signedUrl?.signedUrl ?? null
        fileName = file.name
        fileSizeBytes = file.size
      }

      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id: assignmentId,
          user_id: user.id,
          course_id: courseId,
          text_content: textContent ?? null,
          file_url: fileUrl,
          file_name: fileName,
          file_size_bytes: fileSizeBytes,
        })
        .select('*')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      toast.success('Assignment submitted successfully!')
      qc.invalidateQueries({ queryKey: ['submissions', variables.assignmentId] })
      qc.invalidateQueries({ queryKey: ['course-player'] })
    },
    onError: () => {
      toast.error('Failed to submit assignment. Please try again.')
    }
  })
}
