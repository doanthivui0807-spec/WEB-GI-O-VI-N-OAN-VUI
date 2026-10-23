import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  ChevronRight, 
  UserCheck, 
  GraduationCap, 
  ArrowRightLeft,
  X,
  Search,
  BookOpen
} from 'lucide-react';
import { ClassItem, Student, GradeRecord, ActiveTab } from '../types';
import { exportStudentsToExcel } from '../utils/excel';

interface ClassesModuleProps {
  classes: ClassItem[];
  students: Student[];
  grades: GradeRecord[];
  onSaveClasses: (classes: ClassItem[]) => void;
  onSaveStudents: (students: Student[]) => void;
  onNavigate: (tab: ActiveTab, filterClassId?: string) => void;
  selectedClassId?: string;
}

export const ClassesModule: React.FC<ClassesModuleProps> = ({
  classes,
  students,
  grades,
  onSaveClasses,
  onSaveStudents,
  onNavigate,
  selectedClassId,
}) => {
  const [activeClassId, setActiveClassId] = useState<string>(
    selectedClassId || classes[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Transfer student modal state
  const [transferStudent, setTransferStudent] = useState<Student | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<Partial<ClassItem>>({
    name: '',
    gradeLevel: 8,
    academicYear: '2026–2027',
    homeroomTeacher: 'Đoàn Thị Vui',
    status: 'Đang học',
    notes: '',
  });

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === activeClass?.id);

  // Filtered by search
  const filteredStudents = classStudents.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      gradeLevel: 8,
      academicYear: '2026–2027',
      homeroomTeacher: 'Đoàn Thị Vui',
      status: 'Đang học',
      notes: '',
    });
    setEditingClass(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setFormData(cls);
    setEditingClass(cls);
    setShowAddModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingClass) {
      const updated = classes.map((c) =>
        c.id === editingClass.id ? { ...c, ...formData } as ClassItem : c
      );
      onSaveClasses(updated);
    } else {
      const newClass: ClassItem = {
        id: 'cls_' + Date.now(),
        name: formData.name,
        gradeLevel: Number(formData.gradeLevel) as 6 | 7 | 8 | 9,
        academicYear: formData.academicYear || '2026–2027',
        studentCount: 0,
        homeroomTeacher: formData.homeroomTeacher || 'Đoàn Thị Vui',
        status: (formData.status as any) || 'Đang học',
        notes: formData.notes || '',
        averageScore: 0,
      };
      onSaveClasses([...classes, newClass]);
      setActiveClassId(newClass.id);
    }
    setShowAddModal(false);
  };

  const handleDeleteClass = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    onSaveClasses(updated);
    setDeleteConfirmId(null);
    if (activeClassId === id) {
      setActiveClassId(updated[0]?.id || '');
    }
  };

  const handleTransferStudent = () => {
    if (!transferStudent || !targetClassId) return;
    const targetClass = classes.find((c) => c.id === targetClassId);
    if (!targetClass) return;

    const updated = students.map((s) => {
      if (s.id === transferStudent.id) {
        return {
          ...s,
          classId: targetClass.id,
          className: targetClass.name,
        };
      }
      return s;
    });

    onSaveStudents(updated);
    // Update studentCount in both classes
    const updatedClasses = classes.map((c) => {
      const count = updated.filter((s) => s.classId === c.id).length;
      return { ...c, studentCount: count };
    });
    onSaveClasses(updatedClasses);

    setTransferStudent(null);
    setTargetClassId('');
  };

  const handleExportExcel = () => {
    if (!activeClass) return;
    exportStudentsToExcel(classStudents, grades, activeClass.name);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#1565C0]" />
            <h2 className="text-xl font-extrabold text-[#0B2D59] font-serif">
              Quản lý Lớp học môn Toán
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các khối 6, 7, 8, 9, sĩ số học sinh, giáo viên phụ trách và luân chuyển lớp
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel lớp này</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B2D59] text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm lớp mới</span>
          </button>
        </div>
      </div>

      {/* Class tabs / selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {classes.map((cls) => {
          const isCurrent = cls.id === activeClass?.id;
          const count = students.filter((s) => s.classId === cls.id).length;
          return (
            <button
              key={cls.id}
              onClick={() => setActiveClassId(cls.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center space-x-2 ${
                isCurrent
                  ? 'bg-[#0B2D59] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{cls.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isCurrent ? 'bg-amber-400 text-slate-900 font-extrabold' : 'bg-slate-100 text-slate-600'
              }`}>
                {count} HS
              </span>
            </button>
          );
        })}
      </div>

      {/* Active class details card */}
      {activeClass && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          {/* Class Summary Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-2xl font-extrabold text-[#0B2D59] font-serif">
                  Lớp: {activeClass.name}
                </h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1565C0] border border-blue-200">
                  Khối {activeClass.gradeLevel}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeClass.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Phụ trách: <strong>{activeClass.homeroomTeacher}</strong> | Năm học: <strong>{activeClass.academicYear}</strong>
                {activeClass.notes && ` | ${activeClass.notes}`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('attendance', activeClass.id)}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 transition"
              >
                Điểm danh
              </button>


              <button
                onClick={() => onNavigate('grading', activeClass.id)}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition"
              >
                Nhập bảng điểm
              </button>

              <button
                onClick={() => onNavigate('progress', activeClass.id)}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 transition"
              >
                Tiến độ lớp
              </button>


              <button
                onClick={() => handleOpenEdit(activeClass)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                title="Chỉnh sửa thông tin lớp"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(activeClass.id)}
                className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition"
                title="Xóa lớp học"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Students list inside class */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-sm font-bold text-[#0B2D59] font-serif uppercase tracking-wide">
                Danh sách học sinh ({classStudents.length} em)
              </h4>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm học sinh theo tên, mã..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">Chưa có học sinh nào trong lớp này</p>
                <p className="text-xs text-slate-400 mt-1">
                  Nhấn vào phân hệ <strong>Học sinh</strong> hoặc nút <strong>Nhập Excel</strong> để thêm danh sách.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Mã HS</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Ngày sinh</th>
                      <th className="py-2.5 px-3">Giới tính</th>
                      <th className="py-2.5 px-3">Điểm TB</th>
                      <th className="py-2.5 px-3">Xếp loại</th>
                      <th className="py-2.5 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudents.map((st, idx) => {
                      const grade = grades.find((g) => g.studentId === st.id);
                      return (
                        <tr key={st.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-600">{st.studentCode}</td>
                          <td className="py-3 px-3 font-bold text-[#0B2D59]">
                            {st.fullName}
                          </td>
                          <td className="py-3 px-3 text-slate-500">{st.dateOfBirth}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.gender === 'Nữ' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {st.gender}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">
                            {grade?.dtb != null ? (
                              <span className={grade.dtb >= 8 ? 'text-emerald-700' : grade.dtb >= 6.5 ? 'text-blue-700' : grade.dtb >= 5 ? 'text-amber-700' : 'text-rose-600'}>
                                {grade.dtb.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-slate-400">--</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              grade?.classification === 'Tốt'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : grade?.classification === 'Khá'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : grade?.classification === 'Đạt'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {grade?.classification || 'Chưa đánh giá'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                setTransferStudent(st);
                                setTargetClassId(classes.find((c) => c.id !== st.classId)?.id || '');
                              }}
                              className="px-2 py-1 rounded text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                              title="Chuyển lớp cho học sinh"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 inline mr-1" />
                              Chuyển lớp
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Thêm / Sửa lớp học */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                {editingClass ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên lớp học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 8A5, Toán 6, Toán 8 (nâng cao)..."
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={formData.gradeLevel || 8}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
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
                    value={formData.academicYear || '2026–2027'}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo viên phụ trách</label>
                <input
                  type="text"
                  value={formData.homeroomTeacher || 'Đoàn Thị Vui'}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú / Mục tiêu</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Ôn thi vào 10, phụ đạo học sinh yếu, đội tuyển HSG..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B2D59] text-white font-bold shadow-xs"
                >
                  Lưu lớp học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận xóa lớp */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 font-serif">Xác nhận xóa lớp học</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn có chắc chắn muốn xóa lớp này? Thao tác này sẽ xóa lớp khỏi danh sách quản lý.
            </p>
            <div className="flex items-center justify-center space-x-3 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteClass(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Chuyển lớp học sinh */}
      {transferStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                Chuyển lớp học sinh
              </h3>
              <button onClick={() => setTransferStudent(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600">
                Chuyển học sinh: <strong>{transferStudent.fullName}</strong> ({transferStudent.studentCode})
              </p>
              <p className="text-slate-500">
                Lớp hiện tại: <strong>{transferStudent.className}</strong>
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn lớp mới muốn chuyển đến</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="">-- Chọn lớp đến --</option>
                  {classes
                    .filter((c) => c.id !== transferStudent.classId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Khối {c.gradeLevel})
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 rounded-lg bg-sky-50 text-sky-800 text-[11px]">
                ℹ️ Toàn bộ điểm số và lịch sử đánh giá của học sinh sẽ được giữ nguyên khi chuyển lớp.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setTransferStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleTransferStudent}
                  disabled={!targetClassId}
                  className="px-5 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B2D59] text-white font-bold disabled:opacity-50 shadow-xs"
                >
                  Xác nhận chuyển lớp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
