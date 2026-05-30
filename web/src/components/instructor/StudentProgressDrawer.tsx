import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

interface StudentProgressDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  courseId: string;
  studentName: string;
}

export function StudentProgressDrawer({ open, onOpenChange, studentId, courseId, studentName }: StudentProgressDrawerProps) {
  const { data: modules } = useQuery({
    queryKey: ['student-progress', studentId, courseId],
    queryFn: async () => {
      const [modulesRes, progressRes] = await Promise.all([
        supabase.from('modules').select('*, lessons:lessons(*)').eq('course_id', courseId).order('position'),
        supabase.from('lesson_progress').select('*').eq('user_id', studentId).eq('course_id', courseId),
      ]);
      const progress = progressRes.data ?? [];
      return (modulesRes.data ?? []).map(m => ({
        ...m,
        lessons: (m.lessons ?? []).map((l: any) => ({
          ...l,
          status: progress.find(p => p.lesson_id === l.id)?.status ?? 'not_started',
          completed_at: progress.find(p => p.lesson_id === l.id)?.completed_at ?? null,
        })),
      }));
    },
    enabled: open && !!studentId && !!courseId,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{studentName}</SheetTitle>
          <SheetDescription>Lesson-by-lesson progress breakdown</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {!modules ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules found</p>
          ) : (
            modules.map((module: any) => (
              <div key={module.id}>
                <h4 className="font-medium text-sm mb-2">{module.title}</h4>
                <div className="space-y-1">
                  {module.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                      {lesson.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : lesson.status === 'in_progress' ? (
                        <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm flex-1">{lesson.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {lesson.status === 'completed' ? 'Completed' : lesson.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
