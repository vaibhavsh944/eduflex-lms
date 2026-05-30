import type { CourseProgressSummary } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

export function CourseCompletionCard({ course }: { course: CourseProgressSummary }) {
  const progressPct = course.total_lessons > 0 ? (course.completed_lessons / course.total_lessons) * 100 : 0;
  
  return (
    <Link to={ROUTES.LEARN_COURSE(course.course_id)} className="block">
      <Card className="overflow-hidden card-hover h-full flex flex-col">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.course_title} className="h-32 w-full object-cover" />
        ) : (
          <div className="h-32 w-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}
        <CardContent className="p-4 flex-1 flex flex-col">
          <h4 className="font-semibold line-clamp-1 mb-2">{course.course_title}</h4>
          
          <div className="mt-auto space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{course.completed_lessons} / {course.total_lessons} lessons</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
