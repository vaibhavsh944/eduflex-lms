import { Card, CardContent } from '@/components/ui/card';
import type { ProgressAnalytics } from '@/lib/types';
import { BookOpen, Clock, Trophy, Target } from 'lucide-react';

interface StatSummaryRowProps {
  stats: ProgressAnalytics['stats'];
}

export function StatSummaryRow({ stats }: StatSummaryRowProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lessons Completed</p>
            <h3 className="text-2xl font-bold">{stats.total_lessons_completed}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hours Studied</p>
            <h3 className="text-2xl font-bold">{stats.total_time_hours}</h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Courses Completed</p>
            <h3 className="text-2xl font-bold">{stats.courses_completed}</h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <h3 className="text-2xl font-bold">{stats.avg_quiz_score}%</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
