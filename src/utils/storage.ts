import { 
  TeacherProfile, 
  ClassItem, 
  Student, 
  GradeRecord, 
  ScheduleItem, 
  AnnouncementItem, 
  DocumentItem,
  AttendanceSession
} from '../types';
import { 
  initialTeacherProfile, 
  sampleClasses, 
  sampleStudents, 
  sampleGrades, 
  sampleSchedule, 
  sampleAnnouncements, 
  sampleDocuments,
  sampleAttendance
} from '../data/sampleData';

const STORAGE_KEYS = {
  PROFILE: 'math_app_profile_v1',
  CLASSES: 'math_app_classes_v1',
  STUDENTS: 'math_app_students_v1',
  GRADES: 'math_app_grades_v1',
  SCHEDULE: 'math_app_schedule_v1',
  ANNOUNCEMENTS: 'math_app_announcements_v1',
  DOCUMENTS: 'math_app_documents_v1',
  ATTENDANCE: 'math_app_attendance_v1',
  SAMPLE_MODE: 'math_app_sample_mode_v1',
};


// Safe JSON parse
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Lỗi đọc key ${key} từ localStorage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Lỗi lưu key ${key} vào localStorage:`, e);
  }
}

export function isSampleMode(): boolean {
  const val = localStorage.getItem(STORAGE_KEYS.SAMPLE_MODE);
  return val === null ? true : val === 'true';
}

export function setSampleMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.SAMPLE_MODE, enabled ? 'true' : 'false');
  window.dispatchEvent(new Event('math_app_data_changed'));
}

export function getTeacherProfile(): TeacherProfile {
  return getFromStorage<TeacherProfile>(STORAGE_KEYS.PROFILE, initialTeacherProfile);
}

export function saveTeacherProfile(profile: TeacherProfile): void {
  saveToStorage(STORAGE_KEYS.PROFILE, profile);
  window.dispatchEvent(new Event('math_app_data_changed'));
}

export function getClasses(): ClassItem[] {
  return getFromStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, sampleClasses);
}

export function saveClasses(classes: ClassItem[]): void {
  saveToStorage(STORAGE_KEYS.CLASSES, classes);
  window.dispatchEvent(new Event('math_app_data_changed'));
}

export function getStudents(): Student[] {
  return getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, sampleStudents);
}

export function saveStudents(students: Student[]): void {
  saveToStorage(STORAGE_KEYS.STUDENTS, students);
  window.dispatchEvent(new Event('math_app_data_changed'));
}

export function getGrades(): GradeRecord[] {
  return getFromStorage<GradeRecord[]>(STORAGE_KEYS.GRADES, sampleGrades);
}

export function saveGrades(grades: GradeRecord[]): void {
  saveToStorage(STORAGE_KEYS.GRADES, grades);
  window.dispatchEvent(new Event('math_app_data_changed'));
}

export function getSchedule(): ScheduleItem[] {
  return getFromStorage<ScheduleItem[]>(STORAGE_KEYS.SCHEDULE, sampleSchedule);
}

export function saveSchedule(schedule: ScheduleItem[]): void {
  saveToStorage(STORAGE_KEYS.SCHEDULE, schedule);
  window.dispatchEvent(new Event('math_app_data_changed'));
}

export function getAnnouncements(): AnnouncementItem[] {
  return getFromStorage<AnnouncementItem[]>(STORAGE_KEYS.ANNOUNCEMENTS, sampleAnnouncements);
}

export function saveAnnouncements(announcements: AnnouncementItem[]): void {
  saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
  window.dispatchEvent(new Event('math_app_data_changed'));
}

export function getDocuments(): DocumentItem[] {
  return getFromStorage<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, sampleDocuments);
}

export function saveDocuments(documents: DocumentItem[]): void {
  saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);
  window.dispatchEvent(new Event('math_app_data_changed'));
}

export function getAttendance(): AttendanceSession[] {
  return getFromStorage<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE, sampleAttendance);
}

export function saveAttendance(attendance: AttendanceSession[]): void {
  saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance);
  window.dispatchEvent(new Event('math_app_data_changed'));
}

/**
 * Khôi phục về dữ liệu mẫu ban đầu
 */
export function resetToSampleData(): void {
  saveToStorage(STORAGE_KEYS.PROFILE, initialTeacherProfile);
  saveToStorage(STORAGE_KEYS.CLASSES, sampleClasses);
  saveToStorage(STORAGE_KEYS.STUDENTS, sampleStudents);
  saveToStorage(STORAGE_KEYS.GRADES, sampleGrades);
  saveToStorage(STORAGE_KEYS.SCHEDULE, sampleSchedule);
  saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, sampleAnnouncements);
  saveToStorage(STORAGE_KEYS.DOCUMENTS, sampleDocuments);
  saveToStorage(STORAGE_KEYS.ATTENDANCE, sampleAttendance);
  setSampleMode(true);
}

/**
 * Xóa toàn bộ dữ liệu mẫu để chuyển sang cơ chế quản lý dữ liệu thực tế
 */
export function clearToRealData(): void {
  saveToStorage(STORAGE_KEYS.CLASSES, []);
  saveToStorage(STORAGE_KEYS.STUDENTS, []);
  saveToStorage(STORAGE_KEYS.GRADES, []);
  saveToStorage(STORAGE_KEYS.SCHEDULE, []);
  saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, []);
  saveToStorage(STORAGE_KEYS.DOCUMENTS, []);
  saveToStorage(STORAGE_KEYS.ATTENDANCE, []);
  setSampleMode(false);
}

/**
 * Xuất toàn bộ cơ sở dữ liệu thành tệp JSON sao lưu
 */
export function exportDatabaseBackup(): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: getTeacherProfile(),
    classes: getClasses(),
    students: getStudents(),
    grades: getGrades(),
    schedule: getSchedule(),
    announcements: getAnnouncements(),
    documents: getDocuments(),
    attendance: getAttendance(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Sao_Luu_Mon_Toan_Hoa_Nam_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Nhập dữ liệu sao lưu từ tệp JSON
 */
export function importDatabaseBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) saveToStorage(STORAGE_KEYS.PROFILE, data.profile);
    if (Array.isArray(data.classes)) saveToStorage(STORAGE_KEYS.CLASSES, data.classes);
    if (Array.isArray(data.students)) saveToStorage(STORAGE_KEYS.STUDENTS, data.students);
    if (Array.isArray(data.grades)) saveToStorage(STORAGE_KEYS.GRADES, data.grades);
    if (Array.isArray(data.schedule)) saveToStorage(STORAGE_KEYS.SCHEDULE, data.schedule);
    if (Array.isArray(data.announcements)) saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, data.announcements);
    if (Array.isArray(data.documents)) saveToStorage(STORAGE_KEYS.DOCUMENTS, data.documents);
    if (Array.isArray(data.attendance)) saveToStorage(STORAGE_KEYS.ATTENDANCE, data.attendance);
    window.dispatchEvent(new Event('math_app_data_changed'));
    return true;
  } catch (e) {
    console.error('Lỗi khi phục hồi dữ liệu từ file JSON:', e);
    return false;
  }
}

