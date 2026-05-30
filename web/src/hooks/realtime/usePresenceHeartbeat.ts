import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function usePresenceHeartbeat() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const ping = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', user.id);
      } catch (error) {
        console.error('Heartbeat ping failed:', error);
      }
    };

    // Initial ping
    ping();

    // Recurring ping
    const intervalId = setInterval(ping, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [user]);
}
