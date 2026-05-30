import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

async function fetchDashboard(userId: string) {
  const [enrollmentsRes, progressRes, streakRes, quizAttemptsRes] = await Promise.all([
    supabase
      .from('enrollments')
      .select('*, course:courses(id, title, thumbnail_url, lesson_count)')
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false }),
    supabase
      .from('lesson_progress')
      .select('lesson_id, course_id, completed, completed_at')
      .eq('user_id', userId),
    supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('quiz_attempts')
      .select('score, max_score')
      .eq('user_id', userId),
  ])

  if (enrollmentsRes.error) throw enrollmentsRes.error
  if (progressRes.error) throw progressRes.error
  if (streakRes.error) throw streakRes.error
  if (quizAttemptsRes.error) throw quizAttemptsRes.error

  const enrollments = enrollmentsRes.data ?? []
  const lessonProgress = progressRes.data ?? []
  const completedCount = lessonProgress.filter((lp: any) => lp.completed).length
  const quizAttempts = quizAttemptsRes.data ?? []
  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum: number, a: any) => sum + (a.score ?? 0), 0) / quizAttempts.length)
    : 0

  const enrolledCourseIds = enrollments.map((e: any) => e.course_id)

  let deadlines: any[] = []
  if (enrolledCourseIds.length > 0) {
    const { data, error } = await supabase
      .from('assignments')
      .select('id, title, due_at, lesson_id, course_id, course:courses(title)')
      .in('course_id', enrolledCourseIds)
      .gt('due_at', new Date().toISOString())
      .order('due_at', { ascending: true })
      .limit(5)
    if (error) throw error
    deadlines = data ?? []
  }

  const progressByCourse = new Map<string, number>()
  lessonProgress.forEach((lp: any) => {
    if (lp.completed) progressByCourse.set(lp.course_id, (progressByCourse.get(lp.course_id) ?? 0) + 1)
  })

  const inProgress = enrollments
    .map((e: any) => ({ ...e, completedLessons: progressByCourse.get(e.course_id) ?? 0 }))
    .sort((a: any, b: any) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
    .find((e: any) => (e.course?.lesson_count ?? 0) > 0 && e.completedLessons < (e.course?.lesson_count ?? 0)) ?? null

  return {
    stats: {
      coursesEnrolled: enrollments.length,
      lessonsCompleted: completedCount,
      avgQuizScore,
      currentStreak: streakRes.data?.current_streak ?? 0,
    },
    continueLearning: inProgress,
    enrollments,
    streak: streakRes.data,
    upcomingDeadlines: deadlines.map((d: any) => ({
      assignment_id: d.id,
      assignment_title: d.title,
      course_title: d.course?.title ?? 'Unknown Course',
      course_id: d.course_id,
      lesson_id: d.lesson_id,
      due_at: d.due_at,
    })),
  }
}

export function useStudentDashboard() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => fetchDashboard(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60,
  })
}
