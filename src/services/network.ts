import { Network } from '@capacitor/network';
import type { PluginListenerHandle } from '@capacitor/core';

export async function isOnline(): Promise<boolean> {
  const status = await Network.getStatus();
  return status.connected;
}

export function onNetworkChange(
  callback: (connected: boolean) => void,
): Promise<PluginListenerHandle> {
  return Network.addListener('networkStatusChange', (status) => callback(status.connected));
}
