import { supabase } from './supabase'
import { useAuthStore } from '@/store/authStore'

export function bootstrapStreakOnLogin() {
  const user = useAuthStore.getState().user
  if (!user) return

  // Only call edge function if not in dev mode to avoid CORS noise
  if (import.meta.env.DEV) return

  supabase.functions.invoke('gamification/update-streak', {
    body: { user_id: user.id },
  }).catch(() => {
    // Silent fail - streak update is non-critical
  })
}
