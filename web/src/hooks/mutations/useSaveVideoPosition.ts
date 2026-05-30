import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useRef, useCallback, useEffect } from 'react'

export function useSaveVideoPosition(lessonId: string | undefined, courseId: string | undefined) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestSecondsRef = useRef<number>(0)

  const { mutate } = useMutation({
    mutationFn: async (seconds: number) => {
      if (!user || !lessonId || !courseId) return
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          last_position: Math.floor(seconds),
          last_watched_seconds: Math.floor(seconds)
        }, { onConflict: 'user_id,lesson_id' })
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ['lesson-progress', user.id, lessonId] })
      }
    }
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (latestSecondsRef.current > 0) {
        mutate(latestSecondsRef.current)
      }
    }
  }, [])

  const savePosition = useCallback((seconds: number) => {
    latestSecondsRef.current = seconds
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      mutate(seconds)
    }, 3000)
  }, [mutate])

  return { savePosition }
}
