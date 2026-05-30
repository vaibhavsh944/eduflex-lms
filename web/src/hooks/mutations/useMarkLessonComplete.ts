import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

interface MarkCompletePayload {
  lessonId: string
  courseId: string
}

export function useMarkLessonComplete() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ lessonId, courseId }: MarkCompletePayload) => {
      if (!user) throw new Error('Not authenticated')

      // 1a. Fetch lesson duration for time tracking
      const { data: lesson } = await supabase
        .from('lessons')
        .select('duration_mins')
        .eq('id', lessonId)
        .single()

      const timeSpentSecs = (lesson?.duration_mins ?? 10) * 60

      // 1b. Upsert lesson progress (critical — everything depends on this)
      const { error: progressError } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_secs: timeSpentSecs
        }, { onConflict: 'user_id,lesson_id' })

      if (progressError) throw progressError

      // 2. Fetch data needed for enrollment + streak in parallel
      const [totalRes, completedRes, streakRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', courseId),
        supabase
          .from('lesson_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .eq('completed', true),
        supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])

      const total = totalRes.count ?? 0
      const completed = completedRes.count ?? 0
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0
      const courseCompleted = pct === 100

      // 3. Update enrollment (critical for progress display)
      const { error: enrollError } = await supabase
        .from('enrollments')
        .update({
          last_lesson_id: lessonId,
          progress: pct,
          completed_at: courseCompleted ? new Date().toISOString() : null
        })
        .eq('user_id', user.id)
        .eq('course_id', courseId)

      if (enrollError) throw enrollError

      // 4. Fire-and-forget: points, streak, badges (non-critical)
      Promise.all([
        awardPoints(user.id, lessonId),
        updateStreak(user.id, streakRes.data),
        supabase.functions.invoke('gamification-check-badges', {
          body: { user_id: user.id, context: { type: 'lesson_count', value: completed } }
        })
      ]).catch((err) => {
        console.warn('Non-critical gamification update failed:', err)
      })

      return { pct, courseCompleted }
    },
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries immediately
      qc.invalidateQueries({ queryKey: ['course-player', variables.courseId] })
      qc.invalidateQueries({ queryKey: ['enrolled-courses'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['points'] })
      qc.invalidateQueries({ queryKey: ['streak'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
      qc.invalidateQueries({ queryKey: ['progressAnalytics'] })

      if (data.courseCompleted) {
        setTimeout(() => {
          toast.success('🎉 Course completed! Check your certificates.', { duration: 6000 })
        }, 500)
      }
    },
    onError: (error) => {
      console.error('Failed to save progress:', error)
      toast.error('Failed to save progress. Please try again.')
    }
  })
}

async function awardPoints(userId: string, lessonId: string) {
  // Only award if not already awarded for this lesson
  const { data: existing } = await supabase
    .from('user_points_log')
    .select('id')
    .eq('user_id', userId)
    .eq('reference_id', lessonId)
    .eq('reason', 'lesson_complete')
    .maybeSingle()

  if (!existing) {
    const { error } = await supabase.from('user_points_log').insert({
      user_id: userId,
      points: 10,
      reason: 'lesson_complete',
      reference_id: lessonId,
    })
    if (error) throw error
  }
}

async function updateStreak(userId: string, existing: any) {
  const today = new Date().toISOString().split('T')[0]

  if (existing) {
    if (existing.last_checkin_date === today) return
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const newStreak = existing.last_checkin_date === yesterdayStr ? existing.current_streak + 1 : 1
    const { error } = await supabase.from('user_streaks').update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, existing.longest_streak),
      last_checkin_date: today,
    }).eq('user_id', userId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('user_streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_checkin_date: today,
    })
    if (error) throw error
  }
}
