import { Preferences } from '@capacitor/preferences';
import type { Survey, SurveyInput } from '../types/survey';

const STORAGE_KEY = 'field_surveys';

async function readAll(): Promise<Survey[]> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  return value ? (JSON.parse(value) as Survey[]) : [];
}

async function writeAll(surveys: Survey[]): Promise<void> {
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(surveys) });
}

export async function getAllSurveys(): Promise<Survey[]> {
  const surveys = await readAll();
  return surveys.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSurvey(id: string): Promise<Survey | undefined> {
  const surveys = await readAll();
  return surveys.find((s) => s.id === id);
}

export async function createSurvey(input: SurveyInput): Promise<Survey> {
  const surveys = await readAll();
  const now = new Date().toISOString();
  const survey: Survey = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  };
  surveys.push(survey);
  await writeAll(surveys);
  return survey;
}

export async function updateSurvey(id: string, input: SurveyInput): Promise<Survey | undefined> {
  const surveys = await readAll();
  const index = surveys.findIndex((s) => s.id === id);
  if (index === -1) return undefined;

  const updated: Survey = {
    ...surveys[index],
    ...input,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };
  surveys[index] = updated;
  await writeAll(surveys);
  return updated;
}

export async function deleteSurvey(id: string): Promise<void> {
  const surveys = await readAll();
  await writeAll(surveys.filter((s) => s.id !== id));
}

export async function markSynced(id: string): Promise<void> {
  const surveys = await readAll();
  const index = surveys.findIndex((s) => s.id === id);
  if (index === -1) return;
  surveys[index] = { ...surveys[index], syncStatus: 'synced' };
  await writeAll(surveys);
}

export async function countPending(): Promise<number> {
  const surveys = await readAll();
  return surveys.filter((s) => s.syncStatus === 'pending').length;
}
