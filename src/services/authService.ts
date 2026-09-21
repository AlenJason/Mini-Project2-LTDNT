import {
  FirebaseAuthentication,
  type User,
} from '@capacitor-firebase/authentication';
import type { PluginListenerHandle } from '@capacitor/core';
import { isFirebaseConfigured } from './firebase';

export type { User };

export function authAvailable(): boolean {
  return isFirebaseConfigured;
}

export async function signInWithGoogle(): Promise<User | null> {
  const result = await FirebaseAuthentication.signInWithGoogle();
  return result.user;
}

export async function signOut(): Promise<void> {
  await FirebaseAuthentication.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const result = await FirebaseAuthentication.getCurrentUser();
  return result.user;
}

export function onAuthStateChanged(
  callback: (user: User | null) => void,
): Promise<PluginListenerHandle> {
  return FirebaseAuthentication.addListener('authStateChange', (change) => callback(change.user));
}
