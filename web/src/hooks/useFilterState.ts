import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type {
  CourseFilters,
  CourseCategory, CourseLevel, DurationFilter, CourseSortOption, PricingFilter
} from '@/lib/types';
import { DEFAULT_FILTERS
} from '@/lib/types'

function parseCommaList<T extends string>(value: string | null): T[] {
  if (!value) return []
  return value.split(',').filter(Boolean) as T[]
}

export function useFilterState() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive filter state from URL params (no local state — URL is the state)
  const filters: CourseFilters = useMemo(() => ({
    q:        searchParams.get('q')        ?? '',
    category: parseCommaList<CourseCategory>(searchParams.get('category')),
    level:    parseCommaList<CourseLevel>(searchParams.get('level')),
    pricing:  (searchParams.get('pricing') ?? 'all') as PricingFilter,
    rating:   searchParams.get('rating')   ? Number(searchParams.get('rating')) : null,
    duration: parseCommaList<DurationFilter>(searchParams.get('duration')),
    language: parseCommaList(searchParams.get('language')),
    sort:     (searchParams.get('sort')    ?? 'popular') as CourseSortOption,
    page:     Number(searchParams.get('page') ?? '1'),
  }), [searchParams])

  // Update one or more filter keys + reset page to 1 (unless page is the only thing changing)
  const setFilters = useCallback((
    updates: Partial<CourseFilters>,
    options?: { keepPage?: boolean }
  ) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)

      const apply = options?.keepPage ? updates : { ...updates, page: 1 }

      Object.entries(apply).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' ||
            value === DEFAULT_FILTERS[key as keyof CourseFilters] ||
            (Array.isArray(value) && value.length === 0)) {
          next.delete(key)
        } else if (Array.isArray(value)) {
          next.set(key, value.join(','))
        } else {
          next.set(key, String(value))
        }
      })

      return next
    }, { replace: true })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.q)                 count++
    if (filters.category.length)   count += filters.category.length
    if (filters.level.length)      count += filters.level.length
    if (filters.pricing !== 'all') count++
    if (filters.rating !== null)   count++
    if (filters.duration.length)   count += filters.duration.length
    if (filters.language.length)   count += filters.language.length
    return count
  }, [filters])

  return { filters, setFilters, clearFilters, activeFilterCount }
}