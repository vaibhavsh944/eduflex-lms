import { Star, Users, PlayCircle } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

interface InstructorBioProps {
  instructor: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'bio' | 'department_id'>
}

async function fetchInstructorStats(instructorId: string) {
  const [coursesRes, enrollmentsRes, reviewsRes] = await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('instructor_id', instructorId),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).in('course_id',
      supabase.from('courses').select('id').eq('instructor_id', instructorId) as any
    ),
    supabase.from('reviews').select('rating').in('course_id',
      supabase.from('courses').select('id').eq('instructor_id', instructorId) as any
    ),
  ])
  const courseCount = coursesRes.count ?? 0
  const studentCount = enrollmentsRes.count ?? 0
  const reviews = reviewsRes.data ?? []
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return { courseCount, studentCount, avgRating, reviewCount: reviews.length }
}

export function InstructorBio({ instructor }: InstructorBioProps) {
  const { data: stats } = useQuery({
    queryKey: ['instructor-stats', instructor.id],
    queryFn: () => fetchInstructorStats(instructor.id),
    enabled: !!instructor.id,
  })
  const displayStats = stats ?? { courseCount: 0, studentCount: 0, avgRating: 0, reviewCount: 0 }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center md:items-start gap-4 shrink-0">
        {instructor.avatar_url ? (
          <img 
            src={instructor.avatar_url} 
            alt={instructor.full_name}
            className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary border-2 border-primary/20">
            {getInitials(instructor.full_name || 'Instructor')}
          </div>
        )}
      </div>

      <div className="flex-1 text-center md:text-left space-y-3">
        <div>
          <h3 className="text-xl font-bold">{instructor.full_name}</h3>
          <p className="text-sm font-medium text-primary mt-1">
            {instructor.department_id || 'Expert Instructor'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-foreground">{displayStats.avgRating.toFixed(1)}</span> Instructor Rating
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span className="text-foreground">{displayStats.studentCount.toLocaleString()}</span> Students
          </div>
          <div className="flex items-center gap-1.5">
            <PlayCircle className="h-4 w-4" />
            <span className="text-foreground">{displayStats.courseCount}</span> Courses
          </div>
        </div>

        {instructor.bio ? (
          <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
            {instructor.bio}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            This instructor hasn't added a bio yet.
          </p>
        )}
      </div>
    </div>
  )
}