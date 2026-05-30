import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('No lesson ID')
      const { data, error } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
      if (error) throw error
      return data
    },
    enabled: !!lessonId,
  })

  const { data: allLessons } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => {
      if (!courseId) return []
      const { data: mods } = await supabase.from('modules').select('*, lessons(*)').eq('course_id', courseId).order('position')
      return mods?.flatMap((m: any) => m.lessons ?? []) ?? []
    },
    enabled: !!courseId,
  })

  const currentIndex = allLessons?.findIndex((l: any) => l.id === lessonId) ?? -1
  const prevLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < (allLessons?.length ?? 0) - 1 ? allLessons?.[currentIndex + 1] : null

  if (isLoading) return <div className="container px-4 py-8 space-y-4"><Skeleton className="h-8 w-96" /><Skeleton className="aspect-video w-full" /></div>
  if (!lesson) return <div>Lesson not found</div>;

  return (
    <div className="container px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to={ROUTES.LEARN_COURSE(courseId!)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to Course
        </Link>
      </div>
      <div className="aspect-video rounded-lg bg-black flex items-center justify-center mb-6">
        <Play className="h-16 w-16 text-white opacity-80" />
      </div>
      <h1 className="text-2xl font-bold">{lesson.title}</h1>
      <p className="mt-4 text-muted-foreground">{lesson.description ?? lesson.content_text}</p>
      <div className="mt-8 flex justify-between">
        {prevLesson ? <Link to={ROUTES.LEARN_LESSON(courseId!, prevLesson.id)}><Button variant="outline"><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button></Link> : <div />}
        {nextLesson && <Link to={ROUTES.LEARN_LESSON(courseId!, nextLesson.id)}><Button>Next <ChevronRight className="ml-2 h-4 w-4" /></Button></Link>}
      </div>
    </div>
  );
}
