import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { DirectMessage } from '@/lib/types';
import { toast } from 'sonner';

export function useMessageRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // Listen to new messages.
    // Note: If RLS is configured for Realtime, the server filters rows the user can't see.
    const channel = supabase.channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMessage = payload.new as DirectMessage;
          
          // Don't notify if we sent it (local cache already updated)
          if (newMessage.sender_id === user.id) return;

          // Fetch sender info for toast and cache
          const { data: senderData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          if (senderData) {
            newMessage.sender = senderData;
            
            // Invalidate/Update queries
            queryClient.setQueryData(['messages', newMessage.thread_id], (oldData: DirectMessage[] | undefined) => {
              if (!oldData) return [newMessage];
              // check for duplicates
              if (oldData.find(m => m.id === newMessage.id)) return oldData;
              return [...oldData, newMessage];
            });

            queryClient.invalidateQueries({ queryKey: ['messageThreads'] });

            // Show toast if they are not currently viewing the thread
            toast(`New message from ${senderData.full_name}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
