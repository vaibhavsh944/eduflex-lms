import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { mockCourses, mockModules } from '@/lib/mockData'
import type { CourseWithContent, ModuleWithLessons } from '@/lib/types'
import { normalizeVideoUrl } from '@/lib/utils'

async function fetchCourse(courseId: string): Promise<CourseWithContent> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name, avatar_url, bio, created_at),
      modules(
        id, title, description, position,
        lessons(
          id, title, content_type, video_url, duration_mins, position, is_free_preview
        )
      )
    `)
    .eq('id', courseId)
    .eq('status', 'published')
    .single()

  if (error) throw error
  if (!data)  throw new Error('Course not found')

  // Map DB column names to frontend names
  const modules = (data.modules ?? [])
    .sort((a: any, b: any) => a.position - b.position)
    .map((m: any) => ({
      ...m,
      order_index: m.position,
      lessons: (m.lessons ?? [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((l: any) => ({
          ...l,
          order_index: l.position,
          type: l.content_type,
          content_url: normalizeVideoUrl(l.video_url),
          youtube_url: normalizeVideoUrl(l.youtube_url),
          video_url: normalizeVideoUrl(l.video_url),
          duration_minutes: l.duration_mins,
        })),
    }))

  return {
    ...data,
    instructor: data.instructor as CourseWithContent['instructor'],
    modules,
  } as CourseWithContent
}

function fetchMockCourse(courseId: string): CourseWithContent | null {
  const course = mockCourses.find(c => c.id === courseId)
  if (!course) return null

  const modules: ModuleWithLessons[] = (mockModules[courseId] || []).map(m => ({
    ...m,
    lessons: m.lessons || [],
    description: null,
  }))

  return {
    ...course,
    modules,
    instructor: course.instructor as CourseWithContent['instructor'],
  } as CourseWithContent
}

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn:  async () => {
      const mock = fetchMockCourse(courseId!)
      if (mock) return mock
      try {
        return await fetchCourse(courseId!)
      } catch {
        throw new Error('Course not found')
      }
    },
    enabled:  !!courseId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

// Export for prefetching
export { fetchCourse, fetchMockCourse }