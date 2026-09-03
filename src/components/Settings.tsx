import React from 'react';
import { Smartphone, Database, Info, RefreshCw, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { seedSampleData, clearSyncedSurveys } from '../services/db';

interface SettingsProps {
  isOffline: boolean;
  onDataUpdated?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOffline,
  onDataUpdated
}) => {
  const [seedLoading, setSeedLoading] = React.useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = React.useState<boolean>(false);

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      await seedSampleData();
      setSeedSuccess(true);
      if (onDataUpdated) onDataUpdated();
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to seed sample data');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleClearSynced = async () => {
    if (confirm('Clear uploaded surveys from local device storage?')) {
      const count = await clearSyncedSurveys();
      if (onDataUpdated) onDataUpdated();
      alert(`Cleared ${count} synced surveys.`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-4 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Cài Đặt Ứng Dụng</h2>
        <p className="text-xs font-semibold text-[#0047BA]">Cấu hình PWA & Dữ liệu hệ thống</p>
      </div>

      {/* PWA & Installation Info */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0047BA] via-[#E31B23] to-[#FDB813]" />

        <div className="flex items-center space-x-3 pt-1">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#0047BA] border border-blue-100">
            <Smartphone className="w-5 h-5 text-[#0047BA]" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900">VKU Field Survey PWA</h3>
            <p className="text-[11px] text-slate-500 font-medium">Phiên bản 1.0.0 (Tương thích Capacitor & Mobile)</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200 flex items-center justify-between font-semibold">
          <span>Trạng thái kết nối mạng:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center space-x-1 border ${isOffline ? 'bg-red-50 text-[#E31B23] border-red-200' : 'bg-blue-50 text-[#0047BA] border-blue-200'}`}>
            {isOffline ? <WifiOff className="w-3 h-3 text-[#E31B23]" /> : <Wifi className="w-3 h-3 text-[#0047BA]" />}
            <span>{isOffline ? 'Offline (Ngoại tuyến)' : 'Online (Trực tuyến)'}</span>
          </span>
        </div>
      </div>

      {/* Developer & Offline Debug Tools */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Công cụ thử nghiệm & Bộ nhớ local
        </h3>

        <button
          onClick={handleSeed}
          disabled={seedLoading}
          className="w-full py-2.5 px-4 bg-blue-50 text-[#0047BA] font-bold text-xs rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#0047BA]" />
            <span>Tạo bộ dữ liệu khảo sát mẫu</span>
          </div>

          {seedSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-[#0047BA]" />
          ) : (
            <RefreshCw className={`w-4 h-4 ${seedLoading ? 'animate-spin' : ''}`} />
          )}
        </button>

        <button
          onClick={handleClearSynced}
          className="w-full py-2.5 px-4 bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-left"
        >
          Xóa các phiếu đã gửi khỏi bộ nhớ IndexedDB
        </button>
      </div>

      {/* University & Credits Info */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
          <Info className="w-4 h-4 text-[#0047BA]" />
          <span>Về Đại học CNTT & Truyền thông Việt - Hàn (VKU)</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn, Đại học Đà Nẵng. Hệ thống khảo sát cơ sở vật chất PWA Offline-First.
        </p>
      </div>
    </div>
  );
};

