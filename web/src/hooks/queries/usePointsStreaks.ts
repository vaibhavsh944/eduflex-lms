import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { PointsLog, UserStreak } from '@/lib/types'
import { useAuthStore } from '@/store/authStore'

export function usePointsLog(userId?: string) {
  const currentUserId = useAuthStore(state => state.user?.id)
  const targetId = userId || currentUserId

  return useQuery({
    queryKey: ['points', targetId],
    queryFn: async () => {
      if (!targetId) return []
      const { data, error } = await supabase
        .from('user_points_log')
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!targetId,
  })
}

export function useUserStreak(userId?: string) {
  const currentUserId = useAuthStore(state => state.user?.id)
  const targetId = userId || currentUserId

  return useQuery({
    queryKey: ['streak', targetId],
    queryFn: async () => {
      if (!targetId) return null
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', targetId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!targetId,
  })
}

export function useAwardPoints() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore(state => state.user?.id)

  return useMutation({
    mutationFn: async ({ points, reason, referenceId }: { points: number; reason: PointsLog['reason']; referenceId?: string }) => {
      if (!currentUserId) throw new Error('Not authenticated')
      const { error } = await supabase.from('user_points_log').insert({
        user_id: currentUserId,
        points,
        reason,
        reference_id: referenceId || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ['points', currentUserId] })
        queryClient.invalidateQueries({ queryKey: ['profile', currentUserId] })
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      }
    },
  })
}

export function useUpdateStreak() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore(state => state.user?.id)

  return useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('Not authenticated')

      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', currentUserId)
        .single()

      if (!existing) {
        const { error } = await supabase.from('user_streaks').insert({
          user_id: currentUserId,
          current_streak: 1,
          longest_streak: 1,
          last_checkin_date: today,
        })
        if (error) throw error
        return
      }

      if (existing.last_checkin_date === today) return

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const newStreak = existing.last_checkin_date === yesterdayStr
        ? existing.current_streak + 1
        : 1

      const newLongest = Math.max(newStreak, existing.longest_streak)

      const { error } = await supabase
        .from('user_streaks')
        .update({ current_streak: newStreak, longest_streak: newLongest, last_checkin_date: today })
        .eq('user_id', currentUserId)
      if (error) throw error
    },
    onSuccess: () => {
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ['streak', currentUserId] })
      }
    },
  })
}
