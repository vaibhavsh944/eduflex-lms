import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { QuizQuestion as QuizQuestionType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface QuizQuestionProps {
  question: QuizQuestionType
  currentAnswer: string | undefined
  onAnswer: (val: string) => void
}

export function QuizQuestion({ question, currentAnswer, onAnswer }: QuizQuestionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-semibold leading-relaxed">{question.question}</h3>
        <span className="flex-shrink-0 ml-4 px-2.5 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-full">
          {question.points} pts
        </span>
      </div>

      {(question.type === 'mcq' || question.type === 'true_false') && (
        <RadioGroup value={currentAnswer || ''} onValueChange={onAnswer} className="space-y-3">
          {question.quiz_options.map((opt) => (
            <div 
              key={opt.id} 
              className={cn(
                "flex items-center space-x-3 space-y-0 border p-4 rounded-lg cursor-pointer transition-colors",
                currentAnswer === opt.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
              )}
              onClick={() => onAnswer(opt.id)}
            >
              <RadioGroupItem value={opt.id} id={opt.id} />
              <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-medium leading-relaxed">
                {opt.option_text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === 'short_answer' && (
        <Textarea 
          placeholder="Type your answer here..."
          value={currentAnswer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          className="min-h-32 text-base"
        />
      )}
    </div>
  )
}
