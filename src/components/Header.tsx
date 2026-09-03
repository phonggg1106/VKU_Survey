import React from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';

interface HeaderProps {
  onSyncClick?: () => void;
  pendingCount?: number;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSyncClick,
  pendingCount = 0,
  isSyncing = false
}) => {
  const { isOffline, connectionType } = useNetwork();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      {/* Signature VKU Tri-Color Accent Line */}
      <div className="vku-tri-color-bar" />

      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">

        {/* Left: VKU Brand Logo and App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-sm relative overflow-hidden group">
            {/* Subtle blue corner indicator */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#E31B23] rounded-bl-full" />
            <img
              src="/images.png"
              alt="VKU Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback SVG inline rendering if image path fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
                VKU <span className="text-[#0047BA]">Field</span> <span className="text-[#E31B23]">Survey</span>
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FDB813]" title="VKU Identity" />
            </div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Vietnam-Korea University
            </p>
          </div>
        </div>

        {/* Right: Network Status Badge & Quick Sync Trigger */}
        <div className="flex items-center space-x-2">

          {/* Network Connection Badge */}
          {isOffline ? (
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#E31B23] border border-red-200 animate-pulse shadow-sm"
              title="You are operating offline. All surveys will be saved locally to IndexedDB."
            >
              <WifiOff className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Offline</span>
            </div>
          ) : (
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0047BA] border border-blue-100 shadow-sm"
              title={`Online via ${connectionType}`}
            >
              <Wifi className="w-3.5 h-3.5 text-[#0047BA]" />
              <span className="hidden sm:inline">Online</span>
            </div>
          )}

          {/* Quick Manual Sync Button */}
          {onSyncClick && pendingCount > 0 && (
            <button
              onClick={onSyncClick}
              disabled={isSyncing || isOffline}
              className={`p-1.5 rounded-xl border transition-all ${isOffline
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-amber-50 text-[#FDB813] border-amber-200 hover:bg-amber-100 active:scale-95 shadow-sm'
                }`}
              title="Sync pending surveys now"
            >
              <RefreshCw className={`w-4 h-4 text-[#D97706] ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}

        </div>
      </div>
    </header>
  );
};

