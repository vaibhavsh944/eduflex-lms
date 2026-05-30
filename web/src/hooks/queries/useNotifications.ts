import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AppNotification } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useEffect } from 'react';

export function useNotifications() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const setPreviewNotifications = useNotificationStore((state) => state.setPreviewNotifications);

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async (): Promise<AppNotification[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const actorIds = data.filter(n => n.actor_id).map(n => n.actor_id)
        let actorMap = new Map<string, any>()
        if (actorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', actorIds)
          if (profiles) {
            for (const p of profiles) actorMap.set(p.id, p)
          }
        }
        return data.map(n => ({ ...n, actor: n.actor_id ? actorMap.get(n.actor_id) ?? null : null }))
      }

      return data ?? []
    },
    enabled: !!userId,
  });

  const notifications = query.data ?? []
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read_at).length)
    setPreviewNotifications(notifications.slice(0, 5))
  }, [notifications, setUnreadCount, setPreviewNotifications])

  return query;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const markAllPreviewRead = useNotificationStore((state) => state.markAllPreviewRead);

  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      markAllPreviewRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
