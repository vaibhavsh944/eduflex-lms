import { create } from 'zustand'
import type { LivePoll, HandRaiseEvent } from '@/lib/types'

interface LiveSessionStore {
  sessionId: string | null
  isHost: boolean
  pollQueue: LivePoll[]
  handRaiseQueue: HandRaiseEvent[]
  activePoll: LivePoll | null
  setSession: (sessionId: string, isHost: boolean) => void
  setActivePoll: (poll: LivePoll | null) => void
  addHandRaise: (event: HandRaiseEvent) => void
  removeHandRaise: (userId: string) => void
  clearQueue: () => void
  reset: () => void
}

export const useLiveSessionStore = create<LiveSessionStore>((set) => ({
  sessionId: null,
  isHost: false,
  pollQueue: [],
  handRaiseQueue: [],
  activePoll: null,
  setSession: (sessionId, isHost) => set({ sessionId, isHost }),
  setActivePoll: (poll) => set({ activePoll: poll }),
  addHandRaise: (event) =>
    set((s) => ({ handRaiseQueue: [...s.handRaiseQueue.filter((h) => h.user_id !== event.user_id), event] })),
  removeHandRaise: (userId) =>
    set((s) => ({ handRaiseQueue: s.handRaiseQueue.filter((h) => h.user_id !== userId) })),
  clearQueue: () => set({ handRaiseQueue: [] }),
  reset: () => set({ sessionId: null, isHost: false, pollQueue: [], handRaiseQueue: [], activePoll: null }),
}))
