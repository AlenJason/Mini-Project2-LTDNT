import { useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncPendingSurveys } from '../services/syncService';

/**
 * Tries to sync pending surveys whenever the app is online
 * (on mount, and again every time connectivity comes back).
 */
export function useAutoSync(onSynced?: () => void): boolean {
  const online = useNetworkStatus();

  useEffect(() => {
    if (!online) return;
    syncPendingSurveys().then((result) => {
      if (result.synced > 0) onSynced?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  return online;
}
