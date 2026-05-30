import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { AppNotification } from '@/lib/types';
import { useNotificationStore } from '@/store/notificationStore';
import { toast } from 'sonner';

export function useNotificationRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const prependNotification = useNotificationStore(state => state.prependNotification);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const newNotif = payload.new as AppNotification;
          
          // Fetch actor info if present
          if (newNotif.actor_id) {
            const { data: actorData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', newNotif.actor_id)
              .single();
            if (actorData) {
              newNotif.actor = actorData;
            }
          }

          // Update store for the bell icon
          prependNotification(newNotif);

          // Invalidate query to update the Notifications page if open
          queryClient.invalidateQueries({ queryKey: ['notifications'] });

          // Show a toast
          toast(newNotif.title, { description: newNotif.body });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, prependNotification]);
}
