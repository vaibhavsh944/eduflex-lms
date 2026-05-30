import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { BarChart3, CheckCircle2, X } from 'lucide-react'
import type { LivePoll } from '@/lib/types'

interface PollModalProps {
  poll: LivePoll
  sessionId: string
  onClose: () => void
}

export function PollModal({ poll, sessionId, onClose }: PollModalProps) {
  const { user } = useAuth()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (selectedOption === null || !user) return
    setIsSubmitting(true)

    const { error } = await supabase
      .from('live_poll_responses')
      .insert({
        poll_id: poll.id,
        session_id: sessionId,
        user_id: user.id,
        chosen_option: selectedOption,
      })

    if (error) {
      toast.error('Failed to submit response')
      setIsSubmitting(false)
      return
    }

    setSubmitted(true)
    setIsSubmitting(false)
    toast.success('Response recorded!')
  }

  const maxCount = poll.response_counts
    ? Math.max(...Object.values(poll.response_counts), 1)
    : 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Poll</CardTitle>
              <CardDescription className="mt-1">{poll.question}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {poll.is_active ? (
            submitted ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="font-medium">Response recorded</p>
                <p className="text-sm text-muted-foreground">Waiting for the instructor to close this poll.</p>
              </div>
            ) : (
              <RadioGroup
                value={selectedOption !== null ? String(selectedOption) : undefined}
                onValueChange={(val) => setSelectedOption(Number(val))}
              >
                <div className="space-y-3">
                  {poll.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50">
                      <RadioGroupItem value={String(idx)} id={`opt-${idx}`} />
                      <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-normal">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Poll Results</span>
              </div>
              {poll.options.map((opt, idx) => {
                const count = poll.response_counts?.[idx] ?? 0
                const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{opt}</span>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>

        {poll.is_active && !submitted && (
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={selectedOption === null || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
