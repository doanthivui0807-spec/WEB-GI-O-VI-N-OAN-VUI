import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  BarChart3, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  User, 
  ArrowUpRight, 
  ArrowDownRight,
  Sliders
} from 'lucide-react';
import { Student, ClassItem, GradeRecord } from '../types';
import { assessProgress } from '../utils/mathGrade';
import { StudentDetailModal } from './StudentDetailModal';

interface ProgressModuleProps {
  classes: ClassItem[];
  students: Student[];
  grades: GradeRecord[];
  onNavigateToGrading: (classId?: string) => void;
  onRequestAISuggestion?: (student: Student, grade?: GradeRecord) => void;
  onRequestClassAIAdvice?: (className: string, stats: any) => void;
}

export const ProgressModule: React.FC<ProgressModuleProps> = ({
  classes,
  students,
  grades,
  onNavigateToGrading,
  onRequestAISuggestion,
  onRequestClassAIAdvice,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [thresholdScore, setThresholdScore] = useState<number>(5.0);
  const [activeTab, setActiveTab] = useState<'all' | 'need_help' | 'progressing' | 'comparison'>('all');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Class filter
  const currentStudents = students.filter(
    (s) => selectedClassId === 'all' || s.classId === selectedClassId
  );

  // Grade evaluations
  const studentEvaluations = currentStudents.map((st) => {
    const gr: Partial<GradeRecord> = grades.find((g) => g.studentId === st.id) || {};
    const assessment = assessProgress(gr);
    const hasLowScore = (gr.dtb != null && gr.dtb < thresholdScore) || 
      (gr.tx1 != null && gr.tx1 < thresholdScore) || 
      (gr.gk != null && gr.gk < thresholdScore) || 
      (gr.ck != null && gr.ck < thresholdScore);

    const isDeclining = assessment.status === 'Cần hỗ trợ';
    const isProgressing = assessment.status === 'Tiến bộ vượt bậc' || assessment.status === 'Có tiến bộ';

    return {
      student: st,
      grade: gr as GradeRecord,
      assessment,
      hasLowScore,
      isDeclining,
      isProgressing,
      needsAttention: hasLowScore || isDeclining || (st.notes && st.notes.toLowerCase().includes('quan tâm')),
    };
  });

  const needAttentionList = studentEvaluations.filter((item) => item.needsAttention);
  const progressingList = studentEvaluations.filter((item) => item.isProgressing);

  // Class comparison metrics
  const classAverages = classes.map((cls) => {
    const cGrades = grades.filter((g) => g.classId === cls.id && g.dtb != null);
    const sum = cGrades.reduce((acc, g) => acc + (g.dtb || 0), 0);
    const avg = cGrades.length > 0 ? sum / cGrades.length : 0;
    return {
      className: cls.name,
      avg: Math.round(avg * 10) / 10,
      count: cGrades.length,
      gradeLevel: cls.gradeLevel,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-[#1565C0]" />
            <h2 className="text-xl font-extrabold text-[#0B2D59] font-serif">
              Theo dõi Tiến độ & Phát hiện Học sinh cần hỗ trợ
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích xu hướng qua các bài kiểm tra thường xuyên, giữa kỳ và cuối kỳ theo định hướng phát triển phẩm chất, năng lực
          </p>
        </div>

        {/* Threshold setting & AI recommendation */}
        <div className="flex items-center space-x-3 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-1.5 font-bold text-slate-700">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Ngưỡng cảnh báo:</span>
          </div>
          <select
            value={thresholdScore}
            onChange={(e) => setThresholdScore(parseFloat(e.target.value))}
            className="px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-rose-600 outline-none"
          >
            <option value={4.5}>Dưới 4.5</option>
            <option value={5.0}>Dưới 5.0 (Chuẩn Đạt)</option>
            <option value={5.5}>Dưới 5.5</option>
            <option value={6.5}>Dưới 6.5 (Khá)</option>
          </select>
        </div>
      </div>

      {/* 4 Stat Overview for Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div 
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === 'all' ? 'bg-[#0B2D59] text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="font-bold uppercase tracking-wider text-[10px] opacity-80">Tổng số học sinh</div>
          <div className="text-2xl font-black font-serif mt-1">{currentStudents.length}</div>
          <div className="text-[11px] opacity-90 mt-1">Đang theo dõi tiến độ</div>
        </div>

        <div 
          onClick={() => setActiveTab('progressing')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === 'progressing' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[10px] opacity-90">Có tiến bộ vượt bậc</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-serif mt-1 text-emerald-300">{progressingList.length}</div>
          <div className="text-[11px] opacity-90 mt-1">Điểm số tăng qua các bài kiểm tra</div>
        </div>

        <div 
          onClick={() => setActiveTab('need_help')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === 'need_help' ? 'bg-rose-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[10px] opacity-90">Cần hỗ trợ & kèm cặp</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-serif mt-1 text-amber-200">{needAttentionList.length}</div>
          <div className="text-[11px] opacity-90 mt-1">Điểm &lt; {thresholdScore} hoặc bị giảm điểm</div>
        </div>

        <div 
          onClick={() => setActiveTab('comparison')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === 'comparison' ? 'bg-indigo-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[10px] opacity-90">So sánh các lớp</span>
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-serif mt-1">{classes.length}</div>
          <div className="text-[11px] opacity-90 mt-1">Đối chiếu mặt bằng chung</div>
        </div>
      </div>

      {/* Tab Filter & Class Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-600">Xem theo lớp:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả lớp học</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('need_help')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'need_help' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>XEM DANH SÁCH CẦN HỖ TRỢ ({needAttentionList.length})</span>
          </button>
        </div>
      </div>

      {/* View: Comparison Between Classes */}
      {activeTab === 'comparison' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                So sánh điểm trung bình giữa các lớp Toán
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mặt bằng điểm số đánh giá giữa kỳ và thường xuyên của các khối
              </p>
            </div>

            <button
              onClick={() => onRequestClassAIAdvice?.('Mặt bằng chung các lớp', classAverages)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold text-xs shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI phân tích & đề xuất phương án</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classAverages.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B2D59] text-base">{c.className}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                    Khối {c.gradeLevel}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Điểm trung bình lớp:</span>
                  <span className={`text-2xl font-black font-serif ${
                    c.avg >= 8 ? 'text-emerald-700' : c.avg >= 6.5 ? 'text-blue-700' : 'text-amber-700'
                  }`}>
                    {c.avg.toFixed(1)}
                  </span>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      c.avg >= 8 ? 'bg-emerald-500' : c.avg >= 6.5 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (c.avg / 10) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Student Progress Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-[#0B2D59] text-sm font-serif">
            {activeTab === 'need_help'
              ? `Danh sách học sinh cần quan tâm & hỗ trợ (${needAttentionList.length} em)`
              : activeTab === 'progressing'
              ? `Danh sách học sinh tiến bộ tích cực (${progressingList.length} em)`
              : `Toàn bộ tiến độ học sinh (${studentEvaluations.length} em)`}
          </div>
          <span className="text-xs text-slate-500 italic">
            * Nhấn vào dòng học sinh để xem biểu đồ chi tiết
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B2D59]/5 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Học sinh</th>
                <th className="py-2.5 px-2">Lớp</th>
                <th className="py-2.5 px-2 text-center">TX1</th>
                <th className="py-2.5 px-2 text-center">TX2</th>
                <th className="py-2.5 px-2 text-center">TX3</th>
                <th className="py-2.5 px-2 text-center">Giữa kỳ</th>
                <th className="py-2.5 px-2 text-center">Cuối kỳ</th>
                <th className="py-2.5 px-2 text-center">ĐTB</th>
                <th className="py-2.5 px-3">Đánh giá tiến bộ</th>
                <th className="py-2.5 px-3 text-right">Hỗ trợ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(activeTab === 'need_help' ? needAttentionList : activeTab === 'progressing' ? progressingList : studentEvaluations).map((item, idx) => {
                const { student, grade, assessment } = item;
                return (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudentForDetail(student)}
                    className="hover:bg-sky-50/40 transition cursor-pointer group"
                  >
                    <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0B2D59] group-hover:text-[#1565C0]">
                        {student.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{student.studentCode}</div>
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-700">{student.className}</td>
                    <td className="py-3 px-2 text-center">{grade?.tx1 ?? '--'}</td>
                    <td className="py-3 px-2 text-center">{grade?.tx2 ?? '--'}</td>
                    <td className="py-3 px-2 text-center">{grade?.tx3 ?? '--'}</td>
                    <td className="py-3 px-2 text-center font-bold text-amber-900 bg-amber-50/30">
                      {grade?.gk ?? '--'}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-blue-900 bg-blue-50/30">
                      {grade?.ck ?? '--'}
                    </td>
                    <td className="py-3 px-2 text-center font-bold font-serif text-sm">
                      {grade?.dtb != null ? (
                        <span className={grade.dtb >= 8 ? 'text-emerald-700' : grade.dtb >= 6.5 ? 'text-blue-700' : grade.dtb >= 5 ? 'text-amber-700' : 'text-rose-600 font-extrabold'}>
                          {grade.dtb.toFixed(1)}
                        </span>
                      ) : '--'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${assessment.color}`}>
                        {assessment.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRequestAISuggestion?.(student, grade)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200 transition"
                      >
                        <Sparkles className="w-3 h-3 inline mr-1 text-amber-600" />
                        Gợi ý AI
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Student Detail Modal */}
      {selectedStudentForDetail && (
        <StudentDetailModal
          student={selectedStudentForDetail}
          grade={grades.find((g) => g.studentId === selectedStudentForDetail.id)}
          onClose={() => setSelectedStudentForDetail(null)}
          onRequestAISuggestion={onRequestAISuggestion}
        />
      )}
    </div>
  );
};
