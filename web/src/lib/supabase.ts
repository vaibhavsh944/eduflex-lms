import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  );
}

const FETCH_TIMEOUT = 300000
let selfClearingAuth = false

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'eduflow-supabase-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-app-version': '2.0.0',
    },
    fetch: (url, options) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
      const originalSignal = options?.signal
      if (originalSignal) {
        originalSignal.addEventListener('abort', () => controller.abort())
      }
      return fetch(url, { ...options, signal: controller.signal })
        .then(async (res) => {
          if (res.status === 401 && !selfClearingAuth && !url.toString().includes('/functions/v1/')) {
            selfClearingAuth = true
            try {
              await supabase.auth.signOut({ scope: 'local' })
            } finally {
              selfClearingAuth = false
            }
          }
          return res
        })
        .finally(() => clearTimeout(timeout))
    },
  },
});

export async function getCurrentProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, metadata: Record<string, unknown>) {
  return await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
}

export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function resetPasswordForEmail(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function updatePassword(newPassword: string) {
  return await supabase.auth.updateUser({ password: newPassword });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getSession() {
  return await supabase.auth.getSession();
}

export function subscribeToAuthChanges(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
