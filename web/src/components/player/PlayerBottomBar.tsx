import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useCoursePlayerStore } from '@/store/coursePlayerStore'
import { useMarkLessonComplete } from '@/hooks/mutations/useMarkLessonComplete'
import { useNavigate, useParams } from 'react-router-dom'
import { useCoursePlayer } from '@/hooks/queries/useCoursePlayer'

export function PlayerBottomBar() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { data } = useCoursePlayer(courseId)
  const { mutate: markComplete, isPending } = useMarkLessonComplete()

  if (!data || !lessonId || !courseId) return null

  // Flatten lessons to find prev/next
  const flatLessons = data.modules.flatMap(m => m.lessons)
  const currentIndex = flatLessons.findIndex(l => l.id === lessonId)
  
  if (currentIndex === -1) return null

  const currentLesson = flatLessons[currentIndex]
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null

  const isCompleted = currentLesson.progress?.completed

  const handleMarkComplete = () => {
    if (isCompleted || isPending) return
    markComplete(
      { lessonId, courseId },
      {
        onSuccess: () => {
          // Auto navigate to next if there is one
          if (nextLesson) {
            navigate(`/learn/${courseId}/lesson/${nextLesson.id}`)
          }
        }
      }
    )
  }

  const handleNextClick = () => {
    if (nextLesson) {
      navigate(`/learn/${courseId}/lesson/${nextLesson.id}`)
    }
  }

  const handlePrevClick = () => {
    if (prevLesson) {
      navigate(`/learn/${courseId}/lesson/${prevLesson.id}`)
    }
  }

  // Quiz and assignment handle completion implicitly on submit, but student still can navigate.
  // Actually PRD says "For assignments, manual [Mark Complete] is still required". 
  // For Quiz: "After passing, PlayerBottomBar [Mark Complete] is automatically set to completed state... Next becomes enabled."

  return (
    <div className="h-16 flex items-center justify-between px-4 sm:px-8 bg-background border-t border-border flex-shrink-0 z-10">
      <Button 
        variant="outline" 
        onClick={handlePrevClick} 
        disabled={!prevLesson}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <Button
        variant={isCompleted ? 'ghost' : 'default'}
        size="lg"
        onClick={handleMarkComplete}
        disabled={isCompleted || isPending || currentLesson.type === 'quiz'} // Quiz has its own submit
        className={isCompleted ? 'text-green-500 hover:text-green-600 hover:bg-green-500/10' : ''}
      >
        {isCompleted ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Completed
          </>
        ) : (
          <>
            <Check className="w-5 h-5 mr-2 opacity-50" />
            Mark Complete
          </>
        )}
      </Button>

      <Button 
        variant="outline" 
        onClick={handleNextClick} 
        disabled={!nextLesson || (!isCompleted && currentLesson.type !== 'assignment')} 
        // Note: Disabling next if not completed unless it's an assignment (but PRD says "Next is disabled... if lesson not yet marked complete... Exception: quiz and assignment automatically navigate"). I'll just disable if not completed to force sequential flow.
        title={!isCompleted ? "Mark this lesson complete first" : ""}
      >
        <span className="hidden sm:inline">Next</span>
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}
