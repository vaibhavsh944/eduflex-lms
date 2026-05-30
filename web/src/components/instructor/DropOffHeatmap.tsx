import { cn } from '@/lib/utils';

interface DropOffHeatmapProps {
  data: {
    studentName: string;
    lessons: { title: string; status: 'completed' | 'in_progress' | 'not_started' }[];
  }[];
}

export function DropOffHeatmap({ data }: DropOffHeatmapProps) {
  if (!data?.length) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex">
          <div className="sticky left-0 bg-background z-10">
            <div className="h-8" />
            {data.slice(0, 50).map((row, i) => (
              <div key={i} className="flex items-center h-6 px-2 text-xs text-muted-foreground truncate w-32">
                {row.studentName}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-0.5">
              {data[0]?.lessons.map((_, li) => (
                <div key={li} className="flex flex-col gap-0.5">
                  {data.slice(0, 50).map((row, ri) => {
                    const lesson = row.lessons[li];
                    return (
                      <div
                        key={ri}
                        className={cn(
                          'h-6 w-6 rounded-sm',
                          lesson?.status === 'completed' ? 'bg-emerald-500' :
                          lesson?.status === 'in_progress' ? 'bg-amber-400' :
                          'bg-muted'
                        )}
                        title={`${row.studentName} - ${lesson?.title ?? ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {data.length > 50 && (
          <p className="text-xs text-muted-foreground mt-2">Showing first 50 students.</p>
        )}
      </div>
    </div>
  );
}
