import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProfileExtended } from '@/lib/types';
import { toast } from 'sonner';

type UpdateProfileData = Partial<Omit<ProfileExtended, 'id' | 'created_at' | 'updated_at' | 'email' | 'role'>>;

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateProfileData }) => {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return updatedProfile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['currentProfile', data.id], data);
      queryClient.setQueryData(['profile', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    },
  });
}
