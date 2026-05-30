import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Clock, Users } from 'lucide-react'
import type { Course } from '@/lib/types'
import { ROUTES } from '@/lib/constants'
import { formatDuration, getInitials } from '@/lib/utils'
import { StarRating } from '@/components/common/StarRating'
import { fetchCourse } from '@/hooks/queries/useCourse'

interface CourseCardProps {
  course: Course
  variant?: 'default' | 'compact'
}

const categoryColors: Record<string, string> = {
  programming:    'bg-blue-500/90',
  design:         'bg-purple-500/90',
  business:       'bg-emerald-500/90',
  marketing:      'bg-orange-500/90',
  'data-science': 'bg-indigo-500/90',
  other:          'bg-slate-500/90',
}

export function CourseCard({ course, variant = 'default' }: CourseCardProps) {
  const qc = useQueryClient()
  const thumbnail = course.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop`
  const isFree = course.pricing_type === 'free' || course.price === 0
  const originalPrice = (course as any).original_price
  const discount = originalPrice && originalPrice > course.price
    ? Math.round((1 - course.price / originalPrice) * 100)
    : null

  const handleMouseEnter = () => {
    const state = qc.getQueryState(['course', course.id])
    if (state?.status !== 'success') {
      qc.prefetchQuery({
        queryKey: ['course', course.id],
        queryFn:  () => fetchCourse(course.id),
        staleTime: 1000 * 60 * 5,
      })
    }
  }

  return (
    <Link
      to={ROUTES.COURSE_DETAIL(course.id)}
      onMouseEnter={handleMouseEnter}
      className="group block"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail}
            alt={course.title}
            loading="lazy"
            width={400}
            height={225}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-white ${categoryColors[course.category] || categoryColors.other}`}>
              {String(course.category).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Rating */}
          <div className="mb-2">
            <StarRating rating={course.rating} count={course.rating_count} size="sm" />
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="mt-2 flex items-center gap-2">
            {course.instructor?.avatar_url ? (
              <img
                src={course.instructor.avatar_url}
                alt={course.instructor.full_name}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                {getInitials(course.instructor?.full_name || 'I')}
              </div>
            )}
            <span className="text-sm text-muted-foreground truncate">
              {course.instructor?.full_name || 'Instructor'}
            </span>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium capitalize">
              {course.level}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(course.duration_minutes)}
            </span>
          </div>

          {/* Price + Button */}
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 mt-4">
            <div className="flex items-center gap-2">
              {isFree ? (
                <span className="text-base font-bold text-emerald-500">Free</span>
              ) : (
                <>
                  <span className="text-base font-bold">₹{course.price.toLocaleString('en-IN')}</span>
                  {originalPrice && originalPrice > course.price && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-600">{discount}% off</span>
                    </>
                  )}
                </>
              )}
            </div>
            <span className="text-sm font-medium text-primary group-hover:underline">
              View Course →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}