import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { CoursePlayerData, PlayerModule, LessonProgress } from '@/lib/types'
import { normalizeVideoUrl } from '@/lib/utils'

async function safeQuery<T>(fn: () => Promise<{ data: T | null; error: any }>, fallback: T): Promise<T> {
  try {
    const result = await fn()
    if (result.error) return fallback
    return result.data ?? fallback
  } catch {
    return fallback
  }
}

async function fetchCoursePlayerData(courseId: string, userId: string): Promise<CoursePlayerData | null> {
  const [course, modules, lessons, progressRecords, enrollment] = await Promise.all([
    safeQuery(
      () => supabase.from('courses').select('id, title, thumbnail_url').eq('id', courseId).single(),
      null
    ),
    safeQuery(
      () => supabase.from('modules').select('id, title, position').eq('course_id', courseId).order('position'),
      [] as any[]
    ),
    safeQuery(
      () => supabase.from('lessons').select('*').eq('course_id', courseId).order('position'),
      [] as any[]
    ),
    safeQuery(
      () => supabase.from('lesson_progress').select('*').eq('user_id', userId).eq('course_id', courseId),
      [] as any[]
    ),
    safeQuery(
      () => supabase.from('enrollments').select('id').eq('user_id', userId).eq('course_id', courseId).maybeSingle(),
      null
    ),
  ])

  if (!course) return null

  const progressMap = new Map<string, LessonProgress>(
    progressRecords.map((p: any) => [p.lesson_id, p])
  )

  const grouped = new Map<string, any[]>()
  for (const lesson of lessons) {
    const list = grouped.get(lesson.module_id)
    if (list) list.push(lesson)
    else grouped.set(lesson.module_id, [lesson])
  }

  let totalLessons = 0
  let completedLessons = 0

  const playerModules: PlayerModule[] = modules.map((mod: any) => ({
    id: mod.id,
    title: mod.title,
    order_index: mod.position,
    lessons: (grouped.get(mod.id) ?? [])
      .map((lesson: any) => {
        totalLessons++
        const progress = progressMap.get(lesson.id) ?? null
        if (progress?.completed) completedLessons++
        return {
          id: lesson.id,
          module_id: lesson.module_id,
          title: lesson.title,
          type: lesson.content_type,
          content_type: lesson.content_type,
          duration_minutes: lesson.duration_mins,
          content_url: normalizeVideoUrl(lesson.video_url),
          youtube_url: normalizeVideoUrl(lesson.youtube_url),
          video_url: normalizeVideoUrl(lesson.video_url),
          content_text: lesson.content_text ?? lesson.content,
          is_free_preview: lesson.is_free_preview,
          order_index: lesson.position,
          position: lesson.position,
          progress,
        }
      })
  }))

  return {
    course: { id: course.id, title: course.title, thumbnail_url: course.thumbnail_url },
    modules: playerModules,
    totalLessons,
    completedLessons,
    progressPct: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    lastLessonId: progressRecords.length > 0
      ? progressRecords.sort((a: any, b: any) =>
          new Date(b.updated_at ?? b.completed_at ?? b.created_at).getTime() -
          new Date(a.updated_at ?? a.completed_at ?? a.created_at).getTime()
        )[0].lesson_id
      : null,
    isEnrolled: !!enrollment
  }
}

export function useCoursePlayer(courseId: string | undefined) {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['course-player', courseId, user?.id],
    queryFn: () => fetchCoursePlayerData(courseId!, user!.id),
    enabled: !!user && !!courseId,
    staleTime: 1000 * 60 * 2,
    retry: 0,
  })
}
