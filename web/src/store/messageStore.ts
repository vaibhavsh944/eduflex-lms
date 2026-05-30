import { create } from 'zustand';

interface MessageState {
  activeThreadId: string | null;
  unreadPerThread: Record<string, number>;
  totalUnread: number;
  onlineStatus: Record<string, string>; // userId -> last_seen_at ISO string
  setActiveThread: (id: string | null) => void;
  setUnreadForThread: (threadId: string, count: number) => void;
  incrementUnreadForThread: (threadId: string) => void;
  clearUnreadForThread: (threadId: string) => void;
  setOnlineStatus: (userId: string, lastSeenAt: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  activeThreadId: null,
  unreadPerThread: {},
  totalUnread: 0,
  onlineStatus: {},
  
  setActiveThread: (id) => set({ activeThreadId: id }),
  
  setUnreadForThread: (threadId, count) => set((state) => {
    const newUnread = { ...state.unreadPerThread, [threadId]: count };
    const total = Object.values(newUnread).reduce((acc, val) => acc + val, 0);
    return { unreadPerThread: newUnread, totalUnread: total };
  }),
  
  incrementUnreadForThread: (threadId) => set((state) => {
    const current = state.unreadPerThread[threadId] || 0;
    const newUnread = { ...state.unreadPerThread, [threadId]: current + 1 };
    const total = Object.values(newUnread).reduce((acc, val) => acc + val, 0);
    return { unreadPerThread: newUnread, totalUnread: total };
  }),
  
  clearUnreadForThread: (threadId) => set((state) => {
    const newUnread = { ...state.unreadPerThread, [threadId]: 0 };
    const total = Object.values(newUnread).reduce((acc, val) => acc + val, 0);
    return { unreadPerThread: newUnread, totalUnread: total };
  }),
  
  setOnlineStatus: (userId, lastSeenAt) => set((state) => ({
    onlineStatus: { ...state.onlineStatus, [userId]: lastSeenAt }
  })),
}));
