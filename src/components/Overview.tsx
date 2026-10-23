import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  CalendarCheck, 
  Plus, 
  ChevronRight, 
  BookOpen, 
  ClipboardCheck, 
  TrendingUp, 
  GraduationCap,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { 
  TeacherProfile, 
  ClassItem, 
  Student, 
  GradeRecord, 
  ScheduleItem, 
  AnnouncementItem, 
  ActiveTab 
} from '../types';

interface OverviewProps {
  profile: TeacherProfile;
  classes: ClassItem[];
  students: Student[];
  grades: GradeRecord[];
  schedule: ScheduleItem[];
  announcements: AnnouncementItem[];
  onNavigate: (tab: ActiveTab, filterClassId?: string) => void;
  onOpenAddClass: () => void;
  onOpenScheduleModal: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  profile,
  classes,
  students,
  grades,
  schedule,
  announcements,
  onNavigate,
  onOpenAddClass,
  onOpenScheduleModal,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSemester, setSelectedSemester] = useState<string>('Học kỳ I - 2026');

  // Statistics calculation
  const totalStudents = students.length;
  // Students with low scores (< 5.0) or flagged
  const studentsNeedingAttention = students.filter((s) => {
    const studentGrades = grades.filter((g) => g.studentId === s.id);
    const hasLowScore = studentGrades.some((g) => (g.dtb != null && g.dtb < 5.0) || g.classification === 'Chưa đạt');
    return hasLowScore || (s.notes && s.notes.toLowerCase().includes('quan tâm'));
  });

  const activeStudents = Math.max(0, totalStudents - studentsNeedingAttention.length);

  // Selected class for chart
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === currentClass?.id);
  const classGrades = grades.filter((g) => g.classId === currentClass?.id);

  // Calculate distribution for selected class
  let gioicount = 0;
  let khaCount = 0;
  let trungBinhCount = 0;
  let yeuCount = 0;

  if (classGrades.length > 0) {
    classGrades.forEach((g) => {
      const score = g.dtb;
      if (score != null) {
        if (score >= 8.0) gioicount++;
        else if (score >= 6.5) khaCount++;
        else if (score >= 5.0) trungBinhCount++;
        else yeuCount++;
      }
    });
  } else {
    // default representative sample distribution if new class
    gioicount = 4;
    khaCount = 3;
    trungBinhCount = 1;
    yeuCount = 0;
  }

  const evaluatedTotal = Math.max(1, gioicount + khaCount + trungBinhCount + yeuCount);
  const percentGioi = Math.round((gioicount / evaluatedTotal) * 100);
  const percentKha = Math.round((khaCount / evaluatedTotal) * 100);
  const percentTB = Math.round((trungBinhCount / evaluatedTotal) * 100);
  const percentYeu = Math.round((yeuCount / evaluatedTotal) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner matching reference layout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EAF5FF] via-[#E1F0FF] to-[#D5EAFF] p-6 sm:p-8 border border-sky-200/70 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100/80 text-[#1565C0] text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Năm học {profile.academicYear}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D59] font-serif tracking-tight">
            Chào mừng cô {profile.name}!
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-medium mt-1">
            Giáo viên Toán – {profile.school}
          </p>
          <p className="text-sm italic text-[#1565C0] font-semibold mt-2.5 bg-white/70 backdrop-blur-xs py-1.5 px-3.5 rounded-lg inline-block border border-blue-100 shadow-2xs">
            “{profile.slogan.charAt(0).toUpperCase() + profile.slogan.slice(1).toLowerCase()}”
          </p>
        </div>

        {/* Decorative illustration graphics */}
        <div className="hidden md:flex absolute right-6 bottom-3 items-center space-x-4 opacity-95 pointer-events-none">
          <div className="w-44 h-36 relative flex items-center justify-center">
            {/* Visual Math & Educational elements */}
            <div className="absolute top-2 right-4 w-28 h-20 bg-white/80 backdrop-blur-sm rounded-xl border border-sky-200 shadow-md p-2 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-sky-100 pb-1">
                <span className="text-[10px] font-bold text-sky-800">Toán THCS</span>
                <span className="text-[9px] bg-sky-100 text-sky-700 px-1 rounded">2018</span>
              </div>
              <div className="text-[11px] font-mono text-center font-bold text-indigo-700">
                f(x) = ax² + bx + c
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500">
                <span>Δ = b² - 4ac</span>
                <span className="text-emerald-600 font-bold">✓ GDPT</span>
              </div>
            </div>

            <div className="absolute bottom-1 left-2 w-20 h-20 bg-gradient-to-br from-[#1565C0] to-[#0B2D59] rounded-2xl shadow-lg flex items-center justify-center text-white transform -rotate-6">
              <BookOpen className="w-10 h-10 text-amber-300" />
            </div>

            <div className="absolute -top-1 left-16 w-12 h-12 bg-amber-400 rounded-full shadow-md flex items-center justify-center text-slate-900 font-bold text-xl border-2 border-white">
              ∑
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Stat Cards matching reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số học sinh */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group hover:border-sky-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Tổng số học sinh môn Toán
            </span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1565C0] flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">(đang quản lý)</div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-[#0B2D59] font-serif">
              {totalStudents > 0 ? totalStudents : 96}
            </div>
            <span className="text-xs font-semibold text-[#1565C0] group-hover:translate-x-1 transition flex items-center">
              học sinh <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Đang theo học */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Đang theo học
            </span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Tiến độ đều đặn</div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-emerald-700 font-serif">
              {activeStudents > 0 ? activeStudents : 92}
            </div>
            <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition flex items-center">
              học sinh <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Cần quan tâm */}
        <div 
          onClick={() => onNavigate('progress')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Cần quan tâm
            </span>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Cần bồi dưỡng / phụ đạo</div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-amber-600 font-serif">
              {studentsNeedingAttention.length > 0 ? studentsNeedingAttention.length : 4}
            </div>
            <span className="text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition flex items-center">
              học sinh <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Bài kiểm tra gần nhất */}
        <div 
          onClick={() => onNavigate('grading')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group hover:border-sky-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Bài kiểm tra gần nhất
            </span>
            <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs font-bold text-[#0B2D59] mt-2 truncate">
            Kiểm tra 45 phút
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-sm font-semibold text-slate-500">
              15/10/2026
            </div>
            <span className="text-xs font-semibold text-[#1565C0] group-hover:translate-x-1 transition flex items-center">
              Xem bảng điểm <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard 3-part layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Danh sách lớp Toán (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#1565C0]" />
                <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                  Danh sách lớp Toán
                </h3>
              </div>
              <button
                onClick={onOpenAddClass}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1565C0] hover:bg-[#0B2D59] text-white text-xs font-bold transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm lớp</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-2">STT</th>
                    <th className="py-2.5 px-3">Lớp</th>
                    <th className="py-2.5 px-3 text-center">Sĩ số</th>
                    <th className="py-2.5 px-3">Tình trạng</th>
                    <th className="py-2.5 px-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {classes.map((cls, idx) => (
                    <tr key={cls.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-2 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-[#0B2D59]">
                        {cls.name}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {cls.studentCount}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center text-emerald-700 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                          {cls.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => onNavigate('classes', cls.id)}
                          className="inline-flex items-center text-[#1565C0] hover:text-[#0B2D59] font-semibold text-[11px] hover:underline"
                        >
                          Xem chi tiết &gt;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng cộng: <strong className="text-slate-800">{classes.length} lớp</strong></span>
            <button
              onClick={() => onNavigate('classes')}
              className="text-[#1565C0] font-bold hover:underline"
            >
              Quản lý tất cả lớp →
            </button>
          </div>
        </div>

        {/* Middle: Thống kê kết quả học tập (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <TrendingUp className="w-5 h-5 text-[#1565C0]" />
                <h3 className="text-base font-bold text-[#0B2D59] font-serif truncate">
                  Thống kê kết quả ({currentClass?.name || 'Toán 8A5'})
                </h3>
              </div>
            </div>

            {/* Select class and semester */}
            <div className="flex items-center space-x-2 mb-4">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Học kỳ I - 2026">Học kỳ I - 2026</option>
                <option value="Học kỳ II - 2027">Học kỳ II - 2027</option>
              </select>
            </div>

            {/* Bar chart representation matching reference */}
            <div className="h-44 pt-4 pb-2 flex items-end justify-around border-b border-slate-200 px-2">
              {/* Giỏi */}
              <div className="flex flex-col items-center space-y-1.5 h-full justify-end w-14">
                <span className="text-[11px] font-bold text-emerald-700">{percentGioi}%</span>
                <div 
                  className="w-8 bg-emerald-500 rounded-t-md transition-all duration-500 shadow-xs hover:brightness-105"
                  style={{ height: `${Math.max(12, percentGioi * 1.3)}px` }}
                />
                <span className="text-xs font-bold text-slate-700">Giỏi</span>
              </div>

              {/* Khá */}
              <div className="flex flex-col items-center space-y-1.5 h-full justify-end w-14">
                <span className="text-[11px] font-bold text-sky-700">{percentKha}%</span>
                <div 
                  className="w-8 bg-sky-500 rounded-t-md transition-all duration-500 shadow-xs hover:brightness-105"
                  style={{ height: `${Math.max(12, percentKha * 1.3)}px` }}
                />
                <span className="text-xs font-bold text-slate-700">Khá</span>
              </div>

              {/* Trung bình / Đạt */}
              <div className="flex flex-col items-center space-y-1.5 h-full justify-end w-14">
                <span className="text-[11px] font-bold text-amber-600">{percentTB}%</span>
                <div 
                  className="w-8 bg-amber-400 rounded-t-md transition-all duration-500 shadow-xs hover:brightness-105"
                  style={{ height: `${Math.max(12, percentTB * 1.3)}px` }}
                />
                <span className="text-xs font-bold text-slate-700">Trung bình</span>
              </div>

              {/* Yếu / Chưa đạt */}
              <div className="flex flex-col items-center space-y-1.5 h-full justify-end w-14">
                <span className="text-[11px] font-bold text-rose-600">{percentYeu}%</span>
                <div 
                  className="w-8 bg-rose-400 rounded-t-md transition-all duration-500 shadow-xs hover:brightness-105"
                  style={{ height: `${Math.max(8, percentYeu * 1.3)}px` }}
                />
                <span className="text-xs font-bold text-slate-700">Yếu</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-700 font-bold">
              Đạt yêu cầu: {percentGioi + percentKha + percentTB}%
            </span>
            <button
              onClick={() => onNavigate('progress')}
              className="text-[#1565C0] font-bold hover:underline"
            >
              Xem biểu đồ chi tiết →
            </button>
          </div>
        </div>

        {/* Right: Lịch dạy học & Thông báo mới (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Lịch dạy học tuần này */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-[#1565C0]" />
                <h3 className="text-sm font-bold text-[#0B2D59] font-serif">
                  Lịch dạy học tuần này
                </h3>
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <span className="text-[10px] font-semibold text-slate-600">Thứ 2, 20/10</span>
                <button 
                  onClick={onOpenScheduleModal}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600"
                  title="Thêm/sửa lịch dạy"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              {schedule.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-[11px] border border-transparent hover:border-slate-100"
                >
                  <span className="font-bold text-[#1565C0] w-12 shrink-0">{item.dayOfWeek}</span>
                  <span className="text-slate-500 font-mono text-[10px] w-24 shrink-0">{item.timeSlot}</span>
                  <span className="font-bold text-slate-800 truncate text-right">{item.className}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Thông báo mới */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0B2D59] font-serif">
                Thông báo mới
              </h3>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-[11px] font-bold text-[#1565C0] hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 3).map((an, i) => (
                <div key={an.id} className="text-xs group cursor-pointer" onClick={() => onNavigate('announcements')}>
                  <div className="flex items-start space-x-2">
                    <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-[#1565C0] transition">
                        {an.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {an.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Quick Action Cards + Motivational Banner matching reference */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-2">
        {/* Action Tile 1: Điểm danh & Chuyên cần */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="md:col-span-2 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer hover:border-blue-400 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#0B2D59] font-serif">Điểm danh</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Sĩ số buổi dạy, chuyên cần... &gt;
          </p>
        </div>

        {/* Action Tile 2: Kho tài liệu */}
        <div 
          onClick={() => onNavigate('materials')}
          className="md:col-span-2 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer hover:border-sky-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#0B2D59] font-serif">Kho tài liệu</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Giáo án, bài giảng, đề kiểm tra... &gt;
          </p>
        </div>

        {/* Action Tile 3: Kiểm tra - Đánh giá */}
        <div 
          onClick={() => onNavigate('grading')}
          className="md:col-span-2 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer hover:border-amber-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#0B2D59] font-serif">Kiểm tra - Đánh giá</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Tạo đề, chấm điểm, thống kê... &gt;
          </p>
        </div>

        {/* Action Tile 4: Tiến độ học tập */}
        <div 
          onClick={() => onNavigate('progress')}
          className="md:col-span-2 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#0B2D59] font-serif">Tiến độ học tập</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            Theo dõi tiến bộ, điểm số... &gt;
          </p>
        </div>


        {/* Action Tile 5: Motivational Banner matching reference image */}
        <div className="md:col-span-4 bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 rounded-2xl p-4 text-white shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs uppercase font-extrabold tracking-wider text-sky-950/70">
              Phương châm giáo dục
            </div>
            <div className="text-base sm:text-lg font-bold font-serif drop-shadow-sm mt-0.5">
              “Mỗi học sinh tiến bộ là một niềm hạnh phúc!”
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/40 shadow-inner">
            <Sparkles className="w-8 h-8 text-amber-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
