import React from 'react';
import { 
  X, 
  GraduationCap, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Phone, 
  Calendar, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Student, GradeRecord } from '../types';
import { assessProgress } from '../utils/mathGrade';

interface StudentDetailModalProps {
  student: Student | null;
  grade?: GradeRecord;
  onClose: () => void;
  onRequestAISuggestion?: (student: Student, grade?: GradeRecord) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  grade,
  onClose,
  onRequestAISuggestion,
}) => {
  if (!student) return null;

  const assessment = assessProgress(grade || {});

  // Progress points for line chart
  const timelineScores: { label: string; score: number | null }[] = [
    { label: 'TX1', score: grade?.tx1 ?? null },
    { label: 'TX2', score: grade?.tx2 ?? null },
    { label: 'TX3', score: grade?.tx3 ?? null },
    { label: 'TX4', score: grade?.tx4 ?? null },
    { label: 'GK', score: grade?.gk ?? null },
    { label: 'CK', score: grade?.ck ?? null },
  ];

  const validScores = timelineScores.filter((t) => t.score !== null);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200 border border-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B2D59] to-[#1565C0] text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold text-[#0B2D59] font-serif">
                  {student.fullName}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1565C0] border border-blue-200">
                  {student.className}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {student.studentCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hồ sơ học tập cá nhân môn Toán – Năm học {student.academicYear}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-6 text-xs">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Điểm TB học kỳ</span>
              <div className="text-2xl font-black text-[#0B2D59] mt-1 font-serif">
                {grade?.dtb != null ? grade.dtb.toFixed(1) : '--'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Xếp loại</span>
              <div className="text-sm font-black text-emerald-700 mt-2 font-serif">
                {grade?.classification || 'Chưa đánh giá'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Chuyên cần</span>
              <div className="text-sm font-black text-blue-700 mt-2 font-serif">
                {student.attendanceRate || 100}%
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Đánh giá tiến bộ</span>
              <div className="text-xs font-black mt-2 font-serif truncate">
                <span className={`px-2 py-0.5 rounded-full border ${assessment.color}`}>
                  {assessment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Test Scores Table */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-2 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-[#1565C0]" />
              <span>Bảng điểm chi tiết các lần kiểm tra</span>
            </h4>
            <div className="grid grid-cols-6 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500">TX1</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">{grade?.tx1 ?? '--'}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500">TX2</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">{grade?.tx2 ?? '--'}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500">TX3</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">{grade?.tx3 ?? '--'}</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500">TX4</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">{grade?.tx4 ?? '--'}</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800">Giữa kỳ (x2)</div>
                <div className="text-base font-extrabold text-amber-900 mt-0.5">{grade?.gk ?? '--'}</div>
              </div>
              <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200">
                <div className="text-[10px] font-bold text-blue-800">Cuối kỳ (x3)</div>
                <div className="text-base font-extrabold text-blue-900 mt-0.5">{grade?.ck ?? '--'}</div>
              </div>
            </div>
          </div>

          {/* Progress Curve (SVG) */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-2 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Biểu đồ đường tiến bộ qua các bài kiểm tra</span>
            </h4>
            <div className="h-40 bg-white p-3 rounded-2xl border border-slate-200 relative flex flex-col justify-between">
              {/* Grid lines */}
              <div className="absolute inset-x-8 top-3 bottom-8 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-slate-400 w-full" />
                <div className="border-b border-slate-400 w-full" />
                <div className="border-b border-slate-400 w-full" />
              </div>

              {/* Data points visual */}
              <div className="relative h-28 flex items-end justify-around px-4">
                {timelineScores.map((pt, i) => {
                  const val = pt.score ?? 0;
                  const heightPercent = pt.score !== null ? (val / 10) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col items-center justify-end h-full w-12 z-10">
                      {pt.score !== null ? (
                        <>
                          <span className="text-[10px] font-bold text-[#1565C0] mb-1">{val.toFixed(1)}</span>
                          <div 
                            className="w-3.5 bg-gradient-to-t from-[#1565C0] to-sky-400 rounded-t-sm shadow-xs"
                            style={{ height: `${Math.max(10, heightPercent * 0.85)}px` }}
                          />
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-300">--</span>
                      )}
                      <span className="text-[10px] font-bold text-slate-500 mt-1">{pt.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-400 text-center font-serif italic">
                {assessment.description}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-800 text-[11px] mb-1">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Điểm mạnh trong môn Toán</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {student.strengths || 'Nắm bắt lý thuyết và công thức nhanh, có ý thức làm bài.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center space-x-1.5 font-bold text-amber-800 text-[11px] mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Nội dung cần cải thiện & hỗ trợ</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {student.weaknesses || 'Cần chú ý cẩn thận khi tính toán và trình bày bước vẽ hình.'}
              </p>
            </div>
          </div>

          {/* Teacher's Note */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-700 mb-1">Nhận xét của giáo viên:</div>
            <p className="text-slate-600 italic font-serif">
              "{grade?.notes || student.notes || 'Học sinh có tinh thần học tập tốt, cần duy trì đều đặn việc làm bài tập về nhà.'}"
            </p>
            {student.contactParent && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-slate-500 flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Liên hệ phụ huynh: <strong>{student.contactParent}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onRequestAISuggestion?.(student, grade)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-md transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI gợi ý biện pháp bồi dưỡng em này</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs"
          >
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};
