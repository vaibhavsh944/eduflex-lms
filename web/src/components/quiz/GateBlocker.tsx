import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, ArrowRight, Award } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

interface GateBlockerProps {
  courseId: string
  requiredQuizId: string
  requiredQuizTitle: string
  minScore: number
  currentBestScore: number | null
}

export function GateBlocker({
  courseId,
  requiredQuizId,
  requiredQuizTitle,
  minScore,
  currentBestScore
}: GateBlockerProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-800">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-xl">Lesson Locked</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Complete <span className="font-semibold">{requiredQuizTitle}</span> with at least{' '}
            <span className="font-semibold">{minScore}%</span> to unlock this lesson.
          </p>
          {currentBestScore !== null && (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
              <span>Your best score: {Math.round(currentBestScore)}%</span>
            </div>
          )}
          <Button
            onClick={() => navigate(ROUTES.LEARN_QUIZ(courseId, requiredQuizId))}
            className="mt-2"
          >
            Go to Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
