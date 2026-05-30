import { create } from 'zustand';
import type { AppNotification } from '@/lib/types';

interface NotificationState {
  unreadCount: number;
  previewNotifications: AppNotification[];
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  setPreviewNotifications: (notifications: AppNotification[]) => void;
  prependNotification: (notification: AppNotification) => void;
  markPreviewRead: (id: string) => void;
  markAllPreviewRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  previewNotifications: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  setPreviewNotifications: (notifications) => set({ previewNotifications: notifications }),
  prependNotification: (notification) => set((state) => ({
    previewNotifications: [notification, ...state.previewNotifications].slice(0, 5),
    unreadCount: state.unreadCount + 1
  })),
  markPreviewRead: (id) => set((state) => ({
    previewNotifications: state.previewNotifications.map(n => 
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  markAllPreviewRead: () => set((state) => ({
    previewNotifications: state.previewNotifications.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })),
    unreadCount: 0
  })),
  clearAll: () => set({ unreadCount: 0, previewNotifications: [] }),
}));