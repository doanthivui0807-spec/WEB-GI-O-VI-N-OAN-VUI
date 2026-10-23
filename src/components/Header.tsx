import React, { useState } from 'react';
import { 
  GraduationCap, 
  Bell, 
  Settings as SettingsIcon, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  X,
  Menu
} from 'lucide-react';
import { TeacherProfile, ActiveTab } from '../types';

interface HeaderProps {
  profile: TeacherProfile;
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  isSample: boolean;
  onToggleSample: () => void;
  unreadAnnouncementsCount: number;
  onOpenAI: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onNavigate,
  isSample,
  onToggleSample,
  unreadAnnouncementsCount,
  onOpenAI,
  onToggleMobileMenu,
}) => {
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#0B2D59] via-[#1565C0] to-[#1E88E5] text-white shadow-md z-30 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: School identity */}
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-7 h-7 text-amber-300" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-wide uppercase drop-shadow-sm">
                {profile.school}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 italic opacity-90">
              {profile.subTitle}
            </p>
          </div>
        </div>

        {/* Right: Actions, Sample mode alert & Teacher profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Sample data indicator */}
          <div className="hidden lg:flex items-center">
            {isSample ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-300/40 text-amber-200 text-xs font-semibold backdrop-blur-sm">
                <Info className="w-3.5 h-3.5 text-amber-300" />
                <span>Dữ liệu minh họa</span>
                <button
                  onClick={onToggleSample}
                  className="ml-1 px-1.5 py-0.5 rounded text-[11px] bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold transition shadow-xs"
                  title="Chuyển sang chế độ dữ liệu thực tế"
                >
                  Dữ liệu thực
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 text-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Dữ liệu thực tế</span>
                <button
                  onClick={onToggleSample}
                  className="ml-1 px-1.5 py-0.5 rounded text-[11px] bg-sky-200 hover:bg-white text-slate-900 font-bold transition shadow-xs"
                  title="Bật lại chế độ dữ liệu mẫu"
                >
                  Xem dữ liệu mẫu
                </button>
              </div>
            )}
          </div>

          {/* Quick AI Help button */}
          <button
            onClick={onOpenAI}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs tracking-wider shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            title="Mở Trợ lý AI Toán học - Cô Vui"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>AI TOÁN HỌC</span>
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationPopup(!showNotificationPopup);
                if (!showNotificationPopup) onNavigate('announcements');
              }}
              className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-sky-100 hover:text-white"
              title="Thông báo mới"
            >
              <Bell className="w-5 h-5" />
              {unreadAnnouncementsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0B2D59] animate-bounce">
                  {unreadAnnouncementsCount}
                </span>
              )}
            </button>
          </div>

          {/* Settings button */}
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-sky-100 hover:text-white"
            title="Cài đặt hệ thống"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          {/* Teacher Profile preview */}
          <div 
            onClick={() => onNavigate('settings')}
            className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-white/20 cursor-pointer group"
            title="Nhấn để tùy chỉnh hồ sơ giáo viên"
          >
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/60 group-hover:ring-amber-300 transition shadow"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#1565C0] rounded-full" />
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-sm font-bold leading-tight group-hover:text-amber-200 transition">
                {profile.name}
              </div>
              <div className="text-xs text-sky-100 leading-tight opacity-90">
                {profile.subject === 'TOÁN' ? 'Giáo viên Toán' : profile.subject}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
