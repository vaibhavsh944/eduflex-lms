import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, CourseFilters, PaginatedResult } from '@/lib/types'

export const PAGE_SIZE = 12

async function fetchCourses(filters: CourseFilters): Promise<PaginatedResult<Course>> {
  let query = supabase
    .from('courses')
    .select(`
      id, title, slug, thumbnail_url, description,
      category, level, price_type, price,
      tags, language, status, created_at, updated_at,
      certificate_enabled, enrollment_limit,
      instructor:profiles!instructor_id(id, full_name, avatar_url)
    `, { count: 'exact' })
    .eq('status', 'published')

  // Search query
  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`
    )
  }

  // Category filter (multi-select = OR)
  if (filters.category.length > 0) {
    query = query.in('category', filters.category)
  }

  // Level filter (multi-select = OR)
  if (filters.level.length > 0) {
    query = query.in('level', filters.level)
  }

  // Pricing filter
  switch (filters.pricing) {
    case 'free':       query = query.eq('price_type', 'free'); break
    case 'paid':       query = query.eq('price_type', 'paid'); break
    case 'under500':   query = query.lt('price', 500); break
    case '500to2000':  query = query.gte('price', 500).lte('price', 2000); break
    case 'above2000':  query = query.gt('price', 2000); break
  }

  // Language filter
  if (filters.language.length > 0) {
    query = query.in('language', filters.language)
  }

  // Sort
  switch (filters.sort) {
    case 'newest':     query = query.order('created_at', { ascending: false }); break
    case 'price_asc':  query = query.order('price', { ascending: true });  break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    default:           query = query.order('created_at', { ascending: false }); break
  }

  // Pagination
  const from = (filters.page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  const courses = (data ?? []).map((row: any) => ({
    ...row,
    pricing_type: row.price_type,
    short_description: row.description?.slice(0, 200) ?? '',
    what_you_learn: [],
    requirements: [],
    duration_minutes: 0,
    lesson_count: 0,
    enrollment_count: 0,
    rating: 0,
    rating_count: 0,
    instructor: row.instructor as Course['instructor'],
  })) as Course[]

  const totalCount  = count ?? 0
  const pageCount   = Math.ceil(totalCount / PAGE_SIZE)

  return { data: courses, count: totalCount, page: filters.page, pageSize: PAGE_SIZE, pageCount }
}

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: ['courses', 'catalog', filters],
    queryFn:  () => fetchCourses(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev: any) => prev,
  })
}