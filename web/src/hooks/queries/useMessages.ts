import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { MessageThread, DirectMessage } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import { useEffect } from 'react';

type ThreadRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  last_message_at: string;
  last_message_preview: string | null;
  user_a_read_at: string | null;
  user_b_read_at: string | null;
  created_at: string;
  user_a: { id: string; full_name: string; avatar_url: string | null; role: string; last_seen_at: string | null };
  user_b: { id: string; full_name: string; avatar_url: string | null; role: string; last_seen_at: string | null };
};

export function useMessageThreads() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const setUnreadForThread = useMessageStore((state) => state.setUnreadForThread);

  const query = useQuery({
    queryKey: ['messageThreads', userId],
    queryFn: async (): Promise<MessageThread[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          user_a:profiles!message_threads_user_a_id_fkey(id, full_name, avatar_url, role, last_seen_at),
          user_b:profiles!message_threads_user_b_id_fkey(id, full_name, avatar_url, role, last_seen_at)
        `)
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      return (data as ThreadRow[]).map((thread) => {
        const isUserA = thread.user_a_id === userId;
        const otherUser = isUserA ? thread.user_b : thread.user_a;
        const myReadAt = isUserA ? thread.user_a_read_at : thread.user_b_read_at;
        const hasUnread = !myReadAt || new Date(thread.last_message_at) > new Date(myReadAt);

        return {
          id: thread.id,
          user_a_id: thread.user_a_id,
          user_b_id: thread.user_b_id,
          last_message_at: thread.last_message_at,
          last_message_preview: thread.last_message_preview,
          user_a_read_at: thread.user_a_read_at,
          user_b_read_at: thread.user_b_read_at,
          created_at: thread.created_at,
          other_user: otherUser,
          has_unread: hasUnread,
        };
      });
    },
    enabled: !!userId,
  });

  const threads = query.data ?? []
  useEffect(() => {
    for (const t of threads) {
      if (t.has_unread) setUnreadForThread(t.id, 1)
    }
  }, [threads, setUnreadForThread])

  return query;
}

export function useThreadMessages(threadId: string | null) {
  return useQuery({
    queryKey: ['messages', threadId],
    queryFn: async (): Promise<DirectMessage[]> => {
      if (!threadId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          thread_id,
          sender_id,
          body,
          file_url,
          file_name,
          is_deleted,
          sent_at,
          sender:profiles(id, full_name, avatar_url)
        `)
        .eq('thread_id', threadId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!threadId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ threadId, body }: { threadId: string; body: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          body,
        })
        .select(`*, sender:profiles(id, full_name, avatar_url)`)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newMessage, { threadId }) => {
      queryClient.setQueryData(['messages', threadId], (oldData: DirectMessage[] | undefined) => {
        if (!oldData) return [newMessage];
        return [...oldData, newMessage];
      });
      // Optionally invalidate threads to update preview/timestamp
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
    },
  });
}

export function useMarkThreadRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const clearUnreadForThread = useMessageStore((state) => state.clearUnreadForThread);

  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!user) return;
      
      // Determine if user is A or B to update correct column
      const { data: thread } = await supabase
        .from('message_threads')
        .select('user_a_id')
        .eq('id', threadId)
        .single();
        
      if (!thread) return;
      
      const isUserA = thread.user_a_id === user.id;
      const updateData = isUserA 
        ? { user_a_read_at: new Date().toISOString() } 
        : { user_b_read_at: new Date().toISOString() };

      const { error } = await supabase
        .from('message_threads')
        .update(updateData)
        .eq('id', threadId);

      if (error) throw error;
    },
    onSuccess: (_, threadId) => {
      clearUnreadForThread(threadId);
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
    },
  });
}

export function useStartThread() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('message_threads')
        .insert({
          user_a_id: user.id,
          user_b_id: targetUserId,
        })
        .select()
        .single();

      if (error) {
        // If constraint violation (already exists), we should fetch the existing thread
        if (error.code === '23505') {
          const { data: existing } = await supabase
            .from('message_threads')
            .select('*')
            .or(`and(user_a_id.eq.${user.id},user_b_id.eq.${targetUserId}),and(user_a_id.eq.${targetUserId},user_b_id.eq.${user.id})`)
            .single();
          return existing;
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
    },
  });
}
