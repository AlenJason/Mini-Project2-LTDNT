import { useEffect, useState } from 'react';
import type { PluginListenerHandle } from '@capacitor/core';
import { isOnline, onNetworkChange } from '../services/network';

export function useNetworkStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let handle: PluginListenerHandle | undefined;
    let cancelled = false;

    isOnline().then((status) => {
      if (!cancelled) setOnline(status);
    });

    onNetworkChange((connected) => setOnline(connected)).then((h) => {
      handle = h;
    });

    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, []);

  return online;
}
