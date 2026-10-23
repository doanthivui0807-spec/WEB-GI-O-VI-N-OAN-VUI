export interface TeacherProfile {
  name: string;
  school: string;
  slogan: string;
  subTitle: string;
  subject: string;
  academicYear: string;
  grades: string[];
  avatar: string;
  email: string;
  phone: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g., "8A5", "9A4", "Toán 6", "Toán 8 (nâng cao)"
  gradeLevel: 6 | 7 | 8 | 9;
  academicYear: string;
  studentCount: number;
  homeroomTeacher: string;
  status: 'Đang học' | 'Tạm dừng' | 'Đã hoàn thành';
  notes?: string;
  averageScore?: number;
}

export interface Student {
  id: string;
  studentCode: string; // e.g. "HS-0801"
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'Nam' | 'Nữ';
  classId: string;
  className: string;
  academicYear: string;
  notes?: string;
  strengths?: string;
  weaknesses?: string;
  attendanceRate?: number;
  contactParent?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  classId: string;
  semester: 'Học kỳ I' | 'Học kỳ II';
  academicYear: string;
  tx1?: number | null;
  tx2?: number | null;
  tx3?: number | null;
  tx4?: number | null;
  gk?: number | null; // Giữa kỳ (hệ số 2)
  ck?: number | null; // Cuối kỳ (hệ số 3)
  dtb?: number | null;
  classification?: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';
  notes?: string;
  updatedAt?: string;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7' | 'CN';
  timeSlot: string; // e.g. "13:30 - 15:00"
  className: string;
  lessonContent: string;
  room?: string;
  notes?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  type: 'kiem_tra' | 'lich_hoc' | 'nhac_nop_bai' | 'tuyen_duong' | 'nhac_nho' | 'chung';
  targetClass: string; // "Tất cả" or class name
  content: string;
  createdAt: string;
  priority: 'cao' | 'trung_binh' | 'thong_thuong';
}

export interface DocumentItem {
  id: string;
  title: string;
  gradeLevel: 6 | 7 | 8 | 9;
  category: 
    | 'Kế hoạch bài dạy'
    | 'Bài giảng PowerPoint'
    | 'Phiếu học tập'
    | 'Đề kiểm tra'
    | 'Bài tập nâng cao'
    | 'Tài liệu bồi dưỡng HSG'
    | 'Video bài giảng'
    | 'Học liệu số';
  fileType: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'video' | 'link';
  fileSize?: string;
  uploadDate: string;
  description?: string;
  url?: string;
  chapter?: string;
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface StudentAttendanceEntry {
  studentId: string;
  studentCode: string;
  fullName: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  timeSlot?: string; // e.g. "Tiết 1 - 2 (13:30 - 15:00)"
  lessonTopic?: string;
  records: Record<string, { status: AttendanceStatus; note?: string }>;
  totalStudents: number;
  presentCount: number;
  excusedCount: number;
  unexcusedCount: number;
  lateCount: number;
  attendanceRate: number; // percentage
  updatedAt: string;
}

export type ActiveTab = 
  | 'overview' 
  | 'classes' 
  | 'students' 
  | 'attendance'
  | 'progress' 
  | 'grading' 
  | 'materials' 
  | 'announcements' 
  | 'settings';

