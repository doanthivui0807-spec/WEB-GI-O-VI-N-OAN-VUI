import React, { useState, useEffect } from 'react';
import { 
  getTeacherProfile, 
  saveTeacherProfile,
  getClasses, 
  saveClasses,
  getStudents, 
  saveStudents,
  getGrades, 
  saveGrades,
  getSchedule, 
  saveSchedule,
  getAnnouncements, 
  saveAnnouncements,
  getDocuments, 
  saveDocuments,
  getAttendance,
  saveAttendance,
  isSampleMode, 
  setSampleMode,
  resetToSampleData,
  clearToRealData
} from './utils/storage';
import { 
  TeacherProfile, 
  ClassItem, 
  Student, 
  GradeRecord, 
  ScheduleItem, 
  AnnouncementItem, 
  DocumentItem, 
  AttendanceSession,
  ActiveTab 
} from './types';


import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Overview } from './components/Overview';
import { ClassesModule } from './components/ClassesModule';
import { StudentsModule } from './components/StudentsModule';
import { AttendanceModule } from './components/AttendanceModule';
import { ProgressModule } from './components/ProgressModule';
import { GradingModule } from './components/GradingModule';
import { MaterialsModule } from './components/MaterialsModule';
import { AnnouncementsModule } from './components/AnnouncementsModule';
import { SettingsModule } from './components/SettingsModule';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ScheduleModal } from './components/ScheduleModal';
import { Sparkles, Plus, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSample, setIsSample] = useState<boolean>(isSampleMode());

  // Platform states
  const [profile, setProfile] = useState<TeacherProfile>(getTeacherProfile());
  const [classes, setClasses] = useState<ClassItem[]>(getClasses());
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [grades, setGrades] = useState<GradeRecord[]>(getGrades());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(getSchedule());
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(getAnnouncements());
  const [documents, setDocuments] = useState<DocumentItem[]>(getDocuments());
  const [attendance, setAttendance] = useState<AttendanceSession[]>(getAttendance());

  // Deep link or navigation parameters
  const [selectedClassIdForNav, setSelectedClassIdForNav] = useState<string | undefined>(undefined);

  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  // Add Class Form state (for Overview quick-add)
  const [newClassForm, setNewClassForm] = useState({
    name: '',
    gradeLevel: 8,
    academicYear: '2026–2027',
    homeroomTeacher: 'Đoàn Thị Vui',
    status: 'Đang học' as const,
    notes: '',
  });

  // Re-sync listener
  const syncFromStorage = () => {
    setProfile(getTeacherProfile());
    setClasses(getClasses());
    setStudents(getStudents());
    setGrades(getGrades());
    setSchedule(getSchedule());
    setAnnouncements(getAnnouncements());
    setDocuments(getDocuments());
    setAttendance(getAttendance());
    setIsSample(isSampleMode());
  };


  useEffect(() => {
    window.addEventListener('math_app_data_changed', syncFromStorage);
    return () => {
      window.removeEventListener('math_app_data_changed', syncFromStorage);
    };
  }, []);

  const handleNavigate = (tab: ActiveTab, filterClassId?: string) => {
    if (filterClassId) {
      setSelectedClassIdForNav(filterClassId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSampleMode = () => {
    if (isSample) {
      clearToRealData();
    } else {
      resetToSampleData();
    }
    syncFromStorage();
  };

  const handleOpenAIWithPrompt = (prompt: string) => {
    setAiInitialPrompt(prompt);
    setIsAIModalOpen(true);
  };

  const handleStudentAISuggestion = (student: Student, grade?: GradeRecord) => {
    const prompt = `Học sinh: ${student.fullName} (Lớp: ${student.className}, Mã: ${student.studentCode}).
Điểm hiện tại: TX1: ${grade?.tx1 ?? '--'}, TX2: ${grade?.tx2 ?? '--'}, GK: ${grade?.gk ?? '--'}, ĐTB: ${grade?.dtb ?? '--'}.
Điểm mạnh: ${student.strengths || 'Chưa rõ'}.
Khó khăn cần hỗ trợ: ${student.weaknesses || 'Cần cải thiện kỹ năng tính toán và hình học'}.
Xin cô hãy phân tích và gợi ý cho tôi 3 bước sư phạm thiết thực để kèm cặp, khích lệ em tiến bộ trong các tiết Toán tới.`;
    handleOpenAIWithPrompt(prompt);
  };

  const handleCreateClassFromOverview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassForm.name) return;

    const newClass: ClassItem = {
      id: 'cls_' + Date.now(),
      name: newClassForm.name,
      gradeLevel: Number(newClassForm.gradeLevel) as 6 | 7 | 8 | 9,
      academicYear: newClassForm.academicYear,
      studentCount: 0,
      homeroomTeacher: newClassForm.homeroomTeacher,
      status: newClassForm.status,
      notes: newClassForm.notes,
      averageScore: 0,
    };

    const updated = [...classes, newClass];
    saveClasses(updated);
    setClasses(updated);
    setIsAddClassModalOpen(false);
    setNewClassForm({
      name: '',
      gradeLevel: 8,
      academicYear: '2026–2027',
      homeroomTeacher: 'Đoàn Thị Vui',
      status: 'Đang học',
      notes: '',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FC] font-serif antialiased text-slate-800">
      {/* 1. Header Bar */}
      <Header
        profile={profile}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        isSample={isSample}
        onToggleSample={handleToggleSampleMode}
        unreadAnnouncementsCount={announcements.length}
        onOpenAI={() => {
          setAiInitialPrompt('');
          setIsAIModalOpen(true);
        }}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* 2. Main Layout: Left Sidebar + Center Dashboard Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto">
          {activeTab === 'overview' && (
            <Overview
              profile={profile}
              classes={classes}
              students={students}
              grades={grades}
              schedule={schedule}
              announcements={announcements}
              onNavigate={handleNavigate}
              onOpenAddClass={() => setIsAddClassModalOpen(true)}
              onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesModule
              classes={classes}
              students={students}
              grades={grades}
              onSaveClasses={(cls) => {
                saveClasses(cls);
                setClasses(cls);
              }}
              onSaveStudents={(sts) => {
                saveStudents(sts);
                setStudents(sts);
              }}
              onNavigate={handleNavigate}
              selectedClassId={selectedClassIdForNav}
            />
          )}

          {activeTab === 'students' && (
            <StudentsModule
              students={students}
              classes={classes}
              grades={grades}
              onSaveStudents={(sts) => {
                saveStudents(sts);
                setStudents(sts);
              }}
              onRequestAISuggestion={handleStudentAISuggestion}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceModule
              classes={classes}
              students={students}
              attendance={attendance}
              onSaveAttendance={(updatedAttendance) => {
                saveAttendance(updatedAttendance);
                setAttendance(updatedAttendance);
              }}
              onAddAnnouncement={(newAnn) => {
                const updated = [newAnn, ...announcements];
                saveAnnouncements(updated);
                setAnnouncements(updated);
              }}
              selectedClassIdForNav={selectedClassIdForNav}
            />
          )}

          {activeTab === 'progress' && (

            <ProgressModule
              classes={classes}
              students={students}
              grades={grades}
              onNavigateToGrading={(cId) => handleNavigate('grading', cId)}
              onRequestAISuggestion={handleStudentAISuggestion}
              onRequestClassAIAdvice={(cName, stats) => {
                const prompt = `Phân tích mặt bằng điểm số môn Toán của các lớp: ${JSON.stringify(stats)}. Hãy gợi ý biện pháp cân bằng chất lượng giữa các khối lớp.`;
                handleOpenAIWithPrompt(prompt);
              }}
            />
          )}

          {activeTab === 'grading' && (
            <GradingModule
              profile={profile}
              classes={classes}
              students={students}
              grades={grades}
              onSaveGrades={(grs) => {
                saveGrades(grs);
                setGrades(grs);
              }}
              initialClassId={selectedClassIdForNav}
              onRequestAISuggestion={handleOpenAIWithPrompt}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsModule
              documents={documents}
              onSaveDocuments={(docs) => {
                saveDocuments(docs);
                setDocuments(docs);
              }}
              onRequestAILessonPlan={(grade, topic) => {
                const prompt = `Hãy soạn Kế hoạch bài dạy (Giáo án) môn Toán lớp ${grade} theo chuẩn Công văn 5512/BGDĐT. Chuyên đề: "${topic}". Gồm 4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập phân hóa, Vận dụng thực tế.`;
                handleOpenAIWithPrompt(prompt);
              }}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsModule
              profile={profile}
              classes={classes}
              announcements={announcements}
              onSaveAnnouncements={(ans) => {
                saveAnnouncements(ans);
                setAnnouncements(ans);
              }}
              onRequestAISuggestion={handleOpenAIWithPrompt}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsModule
              profile={profile}
              onSaveProfile={(prof) => {
                saveTeacherProfile(prof);
                setProfile(prof);
              }}
              onDataReset={syncFromStorage}
            />
          )}
        </main>
      </div>

      {/* 3. Footer */}
      <Footer profile={profile} />

      {/* Floating Action Button for AI Assistant - Cô Vui */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setAiInitialPrompt('');
            setIsAIModalOpen(true);
          }}
          className="relative group flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0B2D59] via-[#1565C0] to-[#2196F3] text-white shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border-2 border-white/60"
          title="Mở Trợ lý AI Toán học – Cô Vui"
        >
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
          <span className="w-3 h-3 rounded-full bg-emerald-400 absolute -top-1 -right-1" />
          
          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
          </div>

          <div className="text-left hidden sm:block pr-1">
            <div className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider leading-none">
              TRỢ LÝ AI TOÁN HỌC
            </div>
            <div className="text-xs font-bold leading-tight font-serif">
              CÔ VUI (GDPT 2018)
            </div>
          </div>
        </button>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        profile={profile}
        initialPrompt={aiInitialPrompt}
      />

      {/* Schedule Manager Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        schedule={schedule}
        onSaveSchedule={(items) => {
          saveSchedule(items);
          setSchedule(items);
        }}
      />

      {/* Quick Add Class Modal (from Overview) */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                Thêm lớp học môn Toán
              </h3>
              <button onClick={() => setIsAddClassModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateClassFromOverview} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên lớp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 8A5, 9A4, Toán 7, Toán 8 nâng cao..."
                  value={newClassForm.name}
                  onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={newClassForm.gradeLevel}
                    onChange={(e) => setNewClassForm({ ...newClassForm, gradeLevel: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    <option value={6}>Khối 6</option>
                    <option value={7}>Khối 7</option>
                    <option value={8}>Khối 8</option>
                    <option value={9}>Khối 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm học</label>
                  <input
                    type="text"
                    value={newClassForm.academicYear}
                    onChange={(e) => setNewClassForm({ ...newClassForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo viên phụ trách</label>
                <input
                  type="text"
                  value={newClassForm.homeroomTeacher}
                  onChange={(e) => setNewClassForm({ ...newClassForm, homeroomTeacher: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú mục tiêu lớp</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về đặc thù học tập của lớp..."
                  value={newClassForm.notes}
                  onChange={(e) => setNewClassForm({ ...newClassForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1565C0] text-white font-bold shadow-xs"
                >
                  Thêm lớp ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
