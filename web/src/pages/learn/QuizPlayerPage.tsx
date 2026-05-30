import React, { useEffect, useCallback, useRef, useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useCoursePlayer } from '@/hooks/queries/useCoursePlayer'
import { useQuiz } from '@/hooks/queries/useQuiz'
import { useStartAdvancedAttempt, useSubmitAdvancedQuiz, useLogProctoringFlag } from '@/hooks/mutations/useAdvancedQuizAttempt'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/store/quizStore'
import { QuizTimer } from '@/components/quiz/QuizTimer'
import { QuizNavigator } from '@/components/quiz/QuizNavigator'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizResultsScreen } from '@/components/quiz/QuizResultsScreen'
import { ProctoringWarningModal } from '@/components/quiz/ProctoringWarningModal'
import { AttemptsRemainingPill } from '@/components/quiz/AttemptsRemainingPill'
import { GracePeriodBanner } from '@/components/quiz/GracePeriodBanner'
import { SkeletonPage } from '@/components/common/SkeletonPage'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'

const MAX_PROCTORING_WARNINGS = 3

export default function QuizPlayerPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()

  const { data: courseData, isLoading: courseLoading } = useCoursePlayer(courseId)
  const { data: questions, isLoading: quizLoading } = useQuiz(lessonId)
  const { mutate: startAttempt, isPending: isStarting } = useStartAdvancedAttempt()
  const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitAdvancedQuiz()
  const { mutate: logFlag } = useLogProctoringFlag()

  const store = useQuizStore()

  // Proctoring state
  const [proctoringWarning, setProctoringWarning] = useState(false)
  const [proctoringCount, setProctoringCount] = useState(0)
  const [showAutoSubmitMsg, setShowAutoSubmitMsg] = useState(false)
  const proctoringRef = useRef(false)

  // Quiz overview data (settings + attempts count)
  const { data: quizOverview } = useQuery({
    queryKey: ['quiz-overview', lessonId],
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
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      const { data: bestAttempt } = await supabase
        .from('quiz_attempts')
        .select('score, passed')
        .eq('quiz_id', quiz.id)
        .not('submitted_at', 'is', null)
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle()

      const now = new Date()
      let inGracePeriod = false
      let pastDeadline = false
      if (quiz.due_at) {
        const due = new Date(quiz.due_at)
        if (now > due) {
          const diffHours = (now.getTime() - due.getTime()) / (1000 * 60 * 60)
          if (quiz.grace_period_hours > 0 && diffHours <= quiz.grace_period_hours) {
            inGracePeriod = true
          } else {
            pastDeadline = true
          }
        }
      }

      return {
        id: quiz.id,
        title: quiz.title,
        max_attempts: quiz.max_attempts,
        grace_period_hours: quiz.grace_period_hours,
        grace_penalty_pct: quiz.grace_penalty_pct,
        proctoring_enabled: quiz.proctoring_enabled,
        time_limit_minutes: quiz.time_limit,
        show_answers_after: quiz.show_answers_after,
        attempts_used: count || 0,
        in_grace_period: inGracePeriod,
        past_deadline: pastDeadline,
        best_score: bestAttempt?.score ?? null,
        best_passed: bestAttempt?.passed ?? null,
      }
    },
    enabled: !!lessonId && !!courseId,
  })

  // Proctoring tab-switch detection
  useEffect(() => {
    if (!quizOverview?.proctoring_enabled || !store.attemptId) return

    const handleVisibilityChange = () => {
      if (document.hidden && !proctoringRef.current) {
        proctoringRef.current = true
        setProctoringWarning(true)

        logFlag(
          { attemptId: store.attemptId!, eventType: 'tab_switch' },
          {
            onSuccess: (data) => {
              setProctoringCount(data.warning_count)
              if (data.should_auto_submit) {
                handleAutoSubmit()
              }
            },
            onSettled: () => {
              proctoringRef.current = false
            }
          }
        )
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [quizOverview?.proctoring_enabled, store.attemptId])

  const handleAutoSubmit = useCallback(() => {
    if (!store.attemptId) return
    setShowAutoSubmitMsg(true)
    submitQuiz({
      attemptId: store.attemptId,
      answers: store.answers,
      courseId: courseId!,
      autoSubmitted: true,
    })
  }, [store.attemptId, store.answers, courseId])

  const handleStart = () => {
    if (!quizOverview) return
    startAttempt({ quizId: quizOverview.id }, {
      onError: (err) => {
        if (err.message === 'ATTEMPTS_EXHAUSTED') {
          // handled via UI already
        }
      }
    })
  }

  const handleSubmit = (forceSubmit = false) => {
    if (!store.attemptId || !questions) return
    const unanswered = questions.length - Object.keys(store.answers).length
    if (!forceSubmit && unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) return
    }
    submitQuiz({
      attemptId: store.attemptId,
      answers: store.answers,
      courseId: courseId!
    })
  }

  const handleNextLesson = () => {
    if (!courseData) return
    const flatLessons = courseData.modules.flatMap(m => m.lessons)
    const currentIndex = flatLessons.findIndex(l => l.id === lessonId)
    const nextLesson = flatLessons[currentIndex + 1]
    if (nextLesson) {
      navigate(`/learn/${courseId}/${nextLesson.type === 'quiz' ? 'quiz' : nextLesson.type === 'assignment' ? 'assignment' : 'lesson'}/${nextLesson.id}`)
    }
  }

  if (courseLoading || quizLoading) return <SkeletonPage />
  if (!courseData || !questions) return <ErrorState title="Quiz unavailable" />

  const lesson = courseData.modules.flatMap(m => m.lessons).find(l => l.id === lessonId)
  if (!lesson) return <Navigate to={`/catalog/${courseId}`} replace />

  const attemptsExhausted = quizOverview && quizOverview.max_attempts !== null && quizOverview.attempts_used >= quizOverview.max_attempts
  const isIdle = !store.attemptId && !store.submitted
  const isActive = store.attemptId && !store.submitted

  if (isIdle) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 flex flex-col items-center text-center">
        <h1 className="text-3xl font-heading font-bold mb-4">{lesson.title}</h1>
        <p className="text-muted-foreground mb-4">
          {questions.length} questions · {questions.reduce((acc, q) => acc + q.points, 0)} points
        </p>

        {quizOverview && (
          <div className="flex items-center gap-3 mb-6">
            <AttemptsRemainingPill
              used={quizOverview.attempts_used}
              max={quizOverview.max_attempts}
            />
            {quizOverview.best_score !== null && (
              <span className="text-sm text-muted-foreground">
                Best score: {Math.round(quizOverview.best_score)}%{quizOverview.best_passed ? ' ✅' : ''}
              </span>
            )}
          </div>
        )}

        <GracePeriodBanner
          inGracePeriod={quizOverview?.in_grace_period || false}
          pastDeadline={quizOverview?.past_deadline || false}
          penaltyPct={quizOverview?.grace_penalty_pct || 0}
        />

        <div className="mt-6">
          {attemptsExhausted ? (
            <div className="text-center space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-destructive" />
              <p className="text-sm text-destructive font-medium">
                You have used all {quizOverview?.max_attempts} attempts for this quiz.
              </p>
            </div>
          ) : quizOverview?.past_deadline ? (
            <div className="text-center space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-destructive" />
              <p className="text-sm text-destructive font-medium">
                The submission window for this quiz has closed.
              </p>
            </div>
          ) : (
            <Button size="lg" onClick={handleStart} disabled={isStarting}>
              {isStarting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Start Quiz
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (store.submitted) {
    return (
      <div>
        {showAutoSubmitMsg && (
          <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900 p-4 text-center">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Your quiz was auto-submitted due to repeated tab switches.
            </p>
          </div>
        )}
        <QuizResultsScreen
          score={store.score}
          passed={store.passed}
          results={store.gradeResults}
          questions={questions}
          studentAnswers={store.answers}
          onRetake={() => store.reset()}
          onNext={handleNextLesson}
          attemptsRemaining={quizOverview ? quizOverview.max_attempts === null || quizOverview.attempts_used < quizOverview.max_attempts : true}
        />
      </div>
    )
  }

  if (isActive) {
    const currentQ = questions[store.currentQuestionIndex]

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 flex flex-col h-full relative">
        {quizOverview?.proctoring_enabled && (
          <div className="mb-4 flex items-center justify-between px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800">
            <span className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Proctored quiz — tab switching is monitored
            </span>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Warnings: {proctoringCount}/{MAX_PROCTORING_WARNINGS}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Question {store.currentQuestionIndex + 1} / {questions.length}</h2>
          {store.timeLimitSeconds && store.startedAt && (
            <QuizTimer
              startedAt={store.startedAt}
              timeLimitSeconds={store.timeLimitSeconds}
              onExpire={() => handleSubmit(true)}
            />
          )}
        </div>

        <div className="mb-8">
          <QuizNavigator
            totalQuestions={questions.length}
            currentQuestionIndex={store.currentQuestionIndex}
            answers={store.answers}
            questions={questions}
            onGoToQuestion={store.goToQuestion}
          />
        </div>

        {currentQ && (
          <div className="flex-1">
            <QuizQuestion
              question={currentQ}
              currentAnswer={store.answers[currentQ.id]}
              onAnswer={(val) => store.setAnswer(currentQ.id, val)}
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            disabled={store.currentQuestionIndex === 0}
            onClick={() => store.goToQuestion(store.currentQuestionIndex - 1)}
          >
            ← Previous
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Answered: {Object.keys(store.answers).length} / {questions.length}
            </span>
            {store.currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={() => store.goToQuestion(store.currentQuestionIndex + 1)}>
                Next Question →
              </Button>
            )}
          </div>
        </div>

        {/* Proctoring warning modal */}
        {proctoringWarning && (
          <ProctoringWarningModal
            warningCount={proctoringCount}
            maxWarnings={MAX_PROCTORING_WARNINGS}
            onAcknowledge={() => setProctoringWarning(false)}
          />
        )}
      </div>
    )
  }

  return null
}
