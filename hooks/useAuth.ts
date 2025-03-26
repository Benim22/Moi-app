import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/user-store';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const { setSession, refreshProfile } = useUserStore();

  useEffect(() => {
    // Check for active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        refreshProfile();
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          refreshProfile();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return useUserStore();
}