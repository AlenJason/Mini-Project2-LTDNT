export type SyncStatus = 'pending' | 'synced';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SurveyInput {
  title: string;
  surveyor: string;
  location: string;
  notes: string;
  photoDataUrl?: string;
  coordinates?: Coordinates;
}

export interface Survey extends SurveyInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}
