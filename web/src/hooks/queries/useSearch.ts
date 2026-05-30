import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SearchResults } from '@/lib/types';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResults> => {
      if (!query || query.trim().length < 2) {
        return { courses: [], lessons: [], users: [], total: 0 };
      }

      const searchTerm = `%${query.trim()}%`;

      const [coursesRes, lessonsRes, usersRes] = await Promise.all([
        supabase
          .from('courses')
          .select('id, title, description, thumbnail_url')
          .ilike('title', searchTerm)
          .limit(5),
        supabase
          .from('lessons')
          .select('id, title, course_id, courses!inner(id, title)')
          .ilike('title', searchTerm)
          .limit(5),
        supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .ilike('full_name', searchTerm)
          .limit(5)
      ]);

      const courses = (coursesRes.data || []).map(c => ({
        type: 'course' as const,
        id: c.id,
        title: c.title,
        subtitle: (c.description || '').substring(0, 50) || 'Course',
        url: `/catalog/${c.id}`,
        thumbnail_url: c.thumbnail_url
      }));

      const lessons = (lessonsRes.data || []).map(l => ({
        type: 'lesson' as const,
        id: l.id,
        title: l.title,
        subtitle: (l.courses as { title: string } | null)?.title || 'Unknown Course',
        url: `/learn/${(l.courses as { id: string } | null)?.id}/lesson/${l.id}`,
        thumbnail_url: null
      }));

      const users = (usersRes.data || []).map(u => ({
        type: 'user' as const,
        id: u.id,
        title: u.full_name,
        subtitle: u.role === 'student' ? 'Student' : u.role === 'instructor' ? 'Instructor' : 'Admin',
        url: `/profile/${u.id}`,
        thumbnail_url: u.avatar_url
      }));

      return {
        courses,
        lessons,
        users,
        total: courses.length + lessons.length + users.length
      };
    },
    enabled: query.trim().length >= 2,
  });
}
