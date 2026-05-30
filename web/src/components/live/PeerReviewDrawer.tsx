import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Assignment, RubricCriteria } from '@/lib/types'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'


interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment
  submission: { id: string; content: string; user_id: string }
}

export function PeerReviewDrawer({ open, onOpenChange, assignment, submission }: Props) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [overallFeedback, setOverallFeedback] = useState('')

  const rubric: RubricCriteria[] = assignment.rubric ?? []

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const scoreData: Record<string, number> = {}
      rubric.forEach((c) => {
        const id = c.id ?? c.criterion ?? ''
        scoreData[id] = scores[id] ?? 0
      })

      const { error: reviewError } = await supabase
        .from('peer_review_assignments')
        .upsert({
          submission_id: submission.id,
          reviewer_id: user.id,
          status: 'completed',
          score: scoreData,
          feedback: overallFeedback,
          reviewed_at: new Date().toISOString(),
        }, { onConflict: 'submission_id,reviewer_id' })
      if (reviewError) throw reviewError

      for (const criterion of rubric) {
        const cid = criterion.id ?? criterion.criterion ?? ''
        if (comments[cid]) {
          const { error: scoreError } = await supabase
            .from('rubric_scores')
            .upsert({
              submission_id: submission.id,
              criterion_id: cid,
              score: scores[cid] ?? 0,
              comment: comments[cid],
            }, { onConflict: 'submission_id,criterion_id' })
          if (scoreError) throw scoreError
        }
      }
    },
    onSuccess: () => {
      toast.success('Review submitted!')
      queryClient.invalidateQueries({ queryKey: ['peer-review'] })
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to submit review'),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Peer Review</SheetTitle>
          <SheetDescription>Review and score your peer's submission</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Submission Content */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Submission</h4>
              <div
                className="rounded-lg border bg-muted/30 p-4 text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: submission.content }}
              />
            </div>

            {rubric.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-3">Rubric Scoring</h4>
                  <div className="space-y-4">
                    {rubric.map((criterion) => {
                      const cid = criterion.id ?? criterion.criterion ?? ''
                      const maxPts = criterion.max_points ?? criterion.points ?? 5
                      return (
                        <div key={cid} className="rounded-lg border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">{criterion.title ?? criterion.criterion ?? 'Criterion'}</Label>
                            <span className="text-xs text-muted-foreground">Max {maxPts} pts</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{criterion.description}</p>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={maxPts}
                              placeholder={`0-${maxPts}`}
                              value={scores[cid] ?? ''}
                              onChange={(e) => setScores((prev) => ({ ...prev, [cid]: Number(e.target.value) }))}
                              className="w-20"
                            />
                            <span className="text-xs text-muted-foreground">/ {maxPts}</span>
                          </div>
                          <Textarea
                            placeholder="Comment for this criterion (optional)"
                            value={comments[cid] ?? ''}
                            onChange={(e) => setComments((prev) => ({ ...prev, [cid]: e.target.value }))}
                            className="min-h-[60px] text-sm"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <Label htmlFor="feedback">Overall Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide overall feedback on this submission..."
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                className="min-h-[100px] mt-2"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => submitReview()} disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
