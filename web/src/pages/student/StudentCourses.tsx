import React, { useState } from 'react'
import type { CourseFilter } from '@/hooks/queries/useEnrolledCourses';
import { useEnrolledCourses } from '@/hooks/queries/useEnrolledCourses'
import { EnrolledCourseCard } from '@/components/courses/EnrolledCourseCard'
import { EnrolledCourseCardSkeleton } from '@/components/courses/EnrolledCourseCardSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { SEO } from '@/components/shared/SEO'
import { ROUTES } from '@/lib/constants'
import { BookOpen } from 'lucide-react'

export default function StudentCourses() {
  const [filter, setFilter] = useState<CourseFilter>('in_progress')
  const { data: courses, isLoading, error, refetch } = useEnrolledCourses(filter)

  return (
    <>
      <SEO title="My Courses | EduFlow" />
      <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2 tracking-tight">My Courses</h1>
            <p className="text-muted-foreground">Continue learning and track your progress.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-muted/50 p-1 rounded-lg backdrop-blur-sm border border-border/50">
              {(['in_progress', 'completed', 'archived'] as CourseFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${
                    filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  {f === 'in_progress' ? 'In Progress' : f === 'completed' ? 'Completed' : 'Archived'}
                </button>
              ))}
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to={ROUTES.STUDENT_CATALOG}>Browse All Courses</Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EnrolledCourseCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="Couldn't load your courses" onRetry={refetch} />
        ) : !courses || courses.length === 0 ? (
          <div className="text-center py-24 bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-muted/80 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">You haven't enrolled in any courses yet.</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Discover a wide variety of courses and start your learning journey today.
            </p>
            <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              <Link to={ROUTES.STUDENT_CATALOG}>Browse Courses →</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((enrollment) => (
              <EnrolledCourseCard key={enrollment.enrollment_id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
