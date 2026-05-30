import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { AdaptivePathCard } from '@/components/live/AdaptivePathCard'
import { CourseRecommendationsStrip, CourseRecommendationsStripSkeleton } from '@/components/live/CourseRecommendationsStrip'
import type { Course } from '@/lib/types'

async function fetchRecommendations(userId: string): Promise<Course[]> {
  const { data } = await supabase
    .from('course_recommendations')
    .select('course_ids')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data || !data.course_ids || data.course_ids.length === 0) return []

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .in('id', data.course_ids)
    .limit(5)

  return courses ?? []
}

interface StudentDashboardExtensionsProps {
  userId: string
}

export function StudentDashboardExtensions({ userId }: StudentDashboardExtensionsProps) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['course-recommendations', userId],
    queryFn: () => fetchRecommendations(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 60,
  })

  return (
    <div className="space-y-6">
      <AdaptivePathCard userId={userId} />
      {isLoading ? (
        <CourseRecommendationsStripSkeleton />
      ) : (
        <CourseRecommendationsStrip recommendations={recommendations ?? []} />
      )}
    </div>
  )
}
