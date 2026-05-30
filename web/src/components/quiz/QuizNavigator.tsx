import React from 'react'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface QuizNavigatorProps {
  totalQuestions: number
  currentQuestionIndex: number
  answers: Record<string, string>
  questions: { id: string }[]
  onGoToQuestion: (index: number) => void
}

export function QuizNavigator({ totalQuestions, currentQuestionIndex, answers, questions, onGoToQuestion }: QuizNavigatorProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-center p-4 bg-muted/30 rounded-lg border border-border">
      {questions.map((q, idx) => {
        const isAnswered = !!answers[q.id]
        const isCurrent = idx === currentQuestionIndex

        return (
          <button
            key={q.id}
            onClick={() => onGoToQuestion(idx)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
              isAnswered ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
            )}
          >
            {isCurrent && !isAnswered ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              idx + 1
            )}
          </button>
        )
      })}
    </div>
  )
}
