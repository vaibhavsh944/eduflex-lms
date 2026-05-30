import { create } from 'zustand'
import type { Badge, UserStreak } from '@/lib/types'

interface GamificationStore {
  userStreak: UserStreak | null
  totalPoints: number
  recentBadges: Badge[]
  showBadgeCelebration: boolean
  setStreak: (streak: UserStreak) => void
  setTotalPoints: (n: number) => void
  addRecentBadge: (badge: Badge) => void
  clearRecentBadges: () => void
  setShowBadgeCelebration: (v: boolean) => void
}

export const useGamificationStore = create<GamificationStore>((set) => ({
  userStreak: null,
  totalPoints: 0,
  recentBadges: [],
  showBadgeCelebration: false,
  setStreak: (streak) => set({ userStreak: streak }),
  setTotalPoints: (n) => set({ totalPoints: n }),
  addRecentBadge: (badge) => set((s) => ({ recentBadges: [...s.recentBadges, badge], showBadgeCelebration: true })),
  clearRecentBadges: () => set({ recentBadges: [], showBadgeCelebration: false }),
  setShowBadgeCelebration: (v) => set({ showBadgeCelebration: v }),
}))
