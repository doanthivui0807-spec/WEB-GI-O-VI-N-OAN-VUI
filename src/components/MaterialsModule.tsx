import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Download, 
  FileText, 
  Film, 
  ExternalLink, 
  Filter, 
  X, 
  Trash2, 
  Edit3, 
  FileCode, 
  CheckCircle2, 
  FolderGit2
} from 'lucide-react';
import { DocumentItem } from '../types';

interface MaterialsModuleProps {
  documents: DocumentItem[];
  onSaveDocuments: (docs: DocumentItem[]) => void;
  onRequestAILessonPlan?: (grade: number, topic: string) => void;
}

export const MaterialsModule: React.FC<MaterialsModuleProps> = ({
  documents,
  onSaveDocuments,
  onRequestAILessonPlan,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(8);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = [
    'Kế hoạch bài dạy',
    'Bài giảng PowerPoint',
    'Phiếu học tập',
    'Đề kiểm tra',
    'Bài tập nâng cao',
    'Tài liệu bồi dưỡng HSG',
    'Video bài giảng',
    'Học liệu số',
  ];

  const [formData, setFormData] = useState<Partial<DocumentItem>>({
    title: '',
    gradeLevel: 8,
    category: 'Kế hoạch bài dạy',
    fileType: 'docx',
    fileSize: '1.2 MB',
    chapter: 'Chương I: Đa thức',
    description: '',
    url: '',
  });

  const filteredDocs = documents.filter((doc) => {
    const matchGrade = doc.gradeLevel === selectedGrade;
    const matchCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.chapter && doc.chapter.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchGrade && matchCategory && matchSearch;
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      gradeLevel: selectedGrade as any,
      category: 'Kế hoạch bài dạy',
      fileType: 'docx',
      fileSize: '1.5 MB',
      chapter: '',
      description: '',
      url: '',
    });
    setEditingDoc(null);
    setShowAddModal(true);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingDoc) {
      const updated = documents.map((d) =>
        d.id === editingDoc.id ? ({ ...d, ...formData } as DocumentItem) : d
      );
      onSaveDocuments(updated);
    } else {
      const newDoc: DocumentItem = {
        id: 'doc_' + Date.now(),
        title: formData.title!,
        gradeLevel: (formData.gradeLevel as any) || selectedGrade,
        category: (formData.category as any) || 'Kế hoạch bài dạy',
        fileType: (formData.fileType as any) || 'docx',
        fileSize: formData.fileSize || '1.0 MB',
        uploadDate: new Date().toISOString().slice(0, 10),
        chapter: formData.chapter || 'Chuyên đề môn Toán',
        description: formData.description || '',
        url: formData.url,
      };
      onSaveDocuments([newDoc, ...documents]);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    onSaveDocuments(updated);
    setDeleteConfirmId(null);
    if (previewDoc?.id === id) setPreviewDoc(null);
  };

  const handleFakeDownload = (doc: DocumentItem) => {
    if (doc.url && doc.url.startsWith('http')) {
      window.open(doc.url, '_blank');
      return;
    }
    // Create text file simulation
    const content = `TRƯỜNG TH-THCS HÒA NAM\nGIÁO VIÊN: ĐOÀN THỊ VUI\n\nTÀI LIỆU MÔN TOÁN LỚP ${doc.gradeLevel}\nTiêu đề: ${doc.title}\nThể loại: ${doc.category}\nChuyên đề: ${doc.chapter || ''}\nMô tả: ${doc.description || ''}\nNgày tải lên: ${doc.uploadDate}\n\n[Nội dung tài liệu giáo án / đề kiểm tra đã được tải về thành công]`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.${doc.fileType === 'docx' ? 'txt' : doc.fileType}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileBadge = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">PDF</span>;
      case 'docx':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">WORD</span>;
      case 'pptx':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">PPTX</span>;
      case 'xlsx':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">EXCEL</span>;
      case 'video':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">VIDEO</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">LINK</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-[#1565C0]" />
            <h2 className="text-xl font-extrabold text-[#0B2D59] font-serif">
              Kho Học liệu & Bài giảng Toán THCS (GDPT 2018)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kế hoạch bài dạy chuẩn CV 5512, slide bài giảng, đề kiểm tra, ma trận, phiếu học tập và mô phỏng GeoGebra
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRequestAILessonPlan?.(selectedGrade, 'Hằng đẳng thức đáng nhớ & Vận dụng')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>AI soạn giáo án nhanh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B2D59] text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tải tài liệu lên</span>
          </button>
        </div>
      </div>

      {/* Grade Selector Bar (Toán 6, 7, 8, 9) */}
      <div className="flex items-center space-x-3">
        {[6, 7, 8, 9].map((grade) => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2 ${
              selectedGrade === grade
                ? 'bg-[#0B2D59] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="font-serif">TOÁN {grade}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              selectedGrade === grade ? 'bg-amber-400 text-slate-900 font-extrabold' : 'bg-slate-100 text-slate-600'
            }`}>
              {documents.filter((d) => d.gradeLevel === grade).length} mục
            </span>
          </button>
        ))}
      </div>

      {/* 8 Categories and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-600">Danh mục:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả 8 danh mục</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, chuyên đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-[#1565C0] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({documents.filter((d) => d.gradeLevel === selectedGrade).length})
          </button>
          {categories.map((cat, idx) => {
            const count = documents.filter((d) => d.gradeLevel === selectedGrade && d.category === cat).length;
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                  isCatActive
                    ? 'bg-[#1565C0] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group hover:border-sky-300"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                {getFileBadge(doc.fileType)}
                <span className="text-[10px] text-slate-400 font-mono">{doc.uploadDate}</span>
              </div>

              <h4 
                onClick={() => setPreviewDoc(doc)}
                className="text-sm font-bold text-[#0B2D59] font-serif leading-snug group-hover:text-[#1565C0] transition cursor-pointer"
              >
                {doc.title}
              </h4>

              {doc.chapter && (
                <div className="text-[11px] font-semibold text-sky-800 mt-1">
                  📁 {doc.chapter}
                </div>
              )}

              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {doc.description || 'Tài liệu phục vụ giảng dạy và ôn tập môn Toán THCS.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-slate-400">
                {doc.fileSize}
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#1565C0] font-bold text-[11px] transition"
                >
                  Xem trước
                </button>

                <button
                  onClick={() => handleFakeDownload(doc)}
                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 transition"
                  title="Tải tài liệu xuống"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(doc.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition"
                  title="Xóa tài liệu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">Chưa có tài liệu nào trong mục này</p>
          <p className="text-xs text-slate-400 mt-1">
            Bấm <strong>Tải tài liệu lên</strong> hoặc <strong>AI soạn giáo án nhanh</strong> để thêm học liệu mới.
          </p>
        </div>
      )}

      {/* Modal: Xem trước tài liệu (Preview) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                {getFileBadge(previewDoc.fileType)}
                <h3 className="text-base font-bold text-[#0B2D59] font-serif truncate max-w-sm">
                  {previewDoc.title}
                </h3>
              </div>
              <button onClick={() => setPreviewDoc(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div>Khối: <strong>Toán {previewDoc.gradeLevel}</strong></div>
                <div>Danh mục: <strong>{previewDoc.category}</strong></div>
                <div>Chuyên đề: <strong>{previewDoc.chapter || '--'}</strong></div>
                <div>Kích thước: <strong>{previewDoc.fileSize}</strong> | Ngày tải: <strong>{previewDoc.uploadDate}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung / Mô tả:</label>
                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 text-slate-700 leading-relaxed font-serif text-sm">
                  {previewDoc.description || 'Tài liệu biên soạn công phu theo chuẩn kiến thức kỹ năng GDPT 2018.'}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleFakeDownload(previewDoc)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải tệp xuống máy tính</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tải tài liệu lên / Chỉnh sửa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                {editingDoc ? 'Chỉnh sửa tài liệu' : 'Tải tài liệu học liệu mới'}
              </h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề tài liệu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kế hoạch bài dạy Toán 8 - Bài 4: Hằng đẳng thức..."
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={formData.gradeLevel || 8}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    <option value={6}>Toán 6</option>
                    <option value={7}>Toán 7</option>
                    <option value={8}>Toán 8</option>
                    <option value={9}>Toán 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={formData.category || 'Kế hoạch bài dạy'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Định dạng tệp</label>
                  <select
                    value={formData.fileType || 'docx'}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    <option value="docx">Word (.docx)</option>
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="pptx">PowerPoint (.pptx)</option>
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="video">Video MP4</option>
                    <option value="link">Liên kết / GeoGebra</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chương / Chuyên đề</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chương I: Đa thức"
                    value={formData.chapter || ''}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả tóm tắt</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú nội dung trọng tâm của tài liệu..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1565C0] text-white font-bold shadow-xs"
                >
                  Lưu học liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 font-serif">Xác nhận xóa tài liệu</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn có chắc chắn muốn xóa tài liệu này khỏi kho học liệu?
            </p>
            <div className="flex items-center justify-center space-x-3 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
