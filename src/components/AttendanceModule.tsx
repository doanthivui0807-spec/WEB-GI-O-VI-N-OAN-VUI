import React, { useState, useMemo } from 'react';
import { 
  ClassItem, 
  Student, 
  AttendanceSession, 
  AttendanceStatus, 
  AnnouncementItem 
} from '../types';
import { 
  exportAttendanceSessionToExcel, 
  exportAttendanceSummaryToExcel 
} from '../utils/excel';
import { 
  CalendarCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Save, 
  Download, 
  History, 
  Users, 
  Search, 
  Send, 
  Check, 
  Copy, 
  X, 
  ChevronRight,
  Filter,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface AttendanceModuleProps {
  classes: ClassItem[];
  students: Student[];
  attendance: AttendanceSession[];
  onSaveAttendance: (updatedAttendance: AttendanceSession[]) => void;
  onAddAnnouncement?: (announcement: AnnouncementItem) => void;
  selectedClassIdForNav?: string;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  classes,
  students,
  attendance,
  onSaveAttendance,
  onAddAnnouncement,
  selectedClassIdForNav,
}) => {
  // Current active class
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (selectedClassIdForNav && classes.some(c => c.id === selectedClassIdForNav)) {
      return selectedClassIdForNav;
    }
    return classes[0]?.id || '';
  });

  // Mode: 'take' (Điểm danh buổi này), 'summary' (Sổ tổng hợp chuyên cần), 'history' (Lịch sử)
  const [activeSubTab, setActiveSubTab] = useState<'take' | 'summary' | 'history'>('take');

  // Date for session
  const todayStr = new Date().toISOString().slice(0, 10);
  const [sessionDate, setSessionDate] = useState<string>(todayStr);
  const [sessionTimeSlot, setSessionTimeSlot] = useState<string>('Tiết 1 - 2 (13:30 - 15:00)');
  const [sessionLessonTopic, setSessionLessonTopic] = useState<string>('');
  const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Feedback notifications
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Absent notification modal
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyTargetStudent, setNotifyTargetStudent] = useState<Student | null>(null);
  const [notifyReason, setNotifyReason] = useState('');

  // Selected Class object
  const currentClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Students belonging to current class
  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter(s => s.classId === currentClass.id);
  }, [students, currentClass]);

  // Find if there is an existing session for the selected class & date & timeSlot
  const existingSession = useMemo(() => {
    return attendance.find(
      a => a.classId === selectedClassId && a.date === sessionDate && (a.timeSlot === sessionTimeSlot || !a.timeSlot)
    );
  }, [attendance, selectedClassId, sessionDate, sessionTimeSlot]);

  // Local draft state for records in the current session
  // Record<studentId, { status: AttendanceStatus, note?: string }>
  const [draftRecords, setDraftRecords] = useState<Record<string, { status: AttendanceStatus; note?: string }>>({});

  // Sync draftRecords whenever class, date, or existingSession changes
  React.useEffect(() => {
    if (existingSession) {
      setDraftRecords(existingSession.records);
      if (existingSession.lessonTopic) {
        setSessionLessonTopic(existingSession.lessonTopic);
      }
    } else {
      // Initialize with all students 'present' by default
      const initial: Record<string, { status: AttendanceStatus; note?: string }> = {};
      classStudents.forEach(st => {
        initial[st.id] = { status: 'present', note: '' };
      });
      setDraftRecords(initial);
      setSessionLessonTopic('');
    }
  }, [selectedClassId, sessionDate, sessionTimeSlot, existingSession, classStudents]);

  // Quick action: Change single student status
  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setDraftRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      }
    }));
  };

  // Quick action: Change note
  const handleSetStudentNote = (studentId: string, note: string) => {
    setDraftRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: prev[studentId]?.status || 'present',
        note,
      }
    }));
  };

  // Quick action: Mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; note?: string }> = {};
    classStudents.forEach(st => {
      updated[st.id] = { 
        status: 'present', 
        note: draftRecords[st.id]?.note || '' 
      };
    });
    setDraftRecords(updated);
    setSaveSuccessMsg('Đã đánh dấu tất cả học sinh có mặt!');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Compute live statistics for current draft
  const currentSessionStats = useMemo(() => {
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    classStudents.forEach(st => {
      const rec = draftRecords[st.id];
      const status = rec?.status || 'present';
      if (status === 'present') present++;
      else if (status === 'excused') excused++;
      else if (status === 'unexcused') unexcused++;
      else if (status === 'late') late++;
    });

    const total = classStudents.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return {
      total,
      present,
      excused,
      unexcused,
      late,
      rate,
    };
  }, [classStudents, draftRecords]);

  // Save session
  const handleSaveCurrentSession = () => {
    if (!currentClass) return;

    const sessionId = existingSession ? existingSession.id : `att-${currentClass.id}-${sessionDate.replace(/-/g, '')}-${Date.now()}`;

    const newSession: AttendanceSession = {
      id: sessionId,
      classId: currentClass.id,
      className: currentClass.name,
      date: sessionDate,
      timeSlot: sessionTimeSlot,
      lessonTopic: sessionLessonTopic.trim() || undefined,
      records: draftRecords,
      totalStudents: currentSessionStats.total,
      presentCount: currentSessionStats.present,
      excusedCount: currentSessionStats.excused,
      unexcusedCount: currentSessionStats.unexcused,
      lateCount: currentSessionStats.late,
      attendanceRate: currentSessionStats.rate,
      updatedAt: new Date().toISOString(),
    };

    let updatedList: AttendanceSession[];
    if (existingSession) {
      updatedList = attendance.map(a => a.id === existingSession.id ? newSession : a);
    } else {
      updatedList = [newSession, ...attendance];
    }

    onSaveAttendance(updatedList);
    setSaveSuccessMsg('Đã lưu thành công dữ liệu điểm danh buổi học!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Export current session to Excel
  const handleExportSession = () => {
    if (!currentClass) return;
    const sessionToExport: AttendanceSession = {
      id: existingSession?.id || 'temp',
      classId: currentClass.id,
      className: currentClass.name,
      date: sessionDate,
      timeSlot: sessionTimeSlot,
      lessonTopic: sessionLessonTopic,
      records: draftRecords,
      totalStudents: currentSessionStats.total,
      presentCount: currentSessionStats.present,
      excusedCount: currentSessionStats.excused,
      unexcusedCount: currentSessionStats.unexcused,
      lateCount: currentSessionStats.late,
      attendanceRate: currentSessionStats.rate,
      updatedAt: new Date().toISOString(),
    };
    exportAttendanceSessionToExcel(sessionToExport, students);
  };

  // Export monthly/cumulative summary
  const handleExportSummary = () => {
    if (!currentClass) return;
    exportAttendanceSummaryToExcel(currentClass, students, attendance, 'Toàn bộ năm học');
  };

  // Filtered students for list display
  const displayedStudents = useMemo(() => {
    return classStudents.filter(st => {
      const matchSearch = st.fullName.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
                          st.studentCode.toLowerCase().includes(searchStudentTerm.toLowerCase());
      if (!matchSearch) return false;

      if (filterStatus === 'all') return true;
      const rec = draftRecords[st.id];
      const status = rec?.status || 'present';
      return status === filterStatus;
    });
  }, [classStudents, searchStudentTerm, filterStatus, draftRecords]);

  // All sessions of this class for History and Matrix
  const classSessions = useMemo(() => {
    if (!currentClass) return [];
    return attendance
      .filter(a => a.classId === currentClass.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, currentClass]);

  // Open notify absent modal
  const handleOpenNotifyModal = (st: Student, status: AttendanceStatus, note?: string) => {
    setNotifyTargetStudent(st);
    let defaultReason = '';
    if (status === 'excused') defaultReason = note || 'Vắng có phép (đã có đơn/liên hệ)';
    else if (status === 'unexcused') defaultReason = note || 'Vắng không phép';
    else if (status === 'late') defaultReason = note || 'Đi học muộn';
    setNotifyReason(defaultReason);
    setIsNotifyModalOpen(true);
  };

  // Absent notification template text
  const notificationText = useMemo(() => {
    if (!notifyTargetStudent || !currentClass) return '';
    const rec = draftRecords[notifyTargetStudent.id];
    const statusLabel = 
      rec?.status === 'excused' ? 'vắng có phép' :
      rec?.status === 'unexcused' ? 'vắng không rõ lý do' :
      rec?.status === 'late' ? 'đi học muộn' : 'nghỉ học';

    return `Kính gửi phụ huynh em ${notifyTargetStudent.fullName} (Lớp ${currentClass.name}): Hôm nay, ngày ${sessionDate} vào tiết môn Toán, em ${statusLabel} (${notifyReason || 'Chưa rõ lý do'}). Cô giáo Đoàn Thị Vui xin thông báo để gia đình cùng phối hợp nhắc nhở và quản lý tình hình học tập của em. Trân trọng!`;
  }, [notifyTargetStudent, currentClass, sessionDate, draftRecords, notifyReason]);

  const handleCopyNotification = () => {
    navigator.clipboard.writeText(notificationText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  // Quick create announcement from absent notice
  const handleCreateSystemAnnouncement = () => {
    if (!onAddAnnouncement || !notifyTargetStudent || !currentClass) return;
    const newAnnouncement: AnnouncementItem = {
      id: `ann-att-${Date.now()}`,
      title: `Nhắc nhở chuyên cần: Em ${notifyTargetStudent.fullName} (${currentClass.name})`,
      type: 'nhac_nho',
      targetClass: currentClass.name,
      content: notificationText,
      createdAt: new Date().toISOString().slice(0, 10),
      priority: 'trung_binh',
    };
    onAddAnnouncement(newAnnouncement);
    setIsNotifyModalOpen(false);
    setSaveSuccessMsg('Đã tạo thông báo nhắc nhở chuyên cần trên hệ thống!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 md:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                  Điểm danh & Theo dõi Chuyên cần
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Môn Toán
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Quản lý sĩ số lớp theo buổi, theo dõi học sinh vắng, và thống kê tỷ lệ chuyên cần THCS
              </p>
            </div>
          </div>

          {/* Quick Sub-tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('take')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeSubTab === 'take'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Điểm danh buổi dạy</span>
            </button>
            <button
              onClick={() => setActiveSubTab('summary')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeSubTab === 'summary'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Sổ tổng hợp chuyên cần</span>
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeSubTab === 'history'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lịch sử ({classSessions.length})</span>
            </button>
          </div>
        </div>

        {/* Class Selection Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Chọn lớp học:
          </span>
          {classes.map(c => {
            const isSelected = c.id === selectedClassId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#1565C0] text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.name} ({c.studentCount} HS)
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUB-TAB 1: TAKE ATTENDANCE (Điểm danh buổi dạy) */}
      {activeSubTab === 'take' && (
        <div className="space-y-6">
          {/* Session Configuration Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Ngày điểm danh
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Time slot / Session */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tiết học / Buổi học
                </label>
                <select
                  value={sessionTimeSlot}
                  onChange={(e) => setSessionTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="Tiết 1 (07:15 - 08:00)">Tiết 1 (07:15 - 08:00)</option>
                  <option value="Tiết 2 (08:15 - 09:00)">Tiết 2 (08:15 - 09:00)</option>
                  <option value="Tiết 3 (09:15 - 10:00)">Tiết 3 (09:15 - 10:00)</option>
                  <option value="Tiết 4 (10:15 - 11:00)">Tiết 4 (10:15 - 11:00)</option>
                  <option value="Tiết 5 (11:00 - 11:45)">Tiết 5 (11:00 - 11:45)</option>
                  <option value="Tiết 1 - 2 (13:30 - 15:00)">Tiết 1 - 2 (Chiều: 13:30 - 15:00)</option>
                  <option value="Tiết 3 - 4 (15:15 - 16:45)">Tiết 3 - 4 (Chiều: 15:15 - 16:45)</option>
                  <option value="Bồi dưỡng HSG / Phụ đạo">Bồi dưỡng HSG / Phụ đạo</option>
                </select>
              </div>

              {/* Lesson topic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nội dung / Bài học (PPCT)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sessionLessonTopic}
                    onChange={(e) => setSessionLessonTopic(e.target.value)}
                    placeholder="VD: Đại số: Phân tích đa thức thành nhân tử..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stat Bar for Current Session */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sĩ số lớp</span>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{currentSessionStats.total} HS</div>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Có mặt</span>
              </span>
              <div className="text-xl font-bold text-emerald-800 mt-0.5">{currentSessionStats.present}</div>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Vắng có phép</span>
              </span>
              <div className="text-xl font-bold text-amber-800 mt-0.5">{currentSessionStats.excused}</div>
            </div>

            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center space-x-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Vắng K.phép</span>
              </span>
              <div className="text-xl font-bold text-rose-800 mt-0.5">{currentSessionStats.unexcused}</div>
            </div>

            <div className="bg-orange-50/70 p-3.5 rounded-xl border border-orange-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                <span>Đi muộn</span>
              </span>
              <div className="text-xl font-bold text-orange-800 mt-0.5">{currentSessionStats.late}</div>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Tỷ lệ chuyên cần</span>
              <div className="text-xl font-bold text-blue-800 mt-0.5">{currentSessionStats.rate}%</div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search and Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px] flex-1 max-w-sm">
                <input
                  type="text"
                  value={searchStudentTerm}
                  onChange={(e) => setSearchStudentTerm(e.target.value)}
                  placeholder="Tìm học sinh theo tên hoặc mã HS..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center space-x-1 border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterStatus === 'all' ? 'bg-white shadow-2xs text-slate-800 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterStatus('present')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterStatus === 'present' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Có mặt
                </button>
                <button
                  onClick={() => setFilterStatus('excused')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterStatus === 'excused' ? 'bg-amber-500 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Vắng CP
                </button>
                <button
                  onClick={() => setFilterStatus('unexcused')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterStatus === 'unexcused' ? 'bg-rose-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Vắng KP
                </button>
                <button
                  onClick={() => setFilterStatus('late')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterStatus === 'late' ? 'bg-orange-500 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Muộn
                </button>
              </div>
            </div>

            {/* Buttons: Fast-all-present, Save, Export */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-2xs"
                title="Đánh dấu tất cả học sinh là Có mặt chỉ với 1 click"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Tất cả có mặt</span>
              </button>

              <button
                onClick={handleExportSession}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold transition-all"
                title="Tải sổ điểm danh buổi này thành file Excel"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Xuất Excel</span>
              </button>

              <button
                onClick={handleSaveCurrentSession}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Lưu điểm danh</span>
              </button>
            </div>
          </div>

          {/* Student Attendance List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            {classStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
                <p className="font-semibold text-slate-600">Lớp này hiện chưa có học sinh nào</p>
                <p className="text-xs text-slate-400 mt-1">Vui lòng thêm học sinh ở phân hệ "Học sinh" trước khi điểm danh.</p>
              </div>
            ) : displayedStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm">Không tìm thấy học sinh nào phù hợp với bộ lọc</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">STT</th>
                      <th className="py-3 px-4 w-28">Mã HS</th>
                      <th className="py-3 px-4 min-w-[180px]">Họ và tên</th>
                      <th className="py-3 px-4 min-w-[340px] text-center">Trạng thái điểm danh</th>
                      <th className="py-3 px-4 min-w-[220px]">Lý do / Ghi chú</th>
                      <th className="py-3 px-4 w-28 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {displayedStudents.map((st, idx) => {
                      const rec = draftRecords[st.id] || { status: 'present' };
                      const currentStatus = rec.status;
                      const isAbsent = currentStatus === 'excused' || currentStatus === 'unexcused' || currentStatus === 'late';

                      return (
                        <tr 
                          key={st.id} 
                          className={`hover:bg-slate-50/70 transition-colors ${
                            currentStatus === 'unexcused' ? 'bg-rose-50/30' :
                            currentStatus === 'excused' ? 'bg-amber-50/30' :
                            currentStatus === 'late' ? 'bg-orange-50/30' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center font-medium text-slate-400 text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">
                            {st.studentCode}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{st.fullName}</div>
                            {st.contactParent && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                PH: {st.contactParent}
                              </div>
                            )}
                          </td>
                          {/* 4 Status Choice Buttons */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70">
                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(st.id, 'present')}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Có mặt</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(st.id, 'excused')}
                                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'excused'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Vắng CP</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(st.id, 'unexcused')}
                                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'unexcused'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Vắng KP</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSetStudentStatus(st.id, 'late')}
                                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'late'
                                    ? 'bg-orange-500 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-orange-700 hover:bg-orange-50'
                                }`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Muộn</span>
                              </button>
                            </div>
                          </td>

                          {/* Reason / Note input */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={rec.note || ''}
                              onChange={(e) => handleSetStudentNote(st.id, e.target.value)}
                              placeholder={
                                currentStatus === 'excused' ? 'Lý do nghỉ (ốm, việc nhà...)' :
                                currentStatus === 'unexcused' ? 'Chưa rõ lý do...' :
                                currentStatus === 'late' ? 'Số phút / Lý do muộn...' : 'Ghi chú thêm...'
                              }
                              className={`w-full px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
                                isAbsent 
                                  ? 'border-amber-300 bg-amber-50/50 text-slate-800 focus:bg-white' 
                                  : 'border-slate-200 bg-slate-50 text-slate-600 focus:bg-white'
                              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            />
                          </td>

                          {/* Actions: Send message / Notice */}
                          <td className="py-3 px-4 text-center">
                            {isAbsent ? (
                              <button
                                onClick={() => handleOpenNotifyModal(st, currentStatus, rec.note)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-all shadow-2xs"
                                title="Soạn tin nhắn báo phụ huynh hoặc tạo nhắc nhở chuyên cần"
                              >
                                <Send className="w-3.5 h-3.5 text-rose-600" />
                                <span>Báo PH</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom floating bar */}
            <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
              <div>
                Đang hiển thị <strong>{displayedStudents.length}</strong> / <strong>{classStudents.length}</strong> học sinh lớp <strong>{currentClass?.name}</strong>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveCurrentSession}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu sổ điểm danh buổi học</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CUMULATIVE SUMMARY (Sổ tổng hợp chuyên cần) */}
      {activeSubTab === 'summary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Bảng Tổng hợp Chuyên cần Lớp {currentClass?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thống kê tổng số buổi học, số lượt vắng có phép, vắng không phép và tỷ lệ chuyên cần cả kỳ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSummary}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs md:text-sm font-semibold transition-all"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Xuất bảng tổng hợp Excel</span>
              </button>
            </div>
          </div>

          {/* Summary Matrix Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4 w-28">Mã HS</th>
                    <th className="py-3 px-4 min-w-[180px]">Họ và tên</th>
                    <th className="py-3 px-4 text-center text-emerald-700">Có mặt</th>
                    <th className="py-3 px-4 text-center text-amber-700">Vắng CP</th>
                    <th className="py-3 px-4 text-center text-rose-700">Vắng KP</th>
                    <th className="py-3 px-4 text-center text-orange-700">Đi muộn</th>
                    <th className="py-3 px-4 text-center">Tỷ lệ chuyên cần</th>
                    <th className="py-3 px-4 text-center min-w-[160px]">Đánh giá & Cảnh báo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((st, idx) => {
                    let presentCount = 0;
                    let excusedCount = 0;
                    let unexcusedCount = 0;
                    let lateCount = 0;

                    classSessions.forEach(sess => {
                      const rec = sess.records[st.id];
                      if (!rec || rec.status === 'present') presentCount++;
                      else if (rec.status === 'excused') excusedCount++;
                      else if (rec.status === 'unexcused') unexcusedCount++;
                      else if (rec.status === 'late') lateCount++;
                    });

                    const totalSessions = classSessions.length;
                    const computedRate = totalSessions > 0
                      ? Math.round(((presentCount + lateCount) / totalSessions) * 100)
                      : (st.attendanceRate || 100);

                    const isHighRisk = unexcusedCount >= 2 || (excusedCount + unexcusedCount) >= 4;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center font-medium text-slate-400 text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">
                          {st.studentCode}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{st.fullName}</div>
                          {st.contactParent && (
                            <div className="text-[11px] text-slate-400">{st.contactParent}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">
                          {presentCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-amber-600">
                          {excusedCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-rose-600">
                          {unexcusedCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-orange-600">
                          {lateCount}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  computedRate >= 95 ? 'bg-emerald-500' :
                                  computedRate >= 85 ? 'bg-blue-500' :
                                  computedRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                }`} 
                                style={{ width: `${computedRate}%` }}
                              />
                            </div>
                            <span className="font-bold text-xs text-slate-700">{computedRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isHighRisk ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 mr-1 text-rose-500" />
                              Cần nhắc nhở
                            </span>
                          ) : computedRate >= 95 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                              Chuyên cần tốt
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Bình thường</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HISTORY (Lịch sử các buổi điểm danh) */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Lịch sử Điểm danh Lớp {currentClass?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các buổi học đã được ghi nhận trong hệ thống
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Tổng số: {classSessions.length} buổi
            </span>
          </div>

          {classSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="font-semibold text-slate-600">Chưa có lịch sử điểm danh nào cho lớp {currentClass?.name}</p>
              <p className="text-xs text-slate-400 mt-1">Bấm sang tab "Điểm danh buổi dạy" để thực hiện điểm danh buổi đầu tiên.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classSessions.map(sess => (
                <div 
                  key={sess.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {sess.date}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{sess.timeSlot}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {sess.attendanceRate}% Chuyên cần
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-800 text-sm mb-3">
                      {sess.lessonTopic || 'Nội dung bài học theo phân phối chương trình'}
                    </h3>

                    {/* Stats pills */}
                    <div className="grid grid-cols-4 gap-2 text-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Có mặt</div>
                        <div className="font-bold text-emerald-700 text-sm">{sess.presentCount}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Vắng CP</div>
                        <div className="font-bold text-amber-600 text-sm">{sess.excusedCount}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Vắng KP</div>
                        <div className="font-bold text-rose-600 text-sm">{sess.unexcusedCount}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Muộn</div>
                        <div className="font-bold text-orange-600 text-sm">{sess.lateCount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => exportAttendanceSessionToExcel(sess, students)}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Excel</span>
                    </button>

                    <button
                      onClick={() => {
                        setSessionDate(sess.date);
                        if (sess.timeSlot) setSessionTimeSlot(sess.timeSlot);
                        if (sess.lessonTopic) setSessionLessonTopic(sess.lessonTopic);
                        setActiveSubTab('take');
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>Xem & Sửa lại</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: BÁO PHỤ HUYNH / GVCN KHI HỌC SINH VẮNG */}
      {isNotifyModalOpen && notifyTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Send className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">Thông báo tình hình chuyên cần</h3>
              </div>
              <button 
                onClick={() => setIsNotifyModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div><strong>Học sinh:</strong> {notifyTargetStudent.fullName} ({notifyTargetStudent.studentCode})</div>
                <div><strong>Lớp:</strong> {currentClass?.name} | <strong>Ngày:</strong> {sessionDate}</div>
                <div><strong>Phụ huynh:</strong> {notifyTargetStudent.contactParent || 'Chưa cập nhật số điện thoại'}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lý do ghi nhận
                </label>
                <input
                  type="text"
                  value={notifyReason}
                  onChange={(e) => setNotifyReason(e.target.value)}
                  placeholder="VD: Vắng không rõ lý do, mẹ gọi xin nghỉ..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Mẫu tin nhắn gửi Phụ huynh / GVCN (Zalo / SMS)
                  </label>
                  <button
                    onClick={handleCopyNotification}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMsg ? 'Đã sao chép!' : 'Sao chép tin nhắn'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={notificationText}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsNotifyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Đóng
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyNotification}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy tin nhắn</span>
                </button>
                {onAddAnnouncement && (
                  <button
                    type="button"
                    onClick={handleCreateSystemAnnouncement}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Lưu vào bảng thông báo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
