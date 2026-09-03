import React, { useState, useEffect } from 'react';
import { UploadCloud, Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, Trash2, Database } from 'lucide-react';
import { syncPendingSurveys, subscribeSyncState, subscribeSyncLogs } from '../services/sync';
import { getPendingCount, clearSyncedSurveys, getAllSurveyDrafts } from '../services/db';
import { SyncLog } from '../types/survey';

interface SyncManagerProps {
  isOffline: boolean;
  onSyncComplete?: () => void;
}

export const SyncManager: React.FC<SyncManagerProps> = ({
  isOffline,
  onSyncComplete
}) => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [logs, setLogs] = useState<SyncLog[]>([]);

  const refreshCounts = async () => {
    const pCount = await getPendingCount();
    const all = await getAllSurveyDrafts();
    setPendingCount(pCount);
    setTotalCount(all.length);
  };

  useEffect(() => {
    refreshCounts();

    const unsubscribeState = subscribeSyncState((syncing, count) => {
      setIsSyncing(syncing);
      setPendingCount(count);
    });

    const unsubscribeLogs = subscribeSyncLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
    });

    return () => {
      unsubscribeState();
      unsubscribeLogs();
    };
  }, []);

  const handleManualSync = async () => {
    if (isOffline) {
      alert('Cannot synchronize while offline. Please connect to a Wi-Fi or Cellular network.');
      return;
    }

    try {
      const result = await syncPendingSurveys();
      await refreshCounts();
      if (onSyncComplete) onSyncComplete();
      alert(`Sync finished: ${result.synced} uploaded successfully, ${result.failed} failed.`);
    } catch (err: any) {
      alert(`Sync error: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleClearSynced = async () => {
    if (confirm('Clear completed (SYNCED) surveys from local storage to free up space? Pending items will not be affected.')) {
      const removed = await clearSyncedSurveys();
      await refreshCounts();
      if (onRefreshNeeded) onRefreshNeeded();
      alert(`Cleaned up ${removed} synced surveys from IndexedDB.`);
    }
  };

  const onRefreshNeeded = onSyncComplete || (() => {});

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-4 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Quản Lý Đồng Bộ Offline</h2>
        <p className="text-xs font-semibold text-[#0047BA]">Hàng chờ lưu trữ máy chủ VKU</p>
      </div>

      {/* Main Status & Queue Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0047BA] via-[#E31B23] to-[#FDB813]" />

        {/* Network & Queue Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 pt-1">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-[#E31B23] animate-ping' : 'bg-[#0047BA]'}`} />
            <span className="text-xs font-extrabold text-slate-800">
              {isOffline ? 'Chế độ Ngoại Tuyến (Offline)' : 'Đã Kết Nối Máy Chủ'}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-xs font-medium">
            {isOffline ? <WifiOff className="w-4 h-4 text-[#E31B23]" /> : <Wifi className="w-4 h-4 text-[#0047BA]" />}
          </div>
        </div>

        {/* Counter Big Display */}
        <div className="text-center py-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-[#0047BA] mb-2 border border-blue-100 shadow-sm">
            <UploadCloud className={`w-8 h-8 text-[#0047BA] ${isSyncing ? 'animate-spin' : ''}`} />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">
            {pendingCount}
          </h3>
          <p className="text-xs font-extrabold text-[#E31B23] uppercase tracking-wider mt-0.5">
            Phiếu khảo sát đang chờ đồng bộ
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Tổng số dữ liệu trong IndexedDB: <span className="font-bold text-slate-800">{totalCount}</span>
          </p>
        </div>

        {/* Sync Action Button */}
        <button
          onClick={handleManualSync}
          disabled={isSyncing || isOffline || pendingCount === 0}
          className={`w-full h-12 py-3 rounded-2xl font-bold text-white text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
            isOffline || pendingCount === 0
              ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed border border-slate-200'
              : 'bg-[#0047BA] hover:bg-[#002A54] shadow-blue-600/20 border border-blue-700'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {isSyncing
              ? 'Đang đồng bộ với máy chủ VKU...'
              : isOffline
              ? 'Bật Wi-Fi/4G để đồng bộ'
              : pendingCount === 0
              ? 'Hàng chờ trống'
              : `Đồng bộ ngay ${pendingCount} phiếu`}
          </span>
        </button>
      </div>

      {/* Storage Cleanup Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            <Database className="w-5 h-5 text-[#0047BA]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Xóa bộ nhớ đã đồng bộ</h4>
            <p className="text-[11px] text-slate-500">Dọn dẹp các phiếu đã tải lên máy chủ thành công</p>
          </div>
        </div>

        <button
          onClick={handleClearSynced}
          className="p-2.5 rounded-xl bg-red-50 text-[#E31B23] hover:bg-red-100 transition-colors text-xs font-bold flex items-center space-x-1 border border-red-200"
          title="Xóa dữ liệu đã đồng bộ"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Dọn dẹp</span>
        </button>
      </div>

      {/* Activity Log Feed */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Nhật ký tiến trình đồng bộ (Logs)
          </h4>
          <span className="text-[10px] font-bold text-[#0047BA] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Live</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Chưa có ghi nhận hoạt động. Khi tạo hoặc gửi phiếu khảo sát, nhật ký sẽ hiển thị tại đây.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-2.5 rounded-xl text-xs font-mono border flex items-start space-x-2 ${
                  log.type === 'success'
                    ? 'bg-blue-50 text-[#0047BA] border-blue-200'
                    : log.type === 'error'
                    ? 'bg-red-50 text-[#E31B23] border-red-200'
                    : log.type === 'warning'
                    ? 'bg-amber-50 text-[#D97706] border-amber-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0047BA] shrink-0 mt-0.5" />}
                {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-[#E31B23] shrink-0 mt-0.5" />}
                {log.type === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />}
                {log.type === 'info' && <UploadCloud className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />}

                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{log.message}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

