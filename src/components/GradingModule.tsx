import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  FileSpreadsheet, 
  Save, 
  Plus, 
  Filter, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ClassItem, Student, GradeRecord, TeacherProfile } from '../types';
import { calculateAverage, classifyGrade } from '../utils/mathGrade';
import { exportGradeSheetToExcel } from '../utils/excel';

interface GradingModuleProps {
  profile: TeacherProfile;
  classes: ClassItem[];
  students: Student[];
  grades: GradeRecord[];
  onSaveGrades: (grades: GradeRecord[]) => void;
  initialClassId?: string;
  onRequestAISuggestion?: (prompt: string) => void;
}

export const GradingModule: React.FC<GradingModuleProps> = ({
  profile,
  classes,
  students,
  grades,
  onSaveGrades,
  initialClassId,
  onRequestAISuggestion,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const [selectedSemester, setSelectedSemester] = useState<'Học kỳ I' | 'Học kỳ II'>('Học kỳ I');
  const [showTX4, setShowTX4] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string>('Đã đồng bộ');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // New assessment test form modal
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [testForm, setTestForm] = useState({
    title: 'Kiểm tra thường xuyên 15 phút - Đại số',
    date: new Date().toISOString().slice(0, 10),
    type: 'TX' as 'TX' | 'GK' | 'CK',
    format: 'Trắc nghiệm kết hợp tự luận',
  });

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === activeClass?.id);

  // Local editable copy of grades for current class and semester
  const [localGradesMap, setLocalGradesMap] = useState<Record<string, Partial<GradeRecord>>>({});

  // Initialize or synchronize local copy when class or semester changes
  useEffect(() => {
    const map: Record<string, Partial<GradeRecord>> = {};
    classStudents.forEach((st) => {
      const existing = grades.find(
        (g) => g.studentId === st.id && g.semester === selectedSemester
      );
      if (existing) {
        map[st.id] = { ...existing };
      } else {
        map[st.id] = {
          id: 'g_' + st.id + '_' + selectedSemester.replace(/\s+/g, ''),
          studentId: st.id,
          classId: activeClass?.id,
          semester: selectedSemester,
          academicYear: '2026–2027',
          tx1: null,
          tx2: null,
          tx3: null,
          tx4: null,
          gk: null,
          ck: null,
          dtb: null,
          classification: undefined,
          notes: '',
        };
      }
    });
    setLocalGradesMap(map);
  }, [selectedClassId, selectedSemester, students]);

  // Handle cell edit
  const handleScoreChange = (
    studentId: string,
    field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck',
    rawValue: string
  ) => {
    let numVal: number | null = null;
    if (rawValue.trim() !== '') {
      const parsed = parseFloat(rawValue.replace(',', '.'));
      if (isNaN(parsed) || parsed < 0 || parsed > 10) {
        return; // reject invalid input out of 0-10 bounds
      }
      numVal = Math.round(parsed * 10) / 10;
    }

    const currentRecord = localGradesMap[studentId] || {};
    const updatedRecord = { ...currentRecord, [field]: numVal };

    // Auto-calculate ĐTB
    const newDTB = calculateAverage(updatedRecord);
    const newClass = classifyGrade(newDTB);

    updatedRecord.dtb = newDTB;
    updatedRecord.classification = newClass as any;

    const newMap = {
      ...localGradesMap,
      [studentId]: updatedRecord,
    };
    setLocalGradesMap(newMap);

    // Auto-save to parent / storage
    triggerAutoSave(newMap);
  };

  const triggerAutoSave = (newMap: Record<string, Partial<GradeRecord>>) => {
    setIsSaving(true);
    setSaveStatus('Đang lưu...');

    // Merge into global grades list
    const updatedGlobal = [...grades];
    Object.values(newMap).forEach((rec) => {
      if (!rec.studentId) return;
      const index = updatedGlobal.findIndex(
        (g) => g.studentId === rec.studentId && g.semester === selectedSemester
      );
      if (index >= 0) {
        updatedGlobal[index] = { ...updatedGlobal[index], ...rec } as GradeRecord;
      } else {
        updatedGlobal.push(rec as GradeRecord);
      }
    });

    onSaveGrades(updatedGlobal);
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('Đã tự động lưu lúc ' + new Date().toLocaleTimeString('vi-VN'));
    }, 400);
  };

  // Grade Statistics for active class
  const classGradeRecords = Object.values(localGradesMap);
  const scoredDTBList = classGradeRecords
    .map((r) => r.dtb)
    .filter((d): d is number => d != null && !isNaN(d));

  const highestScore = scoredDTBList.length > 0 ? Math.max(...scoredDTBList) : 0;
  const lowestScore = scoredDTBList.length > 0 ? Math.min(...scoredDTBList) : 0;
  const classAvg =
    scoredDTBList.length > 0
      ? scoredDTBList.reduce((acc, v) => acc + v, 0) / scoredDTBList.length
      : 0;

  const countGioi = scoredDTBList.filter((s) => s >= 8.0).length;
  const countKha = scoredDTBList.filter((s) => s >= 6.5 && s < 8.0).length;
  const countDat = scoredDTBList.filter((s) => s >= 5.0 && s < 6.5).length;
  const countChuaDat = scoredDTBList.filter((s) => s < 5.0).length;

  const handleExportExcel = () => {
    if (!activeClass) return;
    const globalGradesList = Object.values(localGradesMap) as GradeRecord[];
    exportGradeSheetToExcel(
      activeClass,
      students,
      globalGradesList,
      selectedSemester,
      profile.academicYear,
      profile.name,
      profile.school
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-6 h-6 text-[#1565C0]" />
            <h2 className="text-xl font-extrabold text-[#0B2D59] font-serif">
              Bảng điểm Kiểm tra – Đánh giá Môn Toán
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Giao diện nhập điểm giống Excel, tự động lưu ngay khi chỉnh sửa, tính ĐTB theo chuẩn Thông tư 22
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Indicator */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{saveStatus}</span>
          </div>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>XUẤT BẢNG ĐIỂM EXCEL</span>
          </button>

          <button
            onClick={() => setShowCreateTestModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B2D59] text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo cột bài kiểm tra mới</span>
          </button>
        </div>
      </div>

      {/* Class & Semester Selector Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600">Lớp:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-[#0B2D59] outline-none focus:ring-1 focus:ring-blue-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} (Khối {c.gradeLevel})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600">Học kỳ:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Học kỳ I">Học kỳ I</option>
              <option value="Học kỳ II">Học kỳ II</option>
            </select>
          </div>

          <button
            onClick={() => setShowTX4(!showTX4)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
          >
            {showTX4 ? 'Ẩn cột TX4' : 'Hiện thêm cột TX4'}
          </button>
        </div>

        <div className="text-[11px] text-slate-500 italic">
          💡 Công thức: ĐTB = (Tổng TX + 2×GK + 3×CK) / (Số TX + 5)
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">ĐTB của lớp</span>
          <div className="text-xl font-black text-[#0B2D59] mt-1 font-serif">
            {classAvg > 0 ? classAvg.toFixed(1) : '--'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Điểm cao nhất</span>
          <div className="text-xl font-black text-emerald-700 mt-1 font-serif">
            {highestScore > 0 ? highestScore.toFixed(1) : '--'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Điểm thấp nhất</span>
          <div className="text-xl font-black text-rose-600 mt-1 font-serif">
            {lowestScore > 0 ? lowestScore.toFixed(1) : '--'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase">Tốt (≥ 8.0)</span>
          <div className="text-xl font-black text-emerald-700 mt-1 font-serif">
            {countGioi} <span className="text-xs font-normal">HS</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-800 uppercase">Khá (6.5-7.9)</span>
          <div className="text-xl font-black text-blue-700 mt-1 font-serif">
            {countKha} <span className="text-xs font-normal">HS</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase">Đạt (5.0-6.4)</span>
          <div className="text-xl font-black text-amber-700 mt-1 font-serif">
            {countDat} <span className="text-xs font-normal">HS</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-800 uppercase">Chưa đạt (&lt; 5.0)</span>
          <div className="text-xl font-black text-rose-700 mt-1 font-serif">
            {countChuaDat} <span className="text-xs font-normal">HS</span>
          </div>
        </div>
      </div>

      {/* Excel-like Grade Entry Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#0B2D59] font-serif text-sm">
              Sổ điểm chi tiết lớp {activeClass?.name} ({classStudents.length} học sinh)
            </span>
          </div>
          <span className="text-slate-400 italic">
            * Bấm vào ô điểm để nhập điểm (hỗ trợ phím Tab hoặc Enter để chuyển ô)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0B2D59] text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-2 text-center w-12 border-r border-sky-800">STT</th>
                <th className="py-2.5 px-3 border-r border-sky-800 w-28">Mã HS</th>
                <th className="py-2.5 px-4 border-r border-sky-800 min-w-44">Họ và tên</th>
                <th className="py-2.5 px-2 text-center border-r border-sky-800 w-16 bg-blue-900/60">TX1</th>
                <th className="py-2.5 px-2 text-center border-r border-sky-800 w-16 bg-blue-900/60">TX2</th>
                <th className="py-2.5 px-2 text-center border-r border-sky-800 w-16 bg-blue-900/60">TX3</th>
                {showTX4 && (
                  <th className="py-2.5 px-2 text-center border-r border-sky-800 w-16 bg-blue-900/60">TX4</th>
                )}
                <th className="py-2.5 px-2 text-center border-r border-sky-800 w-24 bg-amber-700/80">GK (x2)</th>
                <th className="py-2.5 px-2 text-center border-r border-sky-800 w-24 bg-blue-800/80">CK (x3)</th>
                <th className="py-2.5 px-2 text-center border-r border-sky-800 w-20 bg-indigo-900">ĐTB</th>
                <th className="py-2.5 px-3 border-r border-sky-800 w-24 text-center">Xếp loại</th>
                <th className="py-2.5 px-3 min-w-40">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {classStudents.map((st, idx) => {
                const rec = localGradesMap[st.id] || {};
                return (
                  <tr key={st.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-2 px-2 text-center font-bold text-slate-400 border-r border-slate-100 bg-slate-50/50">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 border-r border-slate-100 font-semibold">
                      {st.studentCode}
                    </td>
                    <td className="py-2 px-4 font-bold text-[#0B2D59] border-r border-slate-100">
                      {st.fullName}
                    </td>

                    {/* TX1 */}
                    <td className="p-0 border-r border-slate-100">
                      <input
                        type="text"
                        value={rec.tx1 !== undefined && rec.tx1 !== null ? rec.tx1 : ''}
                        placeholder="--"
                        onChange={(e) => handleScoreChange(st.id, 'tx1', e.target.value)}
                        className="w-full py-2 px-1 text-center font-bold text-slate-800 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    {/* TX2 */}
                    <td className="p-0 border-r border-slate-100">
                      <input
                        type="text"
                        value={rec.tx2 !== undefined && rec.tx2 !== null ? rec.tx2 : ''}
                        placeholder="--"
                        onChange={(e) => handleScoreChange(st.id, 'tx2', e.target.value)}
                        className="w-full py-2 px-1 text-center font-bold text-slate-800 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    {/* TX3 */}
                    <td className="p-0 border-r border-slate-100">
                      <input
                        type="text"
                        value={rec.tx3 !== undefined && rec.tx3 !== null ? rec.tx3 : ''}
                        placeholder="--"
                        onChange={(e) => handleScoreChange(st.id, 'tx3', e.target.value)}
                        className="w-full py-2 px-1 text-center font-bold text-slate-800 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    {/* TX4 */}
                    {showTX4 && (
                      <td className="p-0 border-r border-slate-100">
                        <input
                          type="text"
                          value={rec.tx4 !== undefined && rec.tx4 !== null ? rec.tx4 : ''}
                          placeholder="--"
                          onChange={(e) => handleScoreChange(st.id, 'tx4', e.target.value)}
                          className="w-full py-2 px-1 text-center font-bold text-slate-800 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {/* GK */}
                    <td className="p-0 border-r border-slate-100 bg-amber-50/40">
                      <input
                        type="text"
                        value={rec.gk !== undefined && rec.gk !== null ? rec.gk : ''}
                        placeholder="--"
                        onChange={(e) => handleScoreChange(st.id, 'gk', e.target.value)}
                        className="w-full py-2 px-1 text-center font-extrabold text-amber-900 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </td>

                    {/* CK */}
                    <td className="p-0 border-r border-slate-100 bg-blue-50/40">
                      <input
                        type="text"
                        value={rec.ck !== undefined && rec.ck !== null ? rec.ck : ''}
                        placeholder="--"
                        onChange={(e) => handleScoreChange(st.id, 'ck', e.target.value)}
                        className="w-full py-2 px-1 text-center font-extrabold text-blue-900 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    {/* ĐTB */}
                    <td className="py-2 px-2 text-center font-extrabold font-serif text-sm border-r border-slate-100 bg-slate-50">
                      {rec.dtb != null ? (
                        <span className={
                          rec.dtb >= 8 ? 'text-emerald-700' :
                          rec.dtb >= 6.5 ? 'text-blue-700' :
                          rec.dtb >= 5 ? 'text-amber-700' : 'text-rose-600'
                        }>
                          {rec.dtb.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>

                    {/* Classification */}
                    <td className="py-2 px-3 text-center border-r border-slate-100">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.classification === 'Tốt'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rec.classification === 'Khá'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : rec.classification === 'Đạt'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : rec.classification === 'Chưa đạt'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'text-slate-400'
                      }`}>
                        {rec.classification || 'Chưa đủ điểm'}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="p-0">
                      <input
                        type="text"
                        placeholder="Ghi chú bài làm..."
                        value={rec.notes || ''}
                        onChange={(e) => {
                          const updated = { ...rec, notes: e.target.value };
                          const newMap = { ...localGradesMap, [st.id]: updated };
                          setLocalGradesMap(newMap);
                          triggerAutoSave(newMap);
                        }}
                        className="w-full py-2 px-3 text-xs text-slate-600 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tạo cột bài kiểm tra mới */}
      {showCreateTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                Tạo bài kiểm tra môn Toán
              </h3>
              <button onClick={() => setShowCreateTestModal(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên bài kiểm tra</label>
                <input
                  type="text"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại điểm</label>
                  <select
                    value={testForm.type}
                    onChange={(e) => setTestForm({ ...testForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    <option value="TX">Thường xuyên (TX)</option>
                    <option value="GK">Giữa kỳ (GK - x2)</option>
                    <option value="CK">Cuối kỳ (CK - x3)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày kiểm tra</label>
                  <input
                    type="date"
                    value={testForm.date}
                    onChange={(e) => setTestForm({ ...testForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hình thức kiểm tra</label>
                <input
                  type="text"
                  value={testForm.format}
                  onChange={(e) => setTestForm({ ...testForm, format: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowCreateTestModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowTX4(true);
                    setShowCreateTestModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#1565C0] text-white font-bold"
                >
                  Xác nhận tạo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
