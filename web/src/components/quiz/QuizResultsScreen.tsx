import React from 'react'
import type { QuizGradeResult, QuizQuestion as QuizQuestionType } from '@/lib/types'
import { CheckCircle2, XCircle, Trophy, Frown, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuizResultsScreenProps {
  score: number | null
  passed: boolean | null
  results: QuizGradeResult['results']
  questions: QuizQuestionType[]
  studentAnswers: Record<string, string>
  onRetake?: () => void
  onNext?: () => void
  attemptsRemaining: boolean
}

export function QuizResultsScreen({ score, passed, results, questions, studentAnswers, onRetake, onNext, attemptsRemaining }: QuizResultsScreenProps) {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 bg-muted">
          {passed ? (
            <Trophy className="w-12 h-12 text-yellow-500" />
          ) : (
            <Frown className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
        <h2 className="text-3xl font-heading font-bold mb-2">
          {passed ? 'Quiz Passed!' : 'Quiz Failed'}
        </h2>
        <p className="text-lg text-muted-foreground">
          Your score: <span className={cn("font-bold", passed ? "text-green-500" : "text-red-500")}>{score?.toFixed(1)}%</span> (passed at 70%)
        </p>
        
        <div className="flex justify-center gap-4 mt-8">
          {onRetake && attemptsRemaining && (
            <Button variant="outline" onClick={onRetake} size="lg">Retake Quiz</Button>
          )}
          {onNext && passed && (
            <Button onClick={onNext} size="lg">Next Lesson →</Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-bold border-b border-border pb-2">Question Review</h3>
        
        {questions.map((q, idx) => {
          const res = results[q.id]
          if (!res) return null // shouldn't happen if graded fully
          const studentAnsId = studentAnswers[q.id]
          const studentOpt = q.quiz_options?.find(o => o.id === studentAnsId)
          const correctOpt = q.quiz_options?.find(o => o.id === res.correct_option_id)

          return (
            <div key={q.id} className="p-6 bg-card border border-border rounded-xl shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="font-semibold text-lg flex-1 pr-4">
                  {idx + 1}. {q.question}
                </p>
                <div className={cn("flex items-center font-bold", res.correct ? "text-green-500" : "text-red-500")}>
                  {res.correct ? <CheckCircle2 className="w-5 h-5 mr-1" /> : <XCircle className="w-5 h-5 mr-1" />}
                  {res.correct ? `+${q.points}` : '0'}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Your answer: </span>
                  <span className="font-medium">
                    {q.type === 'short_answer' ? studentAnsId || '(No answer)' : studentOpt?.option_text || '(No answer)'}
                  </span>
                </div>
                
                {!res.correct && q.type !== 'short_answer' && correctOpt && (
                  <div className="text-sm">
                    <span className="text-red-500 font-semibold">✗ Incorrect. </span>
                    <span className="text-muted-foreground">Correct answer: </span>
                    <span className="font-medium text-green-500">{correctOpt.option_text}</span>
                  </div>
                )}
                
                {res.correct && (
                  <div className="text-sm text-green-500 font-semibold">✓ Correct!</div>
                )}
              </div>

              {res.explanation && (
                <div className="bg-muted/50 p-4 rounded-lg flex items-start text-sm">
                  <Lightbulb className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{res.explanation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
