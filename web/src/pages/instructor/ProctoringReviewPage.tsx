import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonPage } from '@/components/common/SkeletonPage'
import { ErrorState } from '@/components/common/ErrorState'
import { AlertTriangle, EyeOff, Clock, CheckCircle2 } from 'lucide-react'

export default function ProctoringReviewPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>()
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['proctoring-attempts', quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('id, user_id, proctoring_warning_count, auto_submitted, instructor_flag, score, passed, started_at, submitted_at, profiles!inner(full_name, avatar_url)')
        .eq('quiz_id', quizId)
        .order('started_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!quizId,
  })

  const { data: flags, isLoading: flagsLoading } = useQuery({
    queryKey: ['proctoring-flags', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return []
      const attempt = attempts?.find(a => a.user_id === selectedStudentId)
      if (!attempt) return []
      const { data, error } = await supabase
        .from('proctoring_flags')
        .select('*')
        .eq('attempt_id', attempt.id)
        .order('flagged_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!selectedStudentId && !!attempts,
  })

  const selectedAttempt = attempts?.find(a => a.user_id === selectedStudentId)

  const handleToggleFlag = async (currentFlag: boolean) => {
    if (!selectedAttempt) return
    await supabase
      .from('quiz_attempts')
      .update({ instructor_flag: !currentFlag })
      .eq('id', selectedAttempt.id)
  }

  if (attemptsLoading) return <SkeletonPage />

  const uniqueStudents = attempts
    ? [...new Map(attempts.map(a => [a.user_id, { user_id: a.user_id, profiles: a.profiles }])).values()]
    : []

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold mb-1">Proctoring Review</h1>
        <p className="text-muted-foreground text-sm">Review tab-switch warnings and flag suspicious attempts</p>
      </div>

      <div className="mb-6">
        <Select value={selectedStudentId} onValueChange={(v) => v && setSelectedStudentId(v)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a student..." />
          </SelectTrigger>
          <SelectContent>
            {uniqueStudents.map((s: any) => (
              <SelectItem key={s.user_id} value={s.user_id}>
                {s.profiles?.full_name || 'Unknown Student'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStudentId && selectedAttempt && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attempt Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-xl font-bold">{selectedAttempt.score !== null ? `${Math.round(selectedAttempt.score)}%` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={selectedAttempt.passed ? 'default' : 'destructive'}>
                    {selectedAttempt.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Auto-submitted</p>
                  <p>{selectedAttempt.auto_submitted ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Warning Count</p>
                  <p className="text-xl font-bold text-amber-600">{selectedAttempt.proctoring_warning_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Flag Timeline</CardTitle>
              <Button
                variant={selectedAttempt.instructor_flag ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleToggleFlag(selectedAttempt.instructor_flag)}
              >
                {selectedAttempt.instructor_flag ? (
                  <><CheckCircle2 className="w-4 h-4 mr-1" /> Clear Flag</>
                ) : (
                  <><AlertTriangle className="w-4 h-4 mr-1" /> Mark as Flagged</>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {flagsLoading ? (
                <p className="text-sm text-muted-foreground">Loading flags...</p>
              ) : flags && flags.length > 0 ? (
                <div className="space-y-3">
                  {flags.map((flag: any) => (
                    <div key={flag.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="mt-0.5">
                        {flag.event_type === 'tab_switch' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        ) : flag.event_type === 'auto_submitted' ? (
                          <Clock className="w-5 h-5 text-red-500" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{flag.event_type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{new Date(flag.flagged_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No proctoring events for this attempt.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedStudentId && (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>Select a student to view their proctoring log</p>
        </div>
      )}
    </div>
  )
}
