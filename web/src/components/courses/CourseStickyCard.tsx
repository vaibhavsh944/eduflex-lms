import { PlayCircle, Award, Infinity, Smartphone, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDuration } from '@/lib/utils'
import type { Course } from '@/lib/types'
import { useAuthStore } from '@/store/authStore'

interface CourseStickyCardProps {
  course:         Course
  onEnrollClick:  () => void
  isEnrolled:     boolean
  waitlistPosition?: number | null
}

export function CourseStickyCard({ course, onEnrollClick, isEnrolled, waitlistPosition }: CourseStickyCardProps) {
  const user = useAuthStore(s => s.user)
  const isAuthenticated = !!user
  const isFree = course.pricing_type === 'free' || course.price === 0
  const originalPrice = (course as any).original_price
  const hasDiscount = originalPrice && originalPrice > course.price
  const isFull = (course as any).max_seats && (course as any).enrollment_count >= (course as any).max_seats

  return (
    <Card className="sticky top-24 overflow-hidden border-border shadow-lg">
      <div className="relative aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl font-bold text-primary/30">
              {course.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="mb-6 flex items-baseline gap-3">
          {isFree ? (
            <span className="text-3xl font-bold text-emerald-500">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold">₹{course.price.toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </>
          )}
        </div>

        <Button 
          size="lg" 
          className="w-full font-bold text-base" 
          onClick={onEnrollClick}
        >
          {isEnrolled ? 'Go to Course' : !isAuthenticated ? 'Enroll Now' : isFull ? 'Join Waitlist' : isFree ? 'Enroll Free' : `Buy Now — ₹${course.price.toLocaleString('en-IN')}`}
        </Button>

        {waitlistPosition && (
          <div className="mt-2 text-center">
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              You are #{waitlistPosition} on the waitlist
            </Badge>
          </div>
        )}

        {isFull && !isEnrolled && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            Course is full — join the waitlist for auto-enrollment when a seat opens
          </div>
        )}

        <div className="mt-4 text-center text-xs text-muted-foreground">
          30-Day Money-Back Guarantee
        </div>

        <div className="mt-6 space-y-4 text-sm font-medium">
          <h4 className="font-semibold text-foreground">This course includes:</h4>
          
          {course.duration_minutes > 0 && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <PlayCircle className="h-4 w-4 text-primary" />
              <span>{formatDuration(course.duration_minutes)} on-demand video</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <Smartphone className="h-4 w-4 text-primary" />
            <span>Access on mobile and TV</span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <Infinity className="h-4 w-4 text-primary" />
            <span>Full lifetime access</span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <Award className="h-4 w-4 text-primary" />
            <span>Certificate of completion</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
