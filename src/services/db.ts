import localforage from 'localforage';
import { SurveyDraft, SyncStatus } from '../types/survey';

/**
 * ============================================================================
 * OFFLINE DATABASE STORAGE SERVICE (IndexedDB Wrapper via LocalForage)
 * ============================================================================
 * LocalForage automatically selects the best available storage driver:
 * 1. IndexedDB (Primary for web / modern mobile browsers)
 * 2. WebSQL (Legacy fallback)
 * 3. localStorage (Synchronous fallback if no DB engine present)
 *
 * This provides reliable asynchronous storage for offline survey submissions,
 * even when internet connectivity is completely lost.
 */

// Initialize LocalForage store instance for VKU Surveys
const surveyStore = localforage.createInstance({
  name: 'VKUFieldSurveyDB',
  storeName: 'survey_drafts',
  description: 'Local storage store for offline field survey records'
});

// Simple helper to generate unique UUIDs v4 without heavy external dependencies
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'vku-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * Save a new survey draft to local IndexedDB.
 * Status is set to 'PENDING_SYNC' by default.
 */
export async function saveSurveyDraft(
  data: Omit<SurveyDraft, 'id' | 'timestamp' | 'createdAt' | 'status'>
): Promise<SurveyDraft> {
  const now = new Date();
  const newSurvey: SurveyDraft = {
    ...data,
    id: generateUUID(),
    timestamp: now.getTime(),
    createdAt: now.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }),
    status: 'PENDING_SYNC'
  };

  // Get current list of survey drafts
  const existingSurveys = (await surveyStore.getItem<SurveyDraft[]>('surveys')) || [];
  
  // Add new survey at the beginning of the array
  const updatedSurveys = [newSurvey, ...existingSurveys];
  
  // Save updated list back to IndexedDB
  await surveyStore.setItem('surveys', updatedSurveys);
  
  return newSurvey;
}

/**
 * Retrieve all survey drafts saved locally.
 */
export async function getAllSurveyDrafts(): Promise<SurveyDraft[]> {
  const surveys = await surveyStore.getItem<SurveyDraft[]>('surveys');
  return surveys || [];
}

/**
 * Retrieve only surveys pending synchronization (`PENDING_SYNC`).
 */
export async function getPendingSurveyDrafts(): Promise<SurveyDraft[]> {
  const surveys = await getAllSurveyDrafts();
  return surveys.filter((s) => s.status === 'PENDING_SYNC');
}

/**
 * Count the total number of items currently waiting to be synced.
 */
export async function getPendingCount(): Promise<number> {
  const pending = await getPendingSurveyDrafts();
  return pending.length;
}

/**
 * Update the sync status of a specific survey.
 */
export async function updateSurveyStatus(id: string, status: SyncStatus): Promise<void> {
  const surveys = await getAllSurveyDrafts();
  const index = surveys.findIndex((s) => s.id === id);
  
  if (index !== -1) {
    surveys[index].status = status;
    if (status === 'SYNCED') {
      surveys[index].syncedAt = Date.now();
    }
    await surveyStore.setItem('surveys', surveys);
  }
}

/**
 * Remove a specific survey record from local storage.
 */
export async function deleteSurveyDraft(id: string): Promise<void> {
  const surveys = await getAllSurveyDrafts();
  const filtered = surveys.filter((s) => s.id !== id);
  await surveyStore.setItem('surveys', filtered);
}

/**
 * Remove all completed (`SYNCED`) surveys to free up device storage.
 */
export async function clearSyncedSurveys(): Promise<number> {
  const surveys = await getAllSurveyDrafts();
  const pendingOnly = surveys.filter((s) => s.status === 'PENDING_SYNC');
  const removedCount = surveys.length - pendingOnly.length;
  await surveyStore.setItem('surveys', pendingOnly);
  return removedCount;
}

/**
 * Debug helper to inject seed sample data for testing offline sync capabilities.
 */
export async function seedSampleData(): Promise<SurveyDraft[]> {
  const samples: Array<Omit<SurveyDraft, 'id' | 'timestamp' | 'createdAt' | 'status'>> = [
    {
      building: 'Building A',
      floor: '3rd Floor',
      roomNumber: 'A-302',
      category: 'Projector',
      rating: 2,
      defectNotes: 'Projector bulb flickering and HDMI signal drops intermittently.',
      inspectorName: 'Dev Inspector'
    },
    {
      building: 'Central Library',
      floor: '1st Floor',
      roomNumber: 'LIB-104',
      category: 'Air Conditioner',
      rating: 1,
      defectNotes: 'AC unit leaking water onto desk 14. Loud mechanical noise.',
      inspectorName: 'Field Agent 02'
    }
  ];

  const created: SurveyDraft[] = [];
  for (const sample of samples) {
    const draft = await saveSurveyDraft(sample);
    created.push(draft);
  }
  return created;
}
