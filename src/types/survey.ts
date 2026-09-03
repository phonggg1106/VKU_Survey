/**
 * Types & Interfaces for VKU Field Survey System
 */

export type SyncStatus = 'PENDING_SYNC' | 'SYNCING' | 'SYNCED';

export type CategoryType = 
  | 'Hardware'
  | 'Projector'
  | 'Air Conditioner'
  | 'Network / IT'
  | 'Furniture'
  | 'Lighting & Electrical'
  | 'Other';

export type BuildingType = 
  | 'Building A'
  | 'Building B'
  | 'Building C'
  | 'Building V'
  | 'Central Library'
  | 'Admin Building'
  | 'Dormitory Complex';

export interface SurveyDraft {
  id: string; // UUID v4
  timestamp: number; // UNIX Epoch timestamp (ms)
  createdAt: string; // Formatted date string
  building: string;
  floor: string;
  roomNumber: string;
  category: CategoryType;
  rating: number; // 1 to 5 rating
  defectNotes: string;
  photoUrl?: string; // Base64 data URL
  status: SyncStatus;
  syncedAt?: number;
  inspectorName?: string;
}

export interface SyncLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  surveyId?: string;
}
