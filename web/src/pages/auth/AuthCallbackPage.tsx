import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentProfile } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const completedRef = useRef(false)

  useEffect(() => {
    if (completedRef.current) return
    completedRef.current = true

    const handleSignIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }
      const profile = await getCurrentProfile(session.user.id);
      if (!profile) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }
      setUser(profile);
      const attemptedRole = sessionStorage.getItem('eduflow-selected-role');
      sessionStorage.removeItem('eduflow-selected-role');
      if (attemptedRole && profile.role !== attemptedRole && profile.role !== 'admin') {
        navigate(`${ROUTES.LOGIN}?error=wrong-role&role=${profile.role}`, { replace: true });
        return;
      }
      const role = profile.role;
      if (role === 'admin') navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      else if (role === 'instructor') navigate(ROUTES.INSTRUCTOR_DASHBOARD, { replace: true });
      else navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
    };

    // Supabase auto-detects session from URL (detectSessionInUrl: true),
    // so by the time this runs the session should already be in storage.
    // If not, wait for the SIGNED_IN event.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSignIn();
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_IN') {
            subscription.unsubscribe();
            handleSignIn();
          }
        });
        setTimeout(() => {
          subscription.unsubscribe();
          navigate(ROUTES.LOGIN, { replace: true });
        }, 15000);
      }
    });
  }, [navigate, setUser]);

  return <div className="flex h-screen items-center justify-center">Completing sign in...</div>;
}
