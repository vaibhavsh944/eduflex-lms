import { CourseCard } from '@/components/courses/CourseCard'
import { CourseCardSkeleton } from '@/components/courses/CourseCardSkeleton'
import type { Course } from '@/lib/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

interface CourseRecommendationsStripProps {
  recommendations: Course[]
}

export function CourseRecommendationsStrip({ recommendations }: CourseRecommendationsStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [recommendations])

  if (!recommendations || recommendations.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.6
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Recommended for You</h2>
      </div>
      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 shadow-md border border-border backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 shadow-md border border-border backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {recommendations.slice(0, 5).map((course) => (
            <div
              key={course.id}
              className="min-w-[260px] max-w-[260px] flex-shrink-0"
              style={{ scrollSnapAlign: 'start' }}
            >
              <CourseCard course={course} variant="compact" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CourseRecommendationsStripSkeleton() {
  return (
    <div>
      <div className="h-6 w-48 bg-muted animate-pulse rounded mb-3" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="min-w-[260px]">
            <CourseCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}
