import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { X } from 'lucide-react'
import type { AdaptiveRecommendation } from '@/lib/types'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'

const DISMISS_KEY = 'eduflow-adaptive-dismiss'

function isDismissed(userId: string): boolean {
  try {
    const raw = localStorage.getItem(`${DISMISS_KEY}-${userId}`)
    if (!raw) return false
    return Date.now() < parseInt(raw, 10)
  } catch {
    return false
  }
}

function setDismissed(userId: string) {
  const until = Date.now() + 7 * 24 * 60 * 60 * 1000
  localStorage.setItem(`${DISMISS_KEY}-${userId}`, String(until))
}

async function fetchRecommendation(userId: string): Promise<AdaptiveRecommendation | null> {
  const { data } = await supabase
    .from('adaptive_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

interface AdaptivePathCardProps {
  userId: string
}

export function AdaptivePathCard({ userId }: AdaptivePathCardProps) {
  const navigate = useNavigate()
  const dismissed = isDismissed(userId)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adaptive-recommendation', userId],
    queryFn: () => fetchRecommendation(userId),
    enabled: !!userId && !dismissed,
    staleTime: 1000 * 60 * 30,
  })

  if (dismissed || (!isLoading && !data)) return null

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <Skeleton className="h-5 w-48 mb-3" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64 mt-3" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) return null

  const { lesson_id, course_id, reason, lesson_name, course_name } = data

  const handleDismiss = () => {
    setDismissed(userId)
    toast.success('Recommendation dismissed')
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            🤖 Personalised Recommendation
          </p>
          <CardTitle className="text-lg mt-1">
            Your Next Step
          </CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">{reason}</p>
        {course_name && (
          <p className="text-xs text-muted-foreground mt-1">
            Course: {course_name}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center gap-3">
        <Button onClick={() => navigate(ROUTES.LEARN_LESSON(course_id, lesson_id))}>
          → Go to {lesson_name || 'Lesson'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDismiss}>
          Not for me
        </Button>
      </CardFooter>
    </Card>
  )
}
