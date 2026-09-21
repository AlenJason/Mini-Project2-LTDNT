import { getAllSurveys, markSynced } from './storage';
import type { Survey } from '../types/survey';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export interface SyncResult {
  synced: number;
  failed: number;
}

async function pushSurvey(survey: Survey): Promise<void> {
  const res = await fetch(`${API_BASE}/surveys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(survey),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function deleteRemoteSurvey(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/surveys/${id}`, { method: 'DELETE' });
  } catch {
    // Best-effort: the local record is already gone; if we're offline the
    // remote copy (if any) will just be stale until it's cleaned up manually.
  }
}

export async function syncPendingSurveys(): Promise<SyncResult> {
  const pending = (await getAllSurveys()).filter((s) => s.syncStatus === 'pending');

  let synced = 0;
  let failed = 0;
  for (const survey of pending) {
    try {
      await pushSurvey(survey);
      await markSynced(survey.id);
      synced++;
    } catch {
      failed++;
    }
  }
  return { synced, failed };
}
