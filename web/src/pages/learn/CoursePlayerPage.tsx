import React, { useEffect } from 'react'
import { Outlet, useParams, useNavigate, Navigate } from 'react-router-dom'
import { useCoursePlayer } from '@/hooks/queries/useCoursePlayer'
import { PlayerTopBar } from '@/components/player/PlayerTopBar'
import { CoursePlayerSidebar } from '@/components/player/CoursePlayerSidebar'
import { PlayerBottomBar } from '@/components/player/PlayerBottomBar'
import { CoursePlayerSkeleton } from '@/components/player/CoursePlayerSkeleton'
import { ErrorState } from '@/components/common/ErrorState'

export function CoursePlayerRedirect() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data, isLoading } = useCoursePlayer(courseId)

  if (isLoading) return <CoursePlayerSkeleton />
  if (!data) return <Navigate to={`/catalog/${courseId}`} replace />

  // If lastLessonId exists, redirect there
  if (data.lastLessonId) {
    // Find lesson type to build correct route
    const lesson = data.modules.flatMap(m => m.lessons).find(l => l.id === data.lastLessonId)
    if (lesson) {
      const type = lesson.type === 'assignment' ? 'assignment' : 'lesson'
      return <Navigate to={`/learn/${courseId}/${type}/${lesson.id}`} replace />
    }
  }

  // Else, go to first lesson
  const firstLesson = data.modules[0]?.lessons[0]
  if (firstLesson) {
    const type = firstLesson.type === 'assignment' ? 'assignment' : 'lesson'
    return <Navigate to={`/learn/${courseId}/${type}/${firstLesson.id}`} replace />
  }

  return <ErrorState title="Course has no lessons" />
}

import { CourseCompleteModal } from '@/components/modals/CourseCompleteModal'

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data, isLoading, error } = useCoursePlayer(courseId)
  const [showCompleteModal, setShowCompleteModal] = React.useState(false)

  // Auto show modal when course reaches 100% (and hasn't been shown before during this session)
  useEffect(() => {
    if (data?.progressPct === 100) {
      const hasSeen = sessionStorage.getItem(`course_complete_${courseId}`)
      if (!hasSeen) {
        setShowCompleteModal(true)
        sessionStorage.setItem(`course_complete_${courseId}`, 'true')
      }
    }
  }, [data?.progressPct, courseId])

  if (isLoading) return <CoursePlayerSkeleton />
  if (error || !data) return <ErrorState title="Couldn't load course player" />

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden">
      <PlayerTopBar title={data.course.title} progressPct={data.progressPct} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <CoursePlayerSidebar data={data} />
        
        <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
          <PlayerBottomBar />
        </main>
      </div>

      <CourseCompleteModal 
        isOpen={showCompleteModal} 
        onClose={() => setShowCompleteModal(false)} 
        course={data.course} 
      />
    </div>
  )
}
