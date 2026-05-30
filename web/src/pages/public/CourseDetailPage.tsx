import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { SEO } from '@/components/shared/SEO'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Globe, CheckCircle2, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useCourse } from '@/hooks/queries/useCourse'
import { useEnrollmentStatus, useEnrollFree } from '@/hooks/queries/useEnrollmentStatus'
import { useCourseReviews, useCourseRatingBreakdown } from '@/hooks/queries/useCourseReviews'
import { useCourses } from '@/hooks/queries/useCourses'
import { CourseCard } from '@/components/courses/CourseCard'

import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/common/ErrorState'
import { StarRating } from '@/components/common/StarRating'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CourseStickyCard } from '@/components/courses/CourseStickyCard'
import { CurriculumAccordion } from '@/components/courses/CurriculumAccordion'
import { InstructorBio } from '@/components/courses/InstructorBio'
import { ReviewCard, ReviewCardSkeleton } from '@/components/courses/ReviewCard'
import { RatingBreakdown } from '@/components/courses/RatingBreakdown'
import { PaymentModal } from '@/components/courses/PaymentModal'

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const { data: course, isLoading, isError, refetch } = useCourse(courseId)
  const { data: enrollment } = useEnrollmentStatus(courseId)
  const { mutate: enrollFree } = useEnrollFree(courseId!)

  const { data: waitlistEntry, refetch: refetchWaitlist } = useQuery({
    queryKey: ['waitlist', courseId],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('waitlists').select('position').eq('course_id', courseId).eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '').maybeSingle()
        return data
      } catch {
        return null
      }
    },
    retry: false,
  })

  const joinWaitlist = useMutation({
    mutationFn: async () => {
      try {
        const { data: maxPos } = await supabase.from('waitlists').select('position').eq('course_id', courseId).order('position', { ascending: false }).limit(1).maybeSingle()
        const nextPos = (maxPos?.position || 0) + 1
        if (!currentUser) throw new Error('You must be logged in')
        const { error } = await supabase.from('waitlists').insert({ course_id: courseId, user_id: currentUser.id, position: nextPos })
        if (error) throw error
      } catch {
        throw new Error('Waitlist is currently unavailable')
      }
    },
    onSuccess: () => {
      toast.success('You have been added to the waitlist')
      queryClient.invalidateQueries({ queryKey: ['waitlist', courseId] })
      refetchWaitlist()
    },
    onError: (err) => toast.error(err.message),
  })
  
  const { 
    data: reviewsPage, 
    isLoading: isReviewsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useCourseReviews(courseId)

  const { data: ratingBreakdown } = useCourseRatingBreakdown(courseId)

  const { data: relatedData } = useCourses({
    q: '',
    category: course?.category ? [course.category as any] : [],
    level: [],
    pricing: 'all',
    rating: null,
    duration: [],
    language: [],
    sort: 'popular',
    page: 1,
  })

  if (isLoading) {
    return (
      <div className="container px-4 py-12 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-10 w-3/4 bg-muted rounded mb-6" />
        <div className="h-4 w-1/2 bg-muted rounded mb-2" />
        <div className="h-4 w-2/3 bg-muted rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
          <div className="hidden lg:block">
            <div className="h-96 bg-muted rounded-xl sticky top-24" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="container px-4 py-12">
        <ErrorState 
          title="Course not found" 
          message="This course may have been removed or is not currently published."
          onRetry={refetch}
        >
          <Button onClick={() => navigate('/catalog')} className="mt-4">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Courses
          </Button>
        </ErrorState>
      </div>
    )
  }

  const isEnrolled = enrollment !== undefined && enrollment !== null
  const isFree = course.pricing_type === 'free' || course.price === 0
  const isFull = (course as any).max_seats && (course as any).enrollment_count >= (course as any).max_seats

  const handleEnrollClick = () => {
    if (isEnrolled) {
      window.location.href = `/learn/${course.id}`
      return
    }
    if (isFull && !waitlistEntry) {
      joinWaitlist.mutate()
      return
    }
    if (isFree) {
      enrollFree()
    } else {
      setIsPaymentModalOpen(true)
    }
  }

  const breadcrumbs = [
    { label: 'Catalog', href: '/catalog' },
    { label: String(course.category).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), href: `/catalog?category=${course.category}` },
  ]

  return (
    <>
      <SEO title={course?.title ? `${course.title} | EduFlow` : undefined} description={course?.description} />
      <Helmet>
        <title>{course.title} | EduFlow</title>
        <meta name="description" content={course.short_description || course.description} />
      </Helmet>

      {/* Hero Section (Dark Theme) */}
      <div className="bg-slate-900 text-slate-50 py-12 lg:py-16">
        <div className="container px-4">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            
            {/* Hero Content */}
            <div className="lg:col-span-2 space-y-6">
              <nav className="flex items-center text-sm text-slate-400">
                {breadcrumbs.map((bc, i) => (
                  <div key={i} className="flex items-center">
                    {i > 0 && <ChevronRight className="h-4 w-4 mx-2 opacity-50" />}
                    <Link to={bc.href} className="hover:text-white transition-colors line-clamp-1">
                      {bc.label}
                    </Link>
                  </div>
                ))}
              </nav>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
                {course.short_description || course.description?.replace(/<[^>]*>/g, '')}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-500">{course.rating.toFixed(1)}</span>
                  <StarRating rating={course.rating} size="sm" />
                    <button onClick={() => setActiveTab('reviews')} className="text-blue-400 hover:underline">
                      ({course.rating_count.toLocaleString()} ratings)
                    </button>
                </div>
                <div>
                  <span className="font-medium">{course.enrollment_count.toLocaleString()}</span> students
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  Created by <button onClick={() => setActiveTab('instructor')} className="text-blue-400 hover:underline">{course.instructor?.full_name}</button>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {course.language || 'English'}
                </div>
              </div>
            </div>

            {/* Mobile Sticky Card Container (visible only on mobile) */}
            <div className="block lg:hidden">
              <CourseStickyCard 
                course={course} 
                isEnrolled={isEnrolled} 
                onEnrollClick={handleEnrollClick}
                waitlistPosition={waitlistEntry?.position}
              />
            </div>
            
          </div>
        </div>
      </div>

      <div className="container px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-12">
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-12 mt-6">
                <section className="rounded-xl border border-border bg-card p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6">What you'll learn</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(course.what_you_learn && course.what_you_learn.length > 0 ? course.what_you_learn : []).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80 leading-relaxed">{item}</span>
                      </div>
                    ))}
                    {(!course.what_you_learn || course.what_you_learn.length === 0) && (
                      <p className="text-sm text-muted-foreground col-span-full">No learning outcomes listed yet.</p>
                    )}
                  </div>
                </section>

                {/* Requirements */}
                {course.requirements && course.requirements.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                    <ul className="list-disc list-inside space-y-2 text-foreground/80">
                      {course.requirements.map((req: string, i: number) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Description */}
                <section>
                  <h2 className="text-2xl font-bold mb-4">Description</h2>
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-foreground/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: course.description || '' }}
                  />
                </section>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-12 mt-6">
                <section id="curriculum">
                  <h2 className="text-2xl font-bold mb-6">Course Content</h2>
                  <CurriculumAccordion 
                    modules={course.modules} 
                    enrollmentStatus={enrollment || null} 
                    courseId={course.id}
                  />
                </section>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-12 mt-6">
                <section id="instructor">
                  <h2 className="text-2xl font-bold mb-6">Instructor</h2>
                  {course.instructor && (
                    <InstructorBio instructor={course.instructor as any} />
                  )}
                </section>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-12 mt-6">
                <section id="reviews">
                  <h2 className="text-2xl font-bold mb-6">Student Feedback</h2>
                  
                  {ratingBreakdown && ratingBreakdown.length > 0 && (
                    <div className="mb-8">
                      <RatingBreakdown 
                        rating={course.rating} 
                        breakdown={{
                          distribution: Object.fromEntries(ratingBreakdown.map(r => [r.star, r.count])) as any,
                          percentages: Object.fromEntries(ratingBreakdown.map(r => [r.star, r.percentage])) as any
                        }} 
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {isReviewsLoading ? (
                      Array(3).fill(0).map((_, i) => <ReviewCardSkeleton key={i} />)
                    ) : reviewsPage?.pages[0]?.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground">No reviews yet for this course.</p>
                      </div>
                    ) : (
                      <>
                        {reviewsPage?.pages.map((page, i) => (
                          <div key={i}>
                            {page.map(review => (
                              <ReviewCard key={review.id} review={review} />
                            ))}
                          </div>
                        ))}
                        
                        {hasNextPage && (
                          <div className="pt-6 text-center">
                            <Button 
                              variant="outline" 
                              onClick={() => fetchNextPage()}
                              disabled={isFetchingNextPage}
                            >
                              {isFetchingNextPage ? 'Loading...' : 'Load More Reviews'}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </section>
              </TabsContent>
            </Tabs>

            {/* Related Courses */}
            {relatedData && relatedData.data.filter(c => c.id !== course.id).length > 0 && (
              <section className="pt-8 border-t border-border">
                <h2 className="text-2xl font-bold mb-6">Students Also Viewed</h2>
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x">
                  {relatedData.data
                    .filter(c => c.id !== course.id)
                    .slice(0, 3)
                    .map(relatedCourse => (
                      <div key={relatedCourse.id} className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 flex-1 snap-start">
                        <CourseCard course={relatedCourse} />
                      </div>
                    ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column / Sticky Card (Desktop) */}
          <div className="hidden lg:block relative">
            {/* The absolute positioning combined with sticky in the card component creates the classic LMS scroll effect */}
            <div className="absolute -top-64 w-full z-10">
              <CourseStickyCard 
                course={course} 
                isEnrolled={isEnrolled} 
                onEnrollClick={handleEnrollClick}
                waitlistPosition={waitlistEntry?.position}
              />
            </div>
          </div>

        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        courseId={course.id}
        price={course.price}
      />
    </>
  )
}
