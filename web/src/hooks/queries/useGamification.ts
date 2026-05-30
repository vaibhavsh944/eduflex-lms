import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Badge, UserBadge, ProfileExtended } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';

const leaderboardSelect = 'user_id, full_name, avatar_url, role, level, total_points, rank, courses_completed, badges_count'

function mapLeaderboardRow(row: any): ProfileExtended {
  return {
    id: row.user_id,
    full_name: row.full_name ?? '',
    avatar_url: row.avatar_url ?? null,
    role: row.role ?? 'student',
    level: row.level ?? 1,
    total_points: row.total_points ?? 0,
    total_xp: row.total_points ?? 0,
    courses_completed: row.courses_completed ?? 0,
    badges_count: row.badges_count ?? 0,
  } as unknown as ProfileExtended
}

export function useLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_total_points')
        .select(leaderboardSelect)
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(mapLeaderboardRow);
    }
  });
}

export function useLeaderboardByCourse() {
  const currentUserId = useAuthStore(state => state.user?.id);

  return useQuery({
    queryKey: ['leaderboard', 'course', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      // Get the current user's enrolled course IDs
      const { data: myEnrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', currentUserId);

      if (enrollError) throw enrollError;
      if (!myEnrollments?.length) return [];

      const courseIds = myEnrollments.map(e => e.course_id);

      // Get all users enrolled in those same courses
      const { data: peers, error: peersError } = await supabase
        .from('enrollments')
        .select('user_id')
        .in('course_id', courseIds)
        .neq('user_id', currentUserId);

      if (peersError) throw peersError;

      const userIds = [currentUserId, ...new Set((peers || []).map(p => p.user_id))];

      // Fetch leaderboard data for this subset
      const { data, error } = await supabase
        .from('user_total_points')
        .select(leaderboardSelect)
        .in('user_id', userIds)
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []).map(mapLeaderboardRow);
    },
    enabled: !!currentUserId
  });
}

export function useUserBadges(userId?: string) {
  const currentUserId = useAuthStore(state => state.user?.id);
  const targetId = userId || currentUserId;

  return useQuery({
    queryKey: ['badges', targetId],
    queryFn: async () => {
      if (!targetId) return { allBadges: [], userBadges: [] };

      const { data: allBadges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: true });

      if (badgeError) throw badgeError;

      const { data: userBadges, error: userBadgeError } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', targetId);

      if (userBadgeError) throw userBadgeError;

      return {
        allBadges: allBadges,
        userBadges: userBadges
      };
    },
    enabled: !!targetId
  });
}
