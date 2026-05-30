import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkeletonList } from '@/components/shared/SkeletonList';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Megaphone, ChevronDown, ChevronUp } from 'lucide-react';
import { useEnrolledCourses } from '@/hooks/queries/useEnrolledCourses';

export function StudentAnnouncements() {
  const [courseFilter, setCourseFilter] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const user = useAuthStore((s) => s.user);
  const { data: enrollments } = useEnrolledCourses('all');

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['student-announcements', user?.id],
    queryFn: async () => {
      const enrolledCourseIds = (enrollments || []).map((e) => e.course?.id).filter(Boolean) as string[];
      const [globalResult, courseResult] = await Promise.all([
        supabase
          .from('announcements')
          .select('*, author:profiles!announcements_created_by_fkey(full_name, avatar_url)')
          .eq('status', 'sent')
          .or('target_type.eq.all,and(target_type.eq.role,target_role.eq.student)')
          .order('sent_at', { ascending: false }),
        enrolledCourseIds.length > 0
          ? supabase
              .from('announcements')
              .select('*, author:profiles!announcements_created_by_fkey(full_name, avatar_url)')
              .eq('status', 'sent')
              .eq('target_type', 'course')
              .in('course_id', enrolledCourseIds)
              .order('sent_at', { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);
      if (globalResult.error) throw globalResult.error;
      if (courseResult.error) throw courseResult.error;
      return [...(globalResult.data ?? []), ...(courseResult.data ?? [])];
    },
    enabled: !!user?.id && !!enrollments,
  });

  const courseOptions = (() => {
    const map = new Map<string, string>();
    enrollments?.forEach((e) => {
      const title = e.course?.title;
      if (title) map.set(e.course_id, title);
    });
    return Array.from(map.entries());
  })();

  const filtered = (announcements || []).filter((a) => {
    if (courseFilter === 'all') return true;
    if (courseFilter === 'global') return !a.course_id;
    return a.course_id === courseFilter;
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <PageHeader title="Announcements" description="Latest updates and notifications" />
      <div className="mb-4">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All announcements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All announcements</SelectItem>
            <SelectItem value="global">Global</SelectItem>
            {courseOptions.map(([id, title]) => (
              <SelectItem key={id} value={id}>{title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <SkeletonList rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Megaphone className="h-8 w-8" />} title="No announcements" description="No announcements match your filters." />
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => {
            const isExpanded = expanded.has(ann.id);
            return (
              <Card key={ann.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{ann.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {ann.author && <span>{ann.author.full_name}</span>}
                        <span>{ann.course_id ? 'Course-specific' : 'Global'}</span>
                        <span>{formatDate(ann.sent_at || ann.created_at)}</span>
                      </div>
                    </div>
                    {ann.body && ann.body.replace(/<[^>]*>/g, '').length > 200 && (
                      <Button variant="ghost" size="sm" onClick={() => toggleExpand(ann.id)} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <div className={`mt-3 text-sm text-foreground/80 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}
                    dangerouslySetInnerHTML={{ __html: ann.body || '' }}
                  />
                  {!isExpanded && ann.body && ann.body.replace(/<[^>]*>/g, '').length > 200 && (
                    <button onClick={() => toggleExpand(ann.id)} className="mt-2 text-sm text-primary hover:underline">
                      Read more
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
