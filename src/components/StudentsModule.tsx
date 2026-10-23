import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Filter, 
  X, 
  AlertCircle, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Student, ClassItem, GradeRecord } from '../types';
import { 
  exportStudentsToExcel, 
  readStudentsExcelFile, 
  downloadSampleExcelTemplate 
} from '../utils/excel';
import { StudentDetailModal } from './StudentDetailModal';

interface StudentsModuleProps {
  students: Student[];
  classes: ClassItem[];
  grades: GradeRecord[];
  onSaveStudents: (students: Student[]) => void;
  onSaveGrades?: (grades: GradeRecord[]) => void;
  onRequestAISuggestion?: (student: Student, grade?: GradeRecord) => void;
}

export const StudentsModule: React.FC<StudentsModuleProps> = ({
  students,
  classes,
  grades,
  onSaveStudents,
  onSaveGrades,
  onRequestAISuggestion,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'score'>('name');

  // Selected student for detail portfolio modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Add / Edit Modal
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({
    studentCode: '',
    fullName: '',
    dateOfBirth: '2013-01-01',
    gender: 'Nam',
    classId: classes[0]?.id || '',
    className: classes[0]?.name || '',
    academicYear: '2026–2027',
    notes: '',
    strengths: '',
    weaknesses: '',
    contactParent: '',
  });

  // Delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Excel Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importTargetClassId, setImportTargetClassId] = useState<string>(classes[0]?.id || '');
  const [importStatusMsg, setImportStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter students
  const filteredStudents = students
    .filter((s) => {
      const matchClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;
      const matchSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
      return matchClass && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.fullName.split(' ').pop() || '';
        const nameB = b.fullName.split(' ').pop() || '';
        return nameA.localeCompare(nameB, 'vi');
      }
      if (sortBy === 'code') {
        return a.studentCode.localeCompare(b.studentCode);
      }
      if (sortBy === 'score') {
        const gradeA = grades.find((g) => g.studentId === a.id)?.dtb ?? 0;
        const gradeB = grades.find((g) => g.studentId === b.id)?.dtb ?? 0;
        return gradeB - gradeA;
      }
      return 0;
    });

  const handleOpenAdd = () => {
    const nextCode = `HS-${800 + students.length + 1}`;
    setFormData({
      studentCode: nextCode,
      fullName: '',
      dateOfBirth: '2013-05-15',
      gender: 'Nam',
      classId: classes[0]?.id || '',
      className: classes[0]?.name || '',
      academicYear: '2026–2027',
      notes: '',
      strengths: '',
      weaknesses: '',
      contactParent: '',
    });
    setEditingStudent(null);
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (st: Student) => {
    setFormData(st);
    setEditingStudent(st);
    setShowAddEditModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.studentCode) return;

    const targetClass = classes.find((c) => c.id === formData.classId) || classes[0];

    if (editingStudent) {
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              ...formData,
              className: targetClass?.name || s.className,
            } as Student
          : s
      );
      onSaveStudents(updated);
      showToast(`Đã cập nhật thông tin học sinh ${formData.fullName}`);
    } else {
      const newStudent: Student = {
        id: 'st_' + Date.now(),
        studentCode: formData.studentCode!,
        fullName: formData.fullName!,
        dateOfBirth: formData.dateOfBirth || '2013-01-01',
        gender: (formData.gender as any) || 'Nam',
        classId: targetClass?.id || '',
        className: targetClass?.name || '',
        academicYear: formData.academicYear || '2026–2027',
        notes: formData.notes || '',
        strengths: formData.strengths || '',
        weaknesses: formData.weaknesses || '',
        attendanceRate: 100,
        contactParent: formData.contactParent || '',
      };
      onSaveStudents([...students, newStudent]);
      showToast(`Đã thêm học sinh ${newStudent.fullName} vào lớp ${newStudent.className}`);
    }

    setShowAddEditModal(false);
  };

  const handleDeleteStudent = (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    const updated = students.filter((s) => s.id !== id);
    onSaveStudents(updated);
    setDeleteConfirmId(null);
    showToast(`Đã xóa học sinh ${studentToDelete?.fullName || ''}`);
  };

  // Handle Excel Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data, headers } = await readStudentsExcelFile(file);
      if (data.length === 0) {
        setImportStatusMsg({ type: 'error', text: 'Tệp không chứa dữ liệu hoặc không đúng định dạng.' });
        return;
      }
      setImportHeaders(headers);
      setImportPreviewData(data);
      setImportStatusMsg({ type: 'success', text: `Đã đọc thành công ${data.length} dòng dữ liệu từ file Excel!` });
    } catch (err: any) {
      console.error(err);
      setImportStatusMsg({ type: 'error', text: 'Có lỗi khi đọc file: ' + err.message });
    }
  };

  // Confirm Import Excel
  const handleConfirmImport = () => {
    if (importPreviewData.length === 0) return;

    const targetClass = classes.find((c) => c.id === importTargetClassId) || classes[0];
    let addedCount = 0;
    const newStudentsList: Student[] = [];

    importPreviewData.forEach((row, i) => {
      // Find matching keys
      const codeKey = Object.keys(row).find((k) => k.toLowerCase().includes('mã')) || '';
      const nameKey = Object.keys(row).find((k) => k.toLowerCase().includes('họ') || k.toLowerCase().includes('tên')) || '';
      const birthKey = Object.keys(row).find((k) => k.toLowerCase().includes('sinh') || k.toLowerCase().includes('ngày')) || '';
      const genderKey = Object.keys(row).find((k) => k.toLowerCase().includes('tính')) || '';
      const noteKey = Object.keys(row).find((k) => k.toLowerCase().includes('chú')) || '';
      const strKey = Object.keys(row).find((k) => k.toLowerCase().includes('mạnh')) || '';
      const weakKey = Object.keys(row).find((k) => k.toLowerCase().includes('thiện') || k.toLowerCase().includes('yếu')) || '';

      const fullName = (nameKey ? row[nameKey] : '') || row['Họ và tên'] || row['Tên'] || `Học sinh mới ${i + 1}`;
      if (!fullName.trim()) return;

      const studentCode = (codeKey ? row[codeKey] : '') || row['Mã học sinh'] || `HS-${Date.now().toString().slice(-4)}${i}`;
      const gender = (genderKey && row[genderKey]?.toLowerCase().includes('nữ')) ? 'Nữ' : 'Nam';

      const newStudent: Student = {
        id: 'st_imp_' + Date.now() + '_' + i,
        studentCode,
        fullName,
        dateOfBirth: (birthKey ? row[birthKey] : '') || '2013-05-15',
        gender,
        classId: targetClass?.id || '',
        className: targetClass?.name || '',
        academicYear: '2026–2027',
        notes: (noteKey ? row[noteKey] : '') || '',
        strengths: (strKey ? row[strKey] : '') || '',
        weaknesses: (weakKey ? row[weakKey] : '') || '',
        attendanceRate: 100,
      };

      newStudentsList.push(newStudent);
      addedCount++;
    });

    onSaveStudents([...students, ...newStudentsList]);
    setShowImportModal(false);
    setImportPreviewData([]);
    showToast(`Đã nhập thành công ${addedCount} học sinh vào lớp ${targetClass?.name}!`);
  };

  const handleExport = () => {
    const classItem = classes.find((c) => c.id === selectedClassFilter);
    const className = classItem ? classItem.name : 'Toan_Bo';
    exportStudentsToExcel(filteredStudents, grades, className);
    showToast('Đã xuất danh sách học sinh ra file Excel thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B2D59] text-white px-4 py-2.5 rounded-xl shadow-xl border border-sky-400 flex items-center space-x-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-[#1565C0]" />
            <h2 className="text-xl font-extrabold text-[#0B2D59] font-serif">
              Quản lý Hồ sơ Học sinh môn Toán
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng: <strong>{students.length} học sinh</strong> | Nhập xuất danh sách Excel, theo dõi hồ sơ cá nhân và phân hóa dạy học
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import Excel */}
          <button
            onClick={() => {
              setImportStatusMsg(null);
              setImportPreviewData([]);
              setShowImportModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition shadow-2xs"
          >
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>NHẬP DANH SÁCH EXCEL</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>XUẤT EXCEL</span>
          </button>

          {/* Add Student */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B2D59] text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>THÊM HỌC SINH</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-600">Lọc theo lớp:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả các lớp ({students.length})</option>
            {classes.map((c) => {
              const count = students.filter((s) => s.classId === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({count} HS)
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-bold">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="name">Tên (A-Z)</option>
              <option value="code">Mã học sinh</option>
              <option value="score">Điểm TB cao nhất</option>
            </select>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, mã HS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy học sinh nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Thử thay đổi bộ lọc lớp hoặc nhấn <strong>Thêm học sinh</strong> / <strong>Nhập Excel</strong>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2D59]/5 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">STT</th>
                  <th className="py-3 px-3">Mã HS</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-3">Lớp</th>
                  <th className="py-3 px-3">Ngày sinh</th>
                  <th className="py-3 px-3">Giới tính</th>
                  <th className="py-3 px-3 text-center">Điểm TB</th>
                  <th className="py-3 px-3 text-center">Xếp loại</th>
                  <th className="py-3 px-4">Điểm mạnh / Hỗ trợ</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((st, idx) => {
                  const gr = grades.find((g) => g.studentId === st.id);
                  return (
                    <tr 
                      key={st.id} 
                      className="hover:bg-sky-50/40 transition group cursor-pointer"
                      onClick={() => setSelectedStudent(st)}
                    >
                      <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">{st.studentCode}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0B2D59] group-hover:text-[#1565C0] flex items-center space-x-1">
                          <span>{st.fullName}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-[#1565C0]" />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1565C0] border border-blue-200">
                          {st.className}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{st.dateOfBirth}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.gender === 'Nữ' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {st.gender}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {gr?.dtb != null ? (
                          <span className={
                            gr.dtb >= 8 ? 'text-emerald-700' : 
                            gr.dtb >= 6.5 ? 'text-blue-700' : 
                            gr.dtb >= 5 ? 'text-amber-700' : 'text-rose-600 font-extrabold'
                          }>
                            {gr.dtb.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gr?.classification === 'Tốt'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : gr?.classification === 'Khá'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : gr?.classification === 'Đạt'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {gr?.classification || 'Chưa đánh giá'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {st.strengths || st.weaknesses || st.notes || 'Bình thường'}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                          title="Sửa thông tin học sinh"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(st.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal: Student Portfolio Detail */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          grade={grades.find((g) => g.studentId === selectedStudent.id)}
          onClose={() => setSelectedStudent(null)}
          onRequestAISuggestion={onRequestAISuggestion}
        />
      )}

      {/* Modal: Thêm / Sửa học sinh */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                {editingStudent ? 'Chỉnh sửa hồ sơ học sinh' : 'Thêm học sinh mới'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentCode || ''}
                    onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp phân công <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.classId || classes[0]?.id}
                    onChange={(e) => {
                      const sel = classes.find((c) => c.id === e.target.value);
                      setFormData({ ...formData, classId: sel?.id, className: sel?.name });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth || '2013-01-01'}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender || 'Nam'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Điểm mạnh Toán học</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đại số, hằng đẳng thức..."
                    value={formData.strengths || ''}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nội dung cần hỗ trợ</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chứng minh hình học..."
                    value={formData.weaknesses || ''}
                    onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại phụ huynh</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bác Minh - 0912.345.678"
                  value={formData.contactParent || ''}
                  onChange={(e) => setFormData({ ...formData, contactParent: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú theo dõi</label>
                <textarea
                  rows={2}
                  placeholder="Nhận xét riêng của cô giáo..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B2D59] text-white font-bold shadow-xs"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận xóa học sinh */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 font-serif">Xác nhận xóa học sinh</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn có chắc chắn muốn xóa học sinh này khỏi hệ thống?
            </p>
            <div className="flex items-center justify-center space-x-3 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteStudent(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Xóa học sinh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: IMPORT EXCEL (Full-featured as required) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-[#0B2D59] font-serif">
                  Nhập danh sách học sinh từ file Excel
                </h3>
              </div>
              <button onClick={() => setShowImportModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Step 1: Upload or download sample template */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Bước 1: Chuẩn bị tệp Excel</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Hỗ trợ tệp .xlsx hoặc .csv có các cột: Mã học sinh, Họ và tên, Ngày sinh, Giới tính...
                  </p>
                </div>

                <button
                  onClick={downloadSampleExcelTemplate}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold shadow-2xs shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tải file Excel mẫu</span>
                </button>
              </div>

              {/* Step 2: Select destination class & choose file */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bước 2: Chọn lớp muốn nhập học sinh vào
                  </label>
                  <select
                    value={importTargetClassId}
                    onChange={(e) => setImportTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} (Khối {c.gradeLevel})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bước 3: Chọn tệp Excel từ máy tính
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1565C0] file:text-white hover:file:bg-[#0B2D59]"
                  />
                </div>
              </div>

              {/* Status feedback */}
              {importStatusMsg && (
                <div className={`p-3 rounded-xl border flex items-center space-x-2 ${
                  importStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {importStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-semibold">{importStatusMsg.text}</span>
                </div>
              )}

              {/* Preview Table */}
              {importPreviewData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">
                      Bản xem trước dữ liệu ({importPreviewData.length} dòng):
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      ✓ Đã khớp các trường dữ liệu
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-56 rounded-xl border border-slate-200">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="py-2 px-2.5">STT</th>
                          {importHeaders.slice(0, 5).map((h, i) => (
                            <th key={i} className="py-2 px-2.5 truncate">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {importPreviewData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-2.5 text-slate-400 font-bold">{idx + 1}</td>
                            {importHeaders.slice(0, 5).map((h, ci) => (
                              <td key={ci} className="py-2 px-2.5 truncate max-w-xs">{row[h] || '--'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importPreviewData.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>XÁC NHẬN NHẬP DANH SÁCH</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
