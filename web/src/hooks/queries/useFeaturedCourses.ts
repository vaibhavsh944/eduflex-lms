import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { mockCourses } from '@/lib/mockData'
import type { Course } from '@/lib/types'

async function fetchFeaturedCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, slug, thumbnail_url, short_description, description,
      category, level, pricing_type, price, original_price,
      rating, rating_count, enrollment_count, duration_minutes, lesson_count,
      instructor:profiles!instructor_id(id, full_name, avatar_url)
    `)
    .eq('status', 'published')
    .order('enrollment_count', { ascending: false })
    .limit(6)

  if (error) throw error
  return (data ?? []).map((row: any) => ({
    ...row,
    instructor: row.instructor as Course['instructor'],
  })) as Course[]
}

export function useFeaturedCourses() {
  return useQuery({
    queryKey: ['courses', 'featured'],
    queryFn:  async () => {
      try {
        return await fetchFeaturedCourses()
      } catch {
        return mockCourses
          .filter(c => c.status === 'published')
          .sort((a, b) => b.enrollment_count - a.enrollment_count)
          .slice(0, 6)
      }
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useCourseCount() {
  return useQuery({
    queryKey: ['course-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
        if (error) throw error
        return count || 0
      } catch {
        return mockCourses.filter(c => c.status === 'published').length
      }
    },
  })
}