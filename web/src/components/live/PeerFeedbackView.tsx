import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { PeerReviewAssignment, RubricCriteria } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { MessageSquareText } from 'lucide-react'

interface Props {
  submissionId: string
}

export function PeerFeedbackView({ submissionId }: Props) {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['peer-feedback', submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peer_review_assignments')
        .select('*, reviewer:profiles!reviewer_id(id, full_name, avatar_url)')
        .eq('submission_id', submissionId)
        .neq('status', 'pending')
      if (error) throw error
      return data
    },
    enabled: !!submissionId,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error) return <ErrorState title="Failed to load feedback" />

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <MessageSquareText className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold">No feedback yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Peer reviews will appear here once completed.</p>
      </div>
    )
  }

  const allCriteria = new Set<string>()
  reviews.forEach((r) => {
    if (r.score) Object.keys(r.score).forEach((k) => allCriteria.add(k))
  })
  const criteriaList = Array.from(allCriteria)

  return (
    <div className="space-y-6">
      {criteriaList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criteriaList.map((criterion) => {
                const scores = reviews
                  .filter((r) => r.score && r.score[criterion] !== undefined)
                  .map((r) => r.score![criterion] as number)
                const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
                return (
                  <div key={criterion} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{criterion.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium">{avg.toFixed(1)} / 5</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Written Feedback ({reviews.length})
        </h3>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={review.reviewer?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{getInitials(review.reviewer?.full_name ?? '?')}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Anonymous</span>
              </div>
              {review.feedback && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.feedback}</p>
              )}
              {review.score && Object.keys(review.score).length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(review.score).map(([key, val]) => (
                      <span key={key} className="text-xs bg-muted px-2 py-0.5 rounded-md">
                        {key.replace(/_/g, ' ')}: {val}/5
                      </span>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
