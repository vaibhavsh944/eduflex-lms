import { create } from 'zustand';

interface AdminStore {
  impersonating: { userId: string; name: string } | null;
  startImpersonation: (userId: string, name: string) => void;
  endImpersonation: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  impersonating: null,
  startImpersonation: (userId, name) => set({ impersonating: { userId, name } }),
  endImpersonation: () => set({ impersonating: null }),
}));
