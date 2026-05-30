import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { subscribeToAuthChanges, getCurrentProfile } from '@/lib/supabase';
import { bootstrapStreakOnLogin } from '@/lib/streakBootstrap';

export function useAuthBootstrap() {
  const setUser = useAuthStore(s => s.setUser);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    const { data: { subscription } } = subscribeToAuthChanges((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = (session as { user?: { id: string } })?.user;
        if (user) {
          getCurrentProfile(user.id).then(profile => {
            if (profile) setUser(profile);
          }).catch(() => {});
        }
        bootstrapStreakOnLogin();
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [setUser, logout]);
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, logout: storeLogout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: storeLogout,
    isStudent: user?.role === 'student',
    isInstructor: user?.role === 'instructor',
    isAdmin: user?.role === 'admin',
  };
}

export function useRequiredAuth() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  return { isAuthenticated, isLoading, user };
}