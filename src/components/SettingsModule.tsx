import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  School, 
  Calendar, 
  Mail, 
  Phone, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  Cloud,
  ExternalLink,
  Sparkles,
  Key
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { 
  exportDatabaseBackup, 
  importDatabaseBackup, 
  resetToSampleData, 
  clearToRealData, 
  isSampleMode, 
  setSampleMode 
} from '../utils/storage';

interface SettingsModuleProps {
  profile: TeacherProfile;
  onSaveProfile: (profile: TeacherProfile) => void;
  onDataReset: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  profile,
  onSaveProfile,
  onDataReset,
}) => {
  const [formData, setFormData] = useState<TeacherProfile>({ ...profile });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sampleModeActive, setSampleModeActive] = useState<boolean>(isSampleMode());
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256&h=256',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256',
    'https://images.unsplash.com/photo-1580894732483-847247348e3a?auto=format&fit=crop&q=80&w=256&h=256',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256',
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    showToast('Đã lưu thông tin cài đặt thành công!');
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData({ ...formData, avatar: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const ok = importDatabaseBackup(content);
        if (ok) {
          showToast('Phục hồi dữ liệu thành công!');
          onDataReset();
        } else {
          showToast('Lỗi: Tệp sao lưu không đúng định dạng JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetSample = () => {
    resetToSampleData();
    setSampleModeActive(true);
    setShowResetConfirm(false);
    onDataReset();
    showToast('Đã khôi phục dữ liệu mẫu minh họa.');
  };

  const handleClearSample = () => {
    clearToRealData();
    setSampleModeActive(false);
    setShowClearConfirm(false);
    onDataReset();
    showToast('Đã xóa dữ liệu mẫu. Hệ thống sẵn sàng cho dữ liệu thực tế của cô!');
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
            <SettingsIcon className="w-6 h-6 text-[#1565C0]" />
            <h2 className="text-xl font-extrabold text-[#0B2D59] font-serif">
              Cài đặt Hệ thống & Quản lý Dữ liệu
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tùy biến hồ sơ giáo viên, ảnh đại diện, trường lớp, sao lưu dữ liệu và chuyển đổi chế độ dữ liệu
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {sampleModeActive ? (
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Chế độ: Dữ liệu minh họa</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Chế độ: Dữ liệu thực tế</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B2D59] font-serif flex items-center space-x-2">
              <User className="w-5 h-5 text-[#1565C0]" />
              <span>Thông tin Giáo viên & Trường học</span>
            </h3>
            <span className="text-xs text-slate-400 italic">Môn Toán THCS</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            {/* Avatar customization */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">Ảnh đại diện của cô giáo</label>
              <div className="flex items-center space-x-4">
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-sky-100 shadow-md"
                />
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {presetAvatars.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="preset"
                        onClick={() => setFormData({ ...formData, avatar: url })}
                        className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 transition ${
                          formData.avatar === url ? 'border-[#1565C0] scale-110 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>

                  <label className="inline-block px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer text-[11px]">
                    Tải ảnh từ máy tính
                    <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên giáo viên</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bộ môn phụ trách</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên trường học</label>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Năm học</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Khẩu hiệu / Phương châm giảng dạy</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-semibold text-[#1565C0]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email liên hệ</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B2D59] text-white font-bold shadow-xs flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>LƯU CÀI ĐẶT THAY ĐỔI</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Data Management & Firebase Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Backup & Restore Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#0B2D59] font-serif">
                Sao lưu & Khôi phục Dữ liệu
              </h3>
            </div>

            <p className="text-slate-500 leading-relaxed">
              Dữ liệu được lưu trữ an toàn trong trình duyệt của bạn (LocalStorage). Để phòng ngừa mất dữ liệu hoặc chuyển sang máy khác, hãy tải về bản sao lưu định kỳ.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportDatabaseBackup}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold flex flex-col items-center justify-center space-y-1.5 transition"
              >
                <Download className="w-5 h-5 text-emerald-600" />
                <span>Tải tệp sao lưu (.json)</span>
              </button>

              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold flex flex-col items-center justify-center space-y-1.5 transition"
              >
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Khôi phục từ tệp sao lưu</span>
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </button>
            </div>
          </div>

          {/* Sample Mode vs Real Mode */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <RefreshCw className="w-5 h-5 text-[#1565C0]" />
              <h3 className="text-sm font-bold text-[#0B2D59] font-serif">
                Chế độ Dữ liệu mẫu & Dữ liệu thật
              </h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#1565C0] font-bold border border-sky-200 text-left flex items-center justify-between transition"
              >
                <span>XEM THỬ VỚI DỮ LIỆU MẪU</span>
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 text-left flex items-center justify-between transition"
              >
                <span>XÓA TOÀN BỘ DỮ LIỆU MẪU (Bắt đầu năm học mới)</span>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Firebase Synchronization Guide for Middle School */}
          <div className="bg-gradient-to-br from-[#0B2D59] to-[#1565C0] rounded-2xl p-5 text-white shadow-xs space-y-3 text-xs">
            <div className="flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-bold font-serif text-white">
                Khả năng Đồng bộ Đám mây (Firebase)
              </h3>
            </div>

            <p className="text-sky-100 text-[11px] leading-relaxed">
              Hệ thống đã được thiết kế sẵn sàng để tích hợp dịch vụ lưu trữ đám mây Firebase Firestore & Authentication khi nhà trường phê duyệt:
            </p>

            <ul className="space-y-1.5 text-sky-100 text-[11px]">
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-300 font-bold">1.</span>
                <span>Bảo mật dữ liệu học sinh theo quy định của Bộ Giáo dục.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-300 font-bold">2.</span>
                <span>Đồng bộ tự động giữa điện thoại, máy tính bảng và máy tính ở trường.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-300 font-bold">3.</span>
                <span>Sao lưu tự động mỗi ngày trên máy chủ an toàn.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal: Confirm Reset Sample Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <RefreshCw className="w-12 h-12 text-[#1565C0] mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 font-serif">Khôi phục dữ liệu mẫu</h3>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống sẽ tải lại dữ liệu mẫu minh họa của các lớp 6, 7, 8, 9 và điểm số để cô thử nghiệm.
            </p>
            <div className="flex items-center justify-center space-x-3 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleResetSample}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1565C0] text-white"
              >
                Đồng ý khôi phục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Clear to Real Empty State */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 font-serif">Xóa dữ liệu mẫu</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn có chắc chắn muốn xóa toàn bộ học sinh và điểm số mẫu để bắt đầu nhập dữ liệu thực tế của trường?
            </p>
            <div className="flex items-center justify-center space-x-3 mt-5">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleClearSample}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
              >
                Xác nhận xóa mẫu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
