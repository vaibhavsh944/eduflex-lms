import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useLessonProgressRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('lesson-progress-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const record = payload.new as any;
          queryClient.invalidateQueries({ queryKey: ['course-player'] });
          queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
          queryClient.invalidateQueries({ queryKey: ['lesson-progress', user.id] });
          queryClient.invalidateQueries({ queryKey: ['dashboard', user.id] });
          queryClient.invalidateQueries({ queryKey: ['progress-analytics', user.id] });
          queryClient.invalidateQueries({ queryKey: ['points', user.id] });
          queryClient.invalidateQueries({ queryKey: ['streak', user.id] });
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
