import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Certificate } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';

export function useCertificates(userId?: string) {
  const currentUserId = useAuthStore(state => state.user?.id);
  const targetId = userId || currentUserId;

  return useQuery({
    queryKey: ['certificates', targetId],
    queryFn: async () => {
      if (!targetId) return [];

      const { data, error } = await supabase
        .from('certificates')
        .select('*, course:courses(title, thumbnail_url)')
        .eq('user_id', targetId)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!targetId
  });
}

export function useGenerateCertificate() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore(state => state.user?.id);

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!currentUserId) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('certs/generate', {
        body: { user_id: currentUserId, course_id: courseId }
      });

      if (error) throw error;
      return data as Certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates', currentUserId] });
    }
  });
}
