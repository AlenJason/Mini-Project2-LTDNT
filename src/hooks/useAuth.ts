import { useEffect, useState } from 'react';
import type { PluginListenerHandle } from '@capacitor/core';
import type { User } from '@capacitor-firebase/authentication';
import { authAvailable, getCurrentUser, onAuthStateChanged } from '../services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
  configured: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = authAvailable();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    let handle: PluginListenerHandle | undefined;
    let cancelled = false;

    getCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    onAuthStateChanged((u) => setUser(u)).then((h) => {
      handle = h;
    });

    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, [configured]);

  return { user, loading, configured };
}
