import { create } from 'zustand'

type ThreadTab = 'all' | 'pinned' | 'unanswered' | 'my-posts'
type ThreadSort = 'newest' | 'upvotes' | 'replies'

interface ForumStore {
  activeThreadId: string | null
  threadFilters: { tab: ThreadTab; sort: ThreadSort }
  replyingToId: string | null
  setActiveThread: (id: string | null) => void
  setThreadFilters: (f: Partial<ForumStore['threadFilters']>) => void
  setReplyingTo: (id: string | null) => void
}

export const useForumStore = create<ForumStore>((set) => ({
  activeThreadId: null,
  threadFilters: { tab: 'all', sort: 'newest' },
  replyingToId: null,
  setActiveThread: (id) => set({ activeThreadId: id }),
  setThreadFilters: (f) => set((s) => ({ threadFilters: { ...s.threadFilters, ...f } })),
  setReplyingTo: (id) => set({ replyingToId: id }),
}))
