import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Send, X, Loader2, BarChart3 } from 'lucide-react'
import type { LivePoll } from '@/lib/types'

interface PollsPanelProps {
  sessionId: string
}

export function PollsPanel({ sessionId }: PollsPanelProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [polls, setPolls] = useState<LivePoll[]>([])
  const [isLaunching, setIsLaunching] = useState(false)
  const [selectedPoll, setSelectedPoll] = useState<LivePoll | null>(null)

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  const launchPoll = async () => {
    if (!question.trim() || options.some((o) => !o.trim())) {
      toast.error('Please fill in the question and all options')
      return
    }

    setIsLaunching(true)
    const { data, error } = await supabase
      .from('live_polls')
      .insert({
        session_id: sessionId,
        question: question.trim(),
        options: options.map((o) => o.trim()),
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to launch poll')
      setIsLaunching(false)
      return
    }

    const newPoll = data as LivePoll
    setPolls((prev) => [...prev, newPoll])
    setSelectedPoll(newPoll)
    setQuestion('')
    setOptions(['', ''])
    setIsLaunching(false)
    toast.success('Poll launched!')
  }

  const closePoll = async (pollId: string) => {
    const { error } = await supabase
      .from('live_polls')
      .update({ is_active: false })
      .eq('id', pollId)

    if (error) {
      toast.error('Failed to close poll')
      return
    }

    setPolls((prev) => prev.map((p) => (p.id === pollId ? { ...p, is_active: false } : p)))
    setSelectedPoll(null)
    toast.success('Poll closed')
  }

  const maxCount = selectedPoll?.response_counts
    ? Math.max(...Object.values(selectedPoll.response_counts), 1)
    : 1

  return (
    <div className="flex h-full flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Create a Poll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="poll-question">Question</Label>
            <Input
              id="poll-question"
              placeholder="What is your preferred framework?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Options ({options.length}/6)</Label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                />
                {options.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="mr-1 h-3 w-3" />
                Add Option
              </Button>
            )}
          </div>

          <Button onClick={launchPoll} disabled={isLaunching} className="w-full">
            {isLaunching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            Launch Poll
          </Button>
        </CardContent>
      </Card>

      {polls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Polls</h4>
          {polls.map((poll) => (
            <Card
              key={poll.id}
              className={`cursor-pointer transition-colors ${
                selectedPoll?.id === poll.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPoll(poll)}
            >
              <CardHeader className="p-3 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium">{poll.question}</CardTitle>
                  {poll.is_active && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); closePoll(poll.id) }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  <span>{poll.response_counts ? Object.values(poll.response_counts).reduce((a, b) => a + b, 0) : 0} responses</span>
                  {poll.is_active && (
                    <span className="text-green-600 font-medium">• Live</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPoll && selectedPoll.response_counts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Results: {selectedPoll.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedPoll.options.map((opt, idx) => {
              const count = selectedPoll.response_counts?.[idx] ?? 0
              const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{opt}</span>
                    <span className="text-muted-foreground">{count} votes</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
