import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

export function SearchPage() {
  const [query, setQuery] = useState('');

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return []
      const { data } = await supabase
        .from('courses')
        .select('id, title, slug, thumbnail_url, category, price, price_type')
        .ilike('title', `%${query}%`)
        .eq('status', 'published')
        .limit(20)
      return data ?? []
    },
    enabled: query.length > 0,
  })

  return (
    <div>
      <PageHeader title="Search" description="Search for courses, users, and more" />
      <div className="mb-6"><Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-md" /></div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(results ?? []).map(course => (
            <Link key={course.id} to={ROUTES.COURSE_DETAIL(course.id)}>
              <Card className="overflow-hidden">
                <img src={course.thumbnail_url ?? ''} alt={course.title} className="h-40 w-full object-cover" />
                <CardContent className="p-4"><h3 className="font-semibold">{course.title}</h3><p className="text-sm text-muted-foreground">{course.category}</p></CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {query && (results ?? []).length === 0 && !isLoading && <p className="text-muted-foreground">No results found.</p>}
    </div>
  );
}
