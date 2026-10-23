import React, { useState } from 'react';
import { Calendar, Plus, Trash2, X, Clock, MapPin, BookOpen } from 'lucide-react';
import { ScheduleItem } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleItem[];
  onSaveSchedule: (items: ScheduleItem[]) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onSaveSchedule,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    dayOfWeek: 'Thứ 2',
    timeSlot: '13:30 - 15:00',
    className: 'Toán 8A5',
    lessonContent: '',
    room: 'Phòng 204',
    notes: '',
  });

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lessonContent) return;

    const newItem: ScheduleItem = {
      id: 'sch_' + Date.now(),
      dayOfWeek: formData.dayOfWeek as any,
      timeSlot: formData.timeSlot || '13:30 - 15:00',
      className: formData.className || 'Toán 8A5',
      lessonContent: formData.lessonContent,
      room: formData.room || 'Phòng 204',
      notes: formData.notes || '',
    };

    onSaveSchedule([...schedule, newItem]);
    setShowAddForm(false);
    setFormData({
      dayOfWeek: 'Thứ 2',
      timeSlot: '13:30 - 15:00',
      className: 'Toán 8A5',
      lessonContent: '',
      room: 'Phòng 204',
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    onSaveSchedule(schedule.filter((s) => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[#1565C0]" />
            <h3 className="text-base font-bold text-[#0B2D59] font-serif">
              Quản lý Lịch dạy học trong tuần
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4 text-xs pr-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Lịch giảng dạy hiện tại ({schedule.length} tiết):</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1565C0] hover:bg-[#0B2D59] text-white font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm lịch dạy mới</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAdd} className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="Thứ 2">Thứ 2</option>
                    <option value="Thứ 3">Thứ 3</option>
                    <option value="Thứ 4">Thứ 4</option>
                    <option value="Thứ 5">Thứ 5</option>
                    <option value="Thứ 6">Thứ 6</option>
                    <option value="Thứ 7">Thứ 7</option>
                    <option value="CN">Chủ Nhật</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian</label>
                  <input
                    type="text"
                    placeholder="13:30 - 15:00"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp</label>
                  <input
                    type="text"
                    placeholder="Toán 8A5"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung bài học / Tiết dạy</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tiết 23: Hình chữ nhật - Dấu hiệu nhận biết..."
                  value={formData.lessonContent}
                  onChange={(e) => setFormData({ ...formData, lessonContent: e.target.value })}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 rounded-lg text-slate-600 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#1565C0] text-white font-bold"
                >
                  Lưu tiết dạy
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {schedule.map((item) => (
              <div key={item.id} className="p-3 bg-white hover:bg-slate-50 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#1565C0] w-12">{item.dayOfWeek}</span>
                    <span className="font-mono text-slate-500 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.timeSlot}
                    </span>
                    <span className="font-bold text-slate-800">{item.className}</span>
                    {item.room && <span className="text-slate-400 text-[10px]">({item.room})</span>}
                  </div>
                  <div className="text-slate-600 font-medium pl-14">
                    {item.lessonContent}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Xóa lịch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
