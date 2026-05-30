import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useQuiz } from '@/hooks/queries/useQuiz'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AttemptsRemainingPill } from '@/components/quiz/AttemptsRemainingPill'
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Trophy, Frown, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineQuizSectionProps {
  lessonId: string
  courseId: string
}

export function InlineQuizSection({ lessonId, courseId }: InlineQuizSectionProps) {
  const user = useAuthStore(s => s.user)
  const queryClient = useQueryClient()
  const { data: questions = [], isLoading: quizLoading } = useQuiz(lessonId)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)
  const [gradeResults, setGradeResults] = useState<Record<string, { correct: boolean; correct_option_id: string; explanation: string }>>({})
  const [startError, setStartError] = useState<string | null>(null)

  const { data: quizOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['quiz-overview-inline', lessonId, user?.id],
    queryFn: async () => {
      if (!lessonId || !courseId) return null
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle()
      if (!quiz) return null
      const { count } = await supabase
        .from('quiz_attempts')
        .select('id', { head: true, count: 'exact' })
        .eq('quiz_id', quiz.id)
        .eq('user_id', user?.id)
      const { data: bestAttempt } = await supabase
        .from('quiz_attempts')
        .select('score, passed')
        .eq('quiz_id', quiz.id)
        .eq('user_id', user?.id)
        .not('submitted_at', 'is', null)
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle()
      return {
        id: quiz.id,
        title: quiz.title,
        max_attempts: quiz.max_attempts,
        time_limit_minutes: quiz.time_limit,
        attempts_used: count || 0,
        best_score: bestAttempt?.score ?? null,
        best_passed: bestAttempt?.passed ?? null,
      }
    },
    enabled: !!lessonId && !!courseId && !!user,
  })

  const startAttempt = useMutation({
    mutationFn: async () => {
      setStartError(null)
      if (!quizOverview) throw new Error('No quiz')
      const { data, error } = await supabase.functions.invoke('start-attempt', {
        body: { quiz_id: quizOverview.id }
      })
      if (error) throw error
      if (data.error === 'ATTEMPTS_EXHAUSTED') throw new Error('ATTEMPTS_EXHAUSTED')
      return data
    },
    onSuccess: (data) => {
      setAttemptId(data.id)
      setAnswers({})
      setSubmitted(false)
      setScore(null)
      setPassed(null)
      setGradeResults({})
    },
    onError: (err: any) => {
      if (err.message === 'ATTEMPTS_EXHAUSTED') {
        queryClient.invalidateQueries({ queryKey: ['quiz-overview-inline', lessonId] })
      } else {
        setStartError('Could not start quiz. Check that your device clock is accurate, then refresh and try again.')
      }
    },
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId) throw new Error('No active attempt')
      const { data, error } = await supabase.functions.invoke('submit-quiz', {
        body: { attempt_id: attemptId, answers, auto_submitted: false }
      })
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      setSubmitted(true)
      setScore(data.score)
      setPassed(data.passed)
      setGradeResults(data.results)
      queryClient.invalidateQueries({ queryKey: ['quiz-overview-inline', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['course-player'] })
    },
    onError: (err: any) => {
      if (err?.message) alert(err.message)
    },
  })

  const handleAnswer = (questionId: string, value: string) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) return
    submitMutation.mutate()
  }

  if (quizLoading || overviewLoading) return null
  if (!quizOverview || questions.length === 0) return null

  const attemptsExhausted = quizOverview.max_attempts !== null && quizOverview.attempts_used >= quizOverview.max_attempts
  const isIdle = !attemptId && !submitted
  const isActive = attemptId && !submitted

  return (
    <div className="border-t pt-8 mt-8">
      <h2 className="text-2xl font-heading font-bold mb-2">{quizOverview.title || 'Quiz'}</h2>

      {isIdle && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <AttemptsRemainingPill
              used={quizOverview.attempts_used}
              max={quizOverview.max_attempts}
            />
            {quizOverview.best_score !== null && (
              <span className="text-sm text-muted-foreground">
                Best score: {Math.round(quizOverview.best_score)}%{quizOverview.best_passed ? ' ✅' : ''}
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {questions.length} questions · {questions.reduce((acc, q: any) => acc + q.points, 0)} points
            </span>
          </div>

          {attemptsExhausted ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>You have used all {quizOverview.max_attempts} attempts for this quiz.</span>
            </div>
          ) : (
            <>
              {startError && (
                <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-3 rounded-lg mb-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                  <span className="text-sm">{startError}</span>
                </div>
              )}
              <Button size="lg" onClick={() => startAttempt.mutate()} disabled={startAttempt.isPending}>
                {startAttempt.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                Start Quiz
              </Button>
            </>
          )}
        </div>
      )}

      {isActive && (
        <>
          <div className="space-y-4 mb-6 mt-4">
            {questions.map((q: any, qIdx) => (
              <Card key={q.id}>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">
                    Question {qIdx + 1}
                    <span className="text-muted-foreground ml-2">({q.points} pt{q.points !== 1 ? 's' : ''})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <p className="text-sm">{q.question}</p>

                  {(q.type === 'mcq' || q.type === 'true_false') && (
                    <RadioGroup
                      value={answers[q.id] ?? ''}
                      onValueChange={(v) => handleAnswer(q.id, v)}
                    >
                      {q.quiz_options.map((opt: any) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <RadioGroupItem value={opt.id} id={opt.id} />
                          <Label htmlFor={opt.id} className="text-sm">{opt.option_text}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {q.type === 'short_answer' && (
                    <Textarea
                      value={answers[q.id] ?? ''}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      placeholder="Type your answer..."
                      rows={3}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={submitMutation.isPending} size="lg">
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Quiz
          </Button>
        </>
      )}

      {submitted && (
        <div className="space-y-6 mt-4">
          <div className="flex items-center gap-3">
            {passed ? <Trophy className="w-8 h-8 text-emerald-500" /> : <Frown className="w-8 h-8 text-destructive" />}
            <div>
              <p className="text-xl font-bold">{score !== null ? `${Math.round(score)}%` : 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{passed ? 'You passed!' : 'Did not pass'}</p>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q: any) => {
              const result = gradeResults[q.id]
              return (
                <Card key={q.id}>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {result?.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      {q.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {q.quiz_options.map((opt: any) => {
                      const isSelected = answers[q.id] === opt.id
                      const isCorrect = opt.is_correct
                      return (
                        <div key={opt.id} className={cn('p-2 rounded text-sm border',
                          isSelected && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
                          isSelected && !isCorrect && 'border-destructive bg-destructive/10',
                          !isSelected && isCorrect && 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/10',
                        )}>
                          {opt.option_text}
                          {isSelected && !isCorrect && <span className="ml-2 text-xs text-destructive">(your answer)</span>}
                          {isCorrect && <span className="ml-2 text-xs text-emerald-600">(correct answer)</span>}
                        </div>
                      )
                    })}
                    {result?.explanation && (
                      <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                        <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{result.explanation}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {!attemptsExhausted && (
            <Button variant="outline" onClick={() => { setAttemptId(null); setSubmitted(false); }}>
              Retry Quiz
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
