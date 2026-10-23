import React, { useState } from 'react';
import { 
  BellRing, 
  Plus, 
  Copy, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Share2, 
  Edit3, 
  Trash2, 
  X, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { AnnouncementItem, ClassItem, TeacherProfile } from '../types';

interface AnnouncementsModuleProps {
  profile: TeacherProfile;
  classes: ClassItem[];
  announcements: AnnouncementItem[];
  onSaveAnnouncements: (items: AnnouncementItem[]) => void;
  onRequestAISuggestion?: (topic: string) => void;
}

export const AnnouncementsModule: React.FC<AnnouncementsModuleProps> = ({
  profile,
  classes,
  announcements,
  onSaveAnnouncements,
  onRequestAISuggestion,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [formData, setFormData] = useState<Partial<AnnouncementItem>>({
    title: '',
    type: 'kiem_tra',
    targetClass: 'Tất cả',
    content: '',
    priority: 'thong_thuong',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredItems = announcements.filter((item) => {
    const matchType = selectedType === 'all' || item.type === selectedType;
    const matchClass = selectedClassFilter === 'all' || item.targetClass === selectedClassFilter || item.targetClass === 'Tất cả';
    return matchType && matchClass;
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      type: 'kiem_tra',
      targetClass: 'Tất cả',
      content: '',
      priority: 'thong_thuong',
    });
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setFormData(item);
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    if (editingItem) {
      const updated = announcements.map((a) =>
        a.id === editingItem.id ? ({ ...a, ...formData } as AnnouncementItem) : a
      );
      onSaveAnnouncements(updated);
      showToast('Đã cập nhật thông báo thành công!');
    } else {
      const now = new Date();
      const timeStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newItem: AnnouncementItem = {
        id: 'an_' + Date.now(),
        title: formData.title!,
        type: formData.type || 'chung',
        targetClass: formData.targetClass || 'Tất cả',
        content: formData.content!,
        createdAt: timeStr,
        priority: formData.priority || 'thong_thuong',
      };
      onSaveAnnouncements([newItem, ...announcements]);
      showToast('Đã đăng thông báo mới!');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    onSaveAnnouncements(updated);
    setDeleteConfirmId(null);
    showToast('Đã xóa thông báo.');
  };

  // One-click Copy for Zalo group
  const handleCopyZalo = (item: AnnouncementItem) => {
    const formatted = `📢 ${item.title.toUpperCase()}\n🏫 ${profile.school} | Môn Toán (Cô ${profile.name})\n🎯 Lớp: ${item.targetClass}\n\n${item.content}\n\nTrân trọng thông báo! ✨`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(item.id);
    showToast('Đã sao chép nội dung! Bạn có thể dán (Paste) ngay vào nhóm Zalo của lớp.');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'kiem_tra':
        return { label: 'Kiểm tra - Đánh giá', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'lich_hoc':
        return { label: 'Lịch dạy & Học', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'nhac_nop_bai':
        return { label: 'Nhắc nộp bài tập', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'tuyen_duong':
        return { label: 'Tuyên dương học sinh', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'nhac_nho':
        return { label: 'Nhắc nhở học tập', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Thông báo chung', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B2D59] text-white px-4 py-2.5 rounded-xl shadow-xl border border-sky-400 flex items-center space-x-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BellRing className="w-6 h-6 text-[#1565C0]" />
            <h2 className="text-xl font-extrabold text-[#0B2D59] font-serif">
              Quản lý Thông báo & Tin nhắn gửi Phụ huynh (Zalo)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Soạn thông báo kiểm tra, tuyên dương, nhắc nhở bài tập và sao chép 1 chạm gửi nhóm Zalo lớp học
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRequestAISuggestion?.('Gợi ý tin nhắn Zalo tuyên dương 3 học sinh điểm cao môn Toán')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-xs transition"
          >
            <Sparkles className="w-4 h-4 text-slate-900" />
            <span>AI gợi ý soạn tin Zalo</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B2D59] text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo thông báo mới</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-600">Loại thông báo:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả thể loại</option>
              <option value="kiem_tra">Thông báo kiểm tra</option>
              <option value="lich_hoc">Thông báo lịch học</option>
              <option value="nhac_nop_bai">Nhắc nộp bài tập</option>
              <option value="tuyen_duong">Tuyên dương học sinh</option>
              <option value="nhac_nho">Nhắc nhở học tập</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600">Lớp nhận:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Tổng số: <strong className="text-slate-800">{filteredItems.length} thông báo</strong>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const typeBadge = getTypeLabel(item.type);
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeBadge.bg}`}>
                    {typeBadge.label}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1565C0] border border-blue-200">
                    Lớp: {item.targetClass}
                  </span>
                  {item.priority === 'cao' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Ưu tiên cao
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {item.createdAt}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed font-serif whitespace-pre-line bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                  {item.content}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-slate-400 italic">
                  Người đăng: Cô {profile.name} – {profile.school}
                </div>

                <div className="flex items-center space-x-2">
                  {/* COPY BUTTON FOR ZALO */}
                  <button
                    onClick={() => handleCopyZalo(item)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-bold transition shadow-xs ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1565C0] hover:bg-[#0B2D59] text-white'
                    }`}
                    title="Sao chép định dạng để dán thẳng vào Zalo"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>ĐÃ SAO CHÉP CHO ZALO</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>SAO CHÉP NỘI DUNG</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                    title="Chỉnh sửa thông báo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <BellRing className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Chưa có thông báo nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Nhấn <strong>Tạo thông báo mới</strong> hoặc dùng <strong>AI gợi ý soạn tin Zalo</strong> để bắt đầu.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Thêm / Sửa Thông báo */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B2D59] font-serif">
                {editingItem ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề thông báo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhắc nhở nộp bài tập giữa kỳ lớp 8A5..."
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại thông báo</label>
                  <select
                    value={formData.type || 'kiem_tra'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    <option value="kiem_tra">Thông báo kiểm tra</option>
                    <option value="lich_hoc">Thông báo lịch học</option>
                    <option value="nhac_nop_bai">Nhắc nộp bài tập</option>
                    <option value="tuyen_duong">Tuyên dương học sinh</option>
                    <option value="nhac_nho">Nhắc nhở học tập</option>
                    <option value="chung">Thông báo chung</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đối tượng nhận</label>
                  <select
                    value={formData.targetClass || 'Tất cả'}
                    onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                  >
                    <option value="Tất cả">Tất cả các lớp</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Nội dung thông báo <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        content: `Kính gửi quý phụ huynh và các em học sinh lớp ${formData.targetClass || 'Toán'}:\nCô xin thông báo về việc ôn tập môn Toán tuần này. Đề nghị các em hoàn thành đầy đủ bài tập và chuẩn bị dụng cụ học tập chu đáo. Chúc các em học tập thật tốt!`,
                      });
                    }}
                    className="text-[11px] font-bold text-[#1565C0] hover:underline"
                  >
                    Điền mẫu sư phạm
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập nội dung thông báo gửi học sinh và phụ huynh..."
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none leading-relaxed font-serif"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1565C0] text-white font-bold shadow-xs"
                >
                  Lưu & Đăng thông báo
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
            <h3 className="text-base font-bold text-slate-900 font-serif">Xác nhận xóa thông báo</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn có chắc chắn muốn xóa thông báo này?
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
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
