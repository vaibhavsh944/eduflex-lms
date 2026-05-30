import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Review } from '@/lib/types'

const REVIEWS_PAGE_SIZE = 8

async function fetchReviews(courseId: string, page: number): Promise<Review[]> {
  const from = page * REVIEWS_PAGE_SIZE
  const to   = from + REVIEWS_PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id, rating, title, body, helpful_count, created_at,
      user:profiles!user_id(id, full_name, avatar_url)
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return (data ?? []).map((r: any) => ({ ...r, user: r.user })) as Review[]
}

export function useCourseReviews(courseId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['reviews', courseId],
    queryFn:  async ({ pageParam }) => {
      try {
        return await fetchReviews(courseId!, pageParam)
      } catch {
        return []
      }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === REVIEWS_PAGE_SIZE ? allPages.length : undefined,
    enabled: !!courseId,
    initialPageParam: 0,
    retry: false,
  })
}

import { useQuery } from '@tanstack/react-query'

export function useCourseRatingBreakdown(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course-rating-breakdown', courseId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('course_id', courseId!)

        if (error) throw error

        const ratings = [5, 4, 3, 2, 1].map(star => ({
          star,
          count: data?.filter((r: any) => r.rating === star).length || 0,
          percentage: data?.length ? ((data?.filter((r: any) => r.rating === star).length || 0) / data.length) * 100 : 0,
        }))

        return ratings
      } catch {
        return []
      }
    },
    enabled: !!courseId,
    retry: false,
  })
}