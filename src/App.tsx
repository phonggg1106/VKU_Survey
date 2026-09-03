import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { Home } from './components/Home';
import { SurveyForm } from './components/SurveyForm';
import { SurveyList } from './components/SurveyList';
import { SyncManager } from './components/SyncManager';
import { Settings } from './components/Settings';
import { useNetwork } from './hooks/useNetwork';
import { getPendingCount } from './services/db';
import { initAutoSyncEngine, syncPendingSurveys, subscribeSyncState } from './services/sync';

/**
 * ============================================================================
 * VKU FIELD SURVEY MAIN APPLICATION CONTAINER
 * ============================================================================
 * Offline-First Progressive Web App (PWA) wrapped with Capacitor framework.
 * Integrates LocalForage (IndexedDB), Service Worker Cache-First strategy,
 * background sync engine, and native hardware bridges (Camera, Network).
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { isOffline } = useNetwork();

  // Fetch pending items count from IndexedDB
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch (err) {
      console.error('Error fetching pending survey count:', err);
    }
  }, []);

  // Initialize offline background sync engine & status listeners
  useEffect(() => {
    // 1. Initial count check
    updatePendingCount();

    // 2. Start auto-sync network change listener engine
    const cleanupAutoSync = initAutoSyncEngine();

    // 3. Subscribe to sync state changes to keep BottomNav badge counter updated in real-time
    const unsubscribeState = subscribeSyncState((syncing, count) => {
      setIsSyncing(syncing);
      setPendingCount(count);
    });

    return () => {
      cleanupAutoSync();
      unsubscribeState();
    };
  }, [updatePendingCount]);

  // Handle manual sync trigger from Header quick button
  const handleQuickSync = async () => {
    if (isOffline) return;
    try {
      await syncPendingSurveys();
      await updatePendingCount();
    } catch (err) {
      console.error('Manual quick sync failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased">
      
      {/* 1. Sticky Top Navigation Header */}
      <Header
        onSyncClick={handleQuickSync}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
      />

      {/* 2. Main View Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto relative">
        {activeTab === 'home' && (
          <Home
            onNavigate={(tab) => setActiveTab(tab)}
            pendingCount={pendingCount}
            isOffline={isOffline}
          />
        )}

        {activeTab === 'new-survey' && (
          <SurveyForm
            onSurveySubmitted={updatePendingCount}
            isOffline={isOffline}
          />
        )}

        {activeTab === 'surveys' && (
          <SurveyList
            onRefreshNeeded={updatePendingCount}
            isOffline={isOffline}
          />
        )}

        {activeTab === 'sync' && (
          <SyncManager
            isOffline={isOffline}
            onSyncComplete={updatePendingCount}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            isOffline={isOffline}
            onDataUpdated={updatePendingCount}
          />
        )}
      </main>

      {/* 3. Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingCount={pendingCount}
      />
    </div>
  );
}
