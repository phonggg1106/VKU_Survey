import React from 'react';
import { PlusCircle, ClipboardList, UploadCloud, ShieldCheck, Cpu, HardDrive, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { TabType } from './BottomNav';


interface HomeProps {
  onNavigate: (tab: TabType) => void;
  pendingCount: number;
  isOffline: boolean;
}

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  pendingCount,
  isOffline
}) => {
  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-5 animate-fade-in bg-white min-h-screen">
      
      {/* VKU Hero Welcome Banner Card (White Base with VKU Blue-Red-Yellow Accents) */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-md relative overflow-hidden transition-all hover:shadow-lg">
        {/* Signature Top Tri-Color Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0047BA] via-[#E31B23] to-[#FDB813]" />

        {/* Decorative subtle background shapes */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#0047BA]/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-[#E31B23]/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 mt-1">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0047BA] text-xs font-bold border border-blue-100 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#FDB813]" />
            <span>PWA Offline System</span>
          </span>

          <div className="flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full border">
            {isOffline ? (
              <div className="flex items-center space-x-1 text-[#E31B23] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Ngoại tuyến</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-[#0047BA] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                <Wifi className="w-3.5 h-3.5" />
                <span>Trực tuyến</span>
              </div>
            )}
          </div>
        </div>

        {/* Title with Logo Icon */}
        <div className="flex items-start space-x-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm flex items-center justify-center shrink-0">
            <img src="/images.png" alt="VKU Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 leading-snug">
              VKU Field Survey
            </h2>
            <p className="text-xs font-semibold text-[#0047BA]">
              Khảo sát & Kiểm định Cơ sở vật chất VKU
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-5 pt-1">
          Hệ thống ghi nhận, lưu trữ offline qua IndexedDB và tự động đồng bộ dữ liệu khảo sát cho Đại học Việt - Hàn.
        </p>

        {/* Action Button */}
        <button
          onClick={() => onNavigate('new-survey')}
          className="w-full py-3.5 px-4 bg-[#0047BA] hover:bg-[#003865] active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 group border border-blue-700"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
            <PlusCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm">Tạo Khảo Sát Mới</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-[#FDB813] animate-ping" />
        </button>
      </div>

      {/* Quick Action Grid - Clean White Cards with Blue/Red/Yellow Touches */}
      <div className="grid grid-cols-2 gap-3">
        {/* Saved Surveys Button */}
        <button
          onClick={() => onNavigate('surveys')}
          className="bg-white border border-slate-200 hover:border-[#0047BA]/40 rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-all group active:scale-95 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-8 h-8 bg-blue-50 rounded-bl-2xl flex items-center justify-end pr-1.5 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#0047BA]" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0047BA] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-blue-100">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Lịch sử khảo sát</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Xem dữ liệu lưu tại máy</p>
        </button>

        {/* Offline Sync Button */}
        <button
          onClick={() => onNavigate('sync')}
          className="bg-white border border-slate-200 hover:border-[#E31B23]/40 rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-all group active:scale-95 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-8 h-8 bg-amber-50 rounded-bl-2xl flex items-center justify-end pr-1.5 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#FDB813]" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E31B23] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-red-100">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Đồng bộ Offline</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {pendingCount > 0 ? `${pendingCount} khảo sát chờ gửi` : 'Hàng chờ trống'}
          </p>

          {pendingCount > 0 && (
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#E31B23] animate-ping" />
          )}
        </button>
      </div>

      {/* Architecture Capabilities Card - Clean White Base */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
            <span>Tính năng & Công nghệ System</span>
          </h3>
          <span className="text-[10px] font-bold text-[#0047BA] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            VKU Standard
          </span>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#0047BA] border border-blue-100 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Lưu trữ Offline IndexedDB</p>
              <p className="text-[11px] text-slate-500">Lưu dữ liệu khảo sát tức thì khi không có mạng thông qua LocalForage driver.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-1.5 rounded-lg bg-red-50 text-[#E31B23] border border-red-100 shrink-0 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Tích hợp phần cứng Capacitor</p>
              <p className="text-[11px] text-slate-500">Kết nối trực tiếp Camera và Trạng thái mạng trên thiết bị di động Android / iOS.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-1.5 rounded-lg bg-amber-50 text-[#D97706] border border-amber-100 shrink-0 mt-0.5">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">PWA Cache-First Engine</p>
              <p className="text-[11px] text-slate-500">Service Worker tự động bộ nhớ tạm HTML/JS/CSS giúp ứng dụng load tức thì.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

