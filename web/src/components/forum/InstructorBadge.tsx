import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { GraduationCap } from 'lucide-react'

interface InstructorBadgeProps {
  courseId: string
  userId: string
}

export function InstructorBadge({ courseId, userId }: InstructorBadgeProps) {
  const { data: course } = useQuery({
    queryKey: ['course-instructor', courseId],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('instructor_id')
        .eq('id', courseId)
        .single()
      return data
    },
    enabled: !!courseId && !!userId,
  })

  if (course?.instructor_id !== userId) return null

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
      <GraduationCap className="h-3 w-3" />
      Instructor
    </span>
  )
}
