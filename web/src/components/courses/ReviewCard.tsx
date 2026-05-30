import { ThumbsUp } from 'lucide-react'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { StarRating } from '@/components/common/StarRating'
import type { Review } from '@/lib/types'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="py-6 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {review.user?.avatar_url ? (
            <img 
              src={review.user.avatar_url} 
              alt={review.user.full_name}
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary border border-primary/20">
              {getInitials(review.user?.full_name || 'U')}
            </div>
          )}
          <div>
            <div className="font-semibold text-foreground">{review.user?.full_name || 'Anonymous'}</div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(review.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {review.title && (
          <h4 className="font-semibold text-foreground">{review.title}</h4>
        )}
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {review.body}
        </p>
      </div>

      {review.helpful_count > 0 && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{review.helpful_count} people found this helpful</span>
        </div>
      )}
    </div>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="py-6 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}