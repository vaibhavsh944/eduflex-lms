import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCoursePlayer } from '@/hooks/queries/useCoursePlayer'
import { SkeletonPage } from '@/components/common/SkeletonPage'

export default function CoursePlayerRedirect() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useCoursePlayer(courseId)

  useEffect(() => {
    if (isLoading) return
    if (!data) {
      navigate(`/catalog/${courseId}`, { replace: true })
      return
    }
    if (data.lastLessonId) {
      const lesson = data.modules.flatMap(m => m.lessons).find(l => l.id === data.lastLessonId)
      if (lesson) {
        const type = lesson.type === 'quiz' ? 'quiz' : lesson.type === 'assignment' ? 'assignment' : 'lesson'
        navigate(`/learn/${courseId}/${type}/${lesson.id}`, { replace: true })
        return
      }
    }
    const firstLesson = data.modules[0]?.lessons[0]
    if (firstLesson) {
      const type = firstLesson.type === 'quiz' ? 'quiz' : firstLesson.type === 'assignment' ? 'assignment' : 'lesson'
      navigate(`/learn/${courseId}/${type}/${firstLesson.id}`, { replace: true })
    } else {
      navigate(`/catalog/${courseId}`, { replace: true })
    }
  }, [data, isLoading, courseId, navigate])

  if (isLoading) return <SkeletonPage />
  return null
}
