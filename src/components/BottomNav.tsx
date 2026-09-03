import React from 'react';
import { Home, PlusCircle, ClipboardList, UploadCloud, Settings } from 'lucide-react';

export type TabType = 'home' | 'new-survey' | 'surveys' | 'sync' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingCount
}) => {
  const navItems = [
    {
      id: 'home' as TabType,
      label: 'Trang chủ',
      icon: Home
    },
    {
      id: 'new-survey' as TabType,
      label: 'Khảo sát mới',
      icon: PlusCircle
    },
    {
      id: 'surveys' as TabType,
      label: 'Danh sách',
      icon: ClipboardList
    },
    {
      id: 'sync' as TabType,
      label: 'Đồng bộ',
      icon: UploadCloud,
      badge: pendingCount > 0 ? pendingCount : null
    },
    {
      id: 'settings' as TabType,
      label: 'Cài đặt',
      icon: Settings
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
      <div className="max-w-md mx-auto h-16 px-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
                isActive
                  ? 'text-[#0047BA] font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {/* Active Tri-color Indicator Bar */}
              {isActive && (
                <span className="absolute top-0 w-10 h-1 bg-gradient-to-r from-[#0047BA] via-[#E31B23] to-[#FDB813] rounded-b-md animate-fade-in" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative mt-1">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#0047BA]' : ''}`} />
                
                {/* Notification Badge for PENDING_SYNC items */}
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-4 px-1 rounded-full bg-[#E31B23] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-[68px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

