import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck,
  TrendingUp, 
  ClipboardCheck, 
  BookOpen, 
  BellRing, 
  Settings as SettingsIcon,
  Quote
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems = [
    { id: 'overview' as ActiveTab, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'classes' as ActiveTab, label: 'Lớp học', icon: Users },
    { id: 'students' as ActiveTab, label: 'Học sinh', icon: GraduationCap },
    { id: 'attendance' as ActiveTab, label: 'Điểm danh', icon: CalendarCheck },
    { id: 'progress' as ActiveTab, label: 'Tiến độ học tập', icon: TrendingUp },
    { id: 'grading' as ActiveTab, label: 'Kiểm tra - Đánh giá', icon: ClipboardCheck },
    { id: 'materials' as ActiveTab, label: 'Tài liệu & Bài giảng', icon: BookOpen },
    { id: 'announcements' as ActiveTab, label: 'Thông báo', icon: BellRing },
    { id: 'settings' as ActiveTab, label: 'Cài đặt', icon: SettingsIcon },
  ];


  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0B2D59] text-white flex flex-col justify-between shrink-0 shadow-xl transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="pt-4 px-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-sky-300/80 border-b border-white/10 mb-2">
            Phân hệ quản lý Toán
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#1565C0] text-white shadow-md border-l-4 border-amber-400 pl-3'
                    : 'text-sky-100/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-amber-300' : 'text-sky-200'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Motivational quote card matching reference design */}
        <div className="p-4 m-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs shadow-inner">
          <div className="flex items-start space-x-2 text-amber-300 mb-1.5">
            <Quote className="w-4 h-4 shrink-0 fill-amber-300" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
              Lời tâm huyết
            </span>
          </div>
          <p className="text-xs italic text-sky-100 leading-relaxed font-serif">
            "Dạy học không chỉ là truyền đạt kiến thức, mà còn là khơi dậy niềm tin và ước mơ của học trò."
          </p>
        </div>
      </aside>
    </>
  );
};
