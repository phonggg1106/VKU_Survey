import { Network } from '@capacitor/network';
import { getPendingSurveyDrafts, updateSurveyStatus, getPendingCount } from './db';
import { SurveyDraft, SyncLog } from '../types/survey';

/**
 * ============================================================================
 * OFFLINE BACKGROUND SYNC ENGINE
 * ============================================================================
 * Monitors global network status and automatically syncs pending items whenever
 * internet connectivity is re-established.
 */

// Event listener subscribers for sync progress and queue updates
type SyncListener = (isSyncing: boolean, pendingCount: number) => void;
type LogListener = (log: SyncLog) => void;

const syncListeners: Set<SyncListener> = new Set();
const logListeners: Set<LogListener> = new Set();

let isSyncInProgress = false;
let autoSyncInitialized = false;

/**
 * Subscribe to sync state changes.
 */
export function subscribeSyncState(listener: SyncListener): () => void {
  syncListeners.add(listener);
  // Immediate trigger with current state
  getPendingCount().then((count) => listener(isSyncInProgress, count));
  return () => syncListeners.delete(listener);
}

/**
 * Subscribe to sync activity log feed.
 */
export function subscribeSyncLogs(listener: LogListener): () => void {
  logListeners.add(listener);
  return () => logListeners.delete(listener);
}

function notifyListeners(count: number): void {
  syncListeners.forEach((fn) => fn(isSyncInProgress, count));
}

function addLog(message: string, type: SyncLog['type'] = 'info', surveyId?: string): void {
  const log: SyncLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    message,
    type,
    surveyId
  };
  logListeners.forEach((fn) => fn(log));
}

/**
 * Mock Network Endpoint to simulate posting a survey to the VKU Server.
 */
async function mockUploadSurveyApi(survey: SurveyDraft): Promise<{ success: boolean; id: string }> {
  console.log(`[SYNC SERVICE] Uploading survey record [${survey.id}] to VKU Server...`, {
    building: survey.building,
    room: survey.roomNumber,
    category: survey.category,
    defectNotes: survey.defectNotes,
    hasPhoto: Boolean(survey.photoUrl)
  });

  // Simulate network latency (800ms - 1500ms)
  const delay = Math.floor(Math.random() * 700) + 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 95% simulated success rate
  if (Math.random() > 0.05) {
    console.log(`[SYNC SERVICE] ✅ Successfully synced survey [${survey.id}] with VKU Server.`);
    return { success: true, id: survey.id };
  } else {
    throw new Error('Simulated server timeout / gateway response error');
  }
}

/**
 * Primary dispatch function to process all pending surveys sequentially.
 */
export async function syncPendingSurveys(): Promise<{ synced: number; failed: number }> {
  if (isSyncInProgress) {
    console.log('[SYNC SERVICE] Sync operation is already running. Skipping concurrent trigger.');
    const count = await getPendingCount();
    notifyListeners(count);
    return { synced: 0, failed: 0 };
  }

  const pendingSurveys = await getPendingSurveyDrafts();
  if (pendingSurveys.length === 0) {
    console.log('[SYNC SERVICE] No pending surveys to synchronize.');
    addLog('Sync engine ran: Queue is clean (0 items).', 'info');
    const count = await getPendingCount();
    notifyListeners(count);
    return { synced: 0, failed: 0 };
  }

  isSyncInProgress = true;
  addLog(`Starting background sync for ${pendingSurveys.length} pending survey(s)...`, 'info');
  notifyListeners(pendingSurveys.length);

  let syncedCount = 0;
  let failedCount = 0;

  for (const survey of pendingSurveys) {
    try {
      // Mark local item as SYNCING
      await updateSurveyStatus(survey.id, 'SYNCING');
      addLog(`Syncing survey for ${survey.building} (${survey.roomNumber})...`, 'info', survey.id);

      // Perform simulated API upload call
      await mockUploadSurveyApi(survey);

      // Update local item as SYNCED
      await updateSurveyStatus(survey.id, 'SYNCED');
      syncedCount++;
      addLog(`Successfully uploaded survey #${survey.id.substring(0, 6)}!`, 'success', survey.id);

    } catch (err: any) {
      console.error(`[SYNC SERVICE] ❌ Failed to sync survey ${survey.id}:`, err);
      // Revert status back to PENDING_SYNC for retry
      await updateSurveyStatus(survey.id, 'PENDING_SYNC');
      failedCount++;
      addLog(`Failed to upload ${survey.roomNumber}: ${err.message || 'Network error'}`, 'error', survey.id);
    }
  }

  isSyncInProgress = false;
  const remainingCount = await getPendingCount();
  notifyListeners(remainingCount);

  addLog(
    `Sync completed! ${syncedCount} uploaded successfully, ${failedCount} remaining in queue.`,
    syncedCount > 0 ? 'success' : 'warning'
  );

  return { synced: syncedCount, failed: failedCount };
}

/**
 * Initialize automatic sync engine listeners for network changes.
 * Uses Capacitor Network plugin when available, with browser fallback.
 */
export function initAutoSyncEngine(): () => void {
  if (autoSyncInitialized) {
    return () => {};
  }
  autoSyncInitialized = true;

  console.log('[SYNC SERVICE] Initializing auto-sync engine...');

  // Setup Capacitor Network state change listener
  let networkListenerHandle: any = null;

  try {
    Network.addListener('networkStatusChange', async (status) => {
      console.log(`[SYNC SERVICE] Network status changed: connected=${status.connected}, type=${status.connectionType}`);
      if (status.connected) {
        addLog('Connection restored! Triggering auto-sync...', 'info');
        await syncPendingSurveys();
      } else {
        addLog('Connection lost. Switching to Offline Mode.', 'warning');
      }
    }).then((handle) => {
      networkListenerHandle = handle;
    });
  } catch (err) {
    console.warn('[SYNC SERVICE] Native Capacitor Network listener not available, using Web fallback.', err);
  }

  // Web Browser Standard Online Event Listener Fallback
  const handleWebOnline = async () => {
    console.log('[SYNC SERVICE] Web browser online event detected.');
    addLog('Browser network reconnected. Triggering auto-sync...', 'info');
    await syncPendingSurveys();
  };

  const handleWebOffline = () => {
    console.log('[SYNC SERVICE] Web browser offline event detected.');
    addLog('Browser network offline.', 'warning');
  };

  window.addEventListener('online', handleWebOnline);
  window.addEventListener('offline', handleWebOffline);

  // Initial check on initialization if online
  Network.getStatus().then(async (status) => {
    if (status.connected) {
      const count = await getPendingCount();
      if (count > 0) {
        console.log(`[SYNC SERVICE] Initial connection active with ${count} pending surveys. Syncing...`);
        syncPendingSurveys();
      }
    }
  }).catch(() => {
    if (navigator.onLine) {
      getPendingCount().then((count) => {
        if (count > 0) syncPendingSurveys();
      });
    }
  });

  return () => {
    if (networkListenerHandle && typeof networkListenerHandle.remove === 'function') {
      networkListenerHandle.remove();
    }
    window.removeEventListener('online', handleWebOnline);
    window.removeEventListener('offline', handleWebOffline);
    autoSyncInitialized = false;
  };
}
