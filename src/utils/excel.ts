import * as XLSX from 'xlsx';
import { Student, GradeRecord, ClassItem, AttendanceSession } from '../types';

/**
 * Xuất danh sách học sinh ra file Excel (.xlsx)
 */
export function exportStudentsToExcel(
  students: Student[],
  grades: GradeRecord[],
  className: string = 'Toan_Bo'
) {
  const gradeMap = new Map<string, GradeRecord>();
  grades.forEach((g) => gradeMap.set(g.studentId, g));

  const rows = students.map((st, index) => {
    const gr = gradeMap.get(st.id);
    return {
      'STT': index + 1,
      'Mã học sinh': st.studentCode,
      'Họ và tên': st.fullName,
      'Lớp': st.className,
      'Giới tính': st.gender,
      'Ngày sinh': st.dateOfBirth,
      'Điểm TB': gr?.dtb != null ? gr.dtb.toFixed(1) : 'Chưa có',
      'Xếp loại': gr?.classification || 'Chưa xếp loại',
      'Điểm mạnh': st.strengths || '',
      'Cần cải thiện': st.weaknesses || '',
      'Ghi chú': st.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học sinh');

  // Auto column width
  const colWidths = [
    { wch: 6 },
    { wch: 14 },
    { wch: 25 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
  ];
  worksheet['!cols'] = colWidths;

  const fileName = `Danh_Sach_Hoc_Sinh_Lop_${className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Xuất bảng điểm môn Toán chuẩn THCS ra file Excel (.xlsx)
 */
export function exportGradeSheetToExcel(
  cls: ClassItem,
  students: Student[],
  grades: GradeRecord[],
  semester: string = 'Học kỳ I',
  academicYear: string = '2026–2027',
  teacherName: string = 'ĐOÀN THỊ VUI',
  schoolName: string = 'TRƯỜNG TH-THCS HÒA NAM'
) {
  const gradeMap = new Map<string, GradeRecord>();
  grades.forEach((g) => gradeMap.set(g.studentId, g));

  const classStudents = students.filter((s) => s.classId === cls.id);

  // Tạo tiêu đề trang tính
  const headerData = [
    [schoolName.toUpperCase()],
    ['BẢNG ĐIỂM KIỂM TRA ĐÁNH GIÁ MÔN TOÁN'],
    [`Lớp: ${cls.name} | ${semester} | Năm học: ${academicYear}`],
    [`Giáo viên bộ môn: ${teacherName}`],
    ['Ngày xuất báo cáo: ' + new Date().toLocaleDateString('vi-VN')],
    [], // Dòng trống
    ['STT', 'Mã HS', 'Họ và tên', 'TX1', 'TX2', 'TX3', 'TX4', 'Giữa kỳ (GK)', 'Cuối kỳ (CK)', 'Điểm TB', 'Xếp loại', 'Ghi chú']
  ];

  const studentRows = classStudents.map((st, idx) => {
    const gr = gradeMap.get(st.id);
    return [
      idx + 1,
      st.studentCode,
      st.fullName,
      gr?.tx1 ?? '',
      gr?.tx2 ?? '',
      gr?.tx3 ?? '',
      gr?.tx4 ?? '',
      gr?.gk ?? '',
      gr?.ck ?? '',
      gr?.dtb != null ? gr.dtb.toFixed(1) : '',
      gr?.classification || '',
      gr?.notes || '',
    ];
  });

  const fullData = [...headerData, ...studentRows];

  const worksheet = XLSX.utils.aoa_to_sheet(fullData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `BangDiem_${cls.name}`);

  // Định dạng độ rộng cột
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 24 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 25 },
  ];

  const fileName = `Bang_Diem_Mon_Toan_${cls.name}_${semester.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Đọc file Excel tải lên và trích xuất danh sách học sinh
 */
export async function readStudentsExcelFile(file: File): Promise<{
  data: any[];
  headers: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (!json || json.length === 0) {
          return resolve({ data: [], headers: [] });
        }

        // Tìm dòng tiêu đề (có chứa 'Họ' hoặc 'Tên' hoặc 'Mã' hoặc dòng đầu tiên có chữ)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(json.length, 10); i++) {
          const rowStr = (json[i] || []).join(' ').toLowerCase();
          if (rowStr.includes('tên') || rowStr.includes('họ') || rowStr.includes('mã') || rowStr.includes('stt')) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = (json[headerRowIndex] || []).map((h: any) => String(h || '').trim());
        const rawRows = json.slice(headerRowIndex + 1);

        const data = rawRows
          .filter((row) => row && row.some((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== ''))
          .map((row) => {
            const obj: Record<string, any> = {};
            headers.forEach((h, idx) => {
              obj[h] = row[idx] !== undefined ? String(row[idx]).trim() : '';
            });
            return obj;
          });

        resolve({ data, headers });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

/**
 * Tải file Excel mẫu để giáo viên nhập học sinh
 */
export function downloadSampleExcelTemplate() {
  const sampleRows = [
    {
      'STT': 1,
      'Mã học sinh': 'HS-801',
      'Họ và tên': 'Nguyễn Văn An',
      'Ngày sinh (YYYY-MM-DD)': '2013-03-15',
      'Giới tính': 'Nam',
      'Ghi chú học tập': 'Tư duy logic nhạy bén, thích hình học',
      'Điểm mạnh': 'Đại số, phân tích đa thức',
      'Cần cải thiện': 'Cần chú ý dấu ngoặc',
    },
    {
      'STT': 2,
      'Mã học sinh': 'HS-802',
      'Họ và tên': 'Trần Thị Bích Ngọc',
      'Ngày sinh (YYYY-MM-DD)': '2013-05-20',
      'Giới tính': 'Nữ',
      'Ghi chú học tập': 'Chăm chỉ, trình bày cẩn thận',
      'Điểm mạnh': 'Lời giải mạch lạc',
      'Cần cải thiện': 'Tốc độ làm bài trắc nghiệm',
    },
    {
      'STT': 3,
      'Mã học sinh': 'HS-803',
      'Họ và tên': 'Lê Hoàng Long',
      'Ngày sinh (YYYY-MM-DD)': '2013-08-10',
      'Giới tính': 'Nam',
      'Ghi chú học tập': 'Tiến bộ rõ rệt trong tháng 10',
      'Điểm mạnh': 'Tính toán số hữu tỉ',
      'Cần cải thiện': 'Vẽ hình phụ',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mẫu nhập học sinh');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 25 },
    { wch: 22 },
    { wch: 10 },
    { wch: 30 },
    { wch: 25 },
    { wch: 25 },
  ];

  XLSX.writeFile(workbook, 'Mau_Nhap_Danh_Sach_Hoc_Sinh_Toan_THCS.xlsx');
}

/**
  * Xuất sổ điểm danh một buổi học ra Excel
  */
export function exportAttendanceSessionToExcel(
  session: AttendanceSession,
  students: Student[],
  schoolName: string = 'TRƯỜNG TH-THCS HÒA NAM',
  teacherName: string = 'ĐOÀN THỊ VUI'
) {
  const classStudents = students.filter((s) => s.classId === session.classId);

  const statusMap = {
    present: 'Có mặt',
    excused: 'Vắng có phép',
    unexcused: 'Vắng không phép',
    late: 'Đi muộn',
  };

  const headerRows = [
    [schoolName.toUpperCase()],
    ['SỔ ĐIỂM DANH TIẾT DẠY MÔN TOÁN'],
    [`Lớp: ${session.className} | Ngày: ${session.date} | Buổi/Tiết: ${session.timeSlot || 'Tiết chuẩn'}`],
    [`Nội dung bài học: ${session.lessonTopic || 'Bài học theo PPCT'}`],
    [`Giáo viên: ${teacherName}`],
    [`Sĩ số: ${session.totalStudents} | Có mặt: ${session.presentCount} | Vắng CP: ${session.excusedCount} | Vắng KP: ${session.unexcusedCount} | Muộn: ${session.lateCount} | Tỷ lệ: ${session.attendanceRate}%`],
    [],
    ['STT', 'Mã học sinh', 'Họ và tên', 'Trạng thái điểm danh', 'Ghi chú / Lý do', 'Liên hệ phụ huynh']
  ];

  const studentRows = classStudents.map((st, idx) => {
    const rec = session.records[st.id] || { status: 'present' };
    return [
      idx + 1,
      st.studentCode,
      st.fullName,
      statusMap[rec.status] || 'Có mặt',
      rec.note || '',
      st.contactParent || '',
    ];
  });

  const fullData = [...headerRows, ...studentRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `DiemDanh_${session.className}`);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 25 },
    { wch: 20 },
    { wch: 30 },
    { wch: 25 },
  ];

  const fileName = `Diem_Danh_${session.className}_${session.date}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
  * Xuất bảng tổng hợp chuyên cần cả tháng của lớp ra Excel
  */
export function exportAttendanceSummaryToExcel(
  cls: ClassItem,
  students: Student[],
  sessions: AttendanceSession[],
  monthStr: string = 'Tháng này',
  schoolName: string = 'TRƯỜNG TH-THCS HÒA NAM'
) {
  const classStudents = students.filter((s) => s.classId === cls.id);
  const classSessions = sessions.filter((sess) => sess.classId === cls.id);

  const headerRows = [
    [schoolName.toUpperCase()],
    ['BẢNG TỔNG HỢP CHUYÊN CẦN MÔN TOÁN'],
    [`Lớp: ${cls.name} | Giai đoạn: ${monthStr} | Tổng số buổi đã điểm danh: ${classSessions.length}`],
    ['Ngày xuất báo cáo: ' + new Date().toLocaleDateString('vi-VN')],
    [],
    ['STT', 'Mã HS', 'Họ và tên', 'Số buổi có mặt', 'Vắng có phép', 'Vắng không phép', 'Đi muộn', 'Tỷ lệ chuyên cần (%)', 'Đánh giá / Cảnh báo']
  ];

  const studentRows = classStudents.map((st, idx) => {
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    classSessions.forEach((sess) => {
      const rec = sess.records[st.id];
      if (!rec || rec.status === 'present') present++;
      else if (rec.status === 'excused') excused++;
      else if (rec.status === 'unexcused') unexcused++;
      else if (rec.status === 'late') late++;
    });

    const total = classSessions.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
    let warning = 'Tốt';
    if (unexcused >= 3 || (excused + unexcused) >= 5) {
      warning = 'Cần lưu ý: Vắng nhiều!';
    } else if (late >= 3) {
      warning = 'Thường xuyên đi muộn';
    } else if (rate >= 95) {
      warning = 'Chuyên cần xuất sắc';
    }

    return [
      idx + 1,
      st.studentCode,
      st.fullName,
      present,
      excused,
      unexcused,
      late,
      `${rate}%`,
      warning,
    ];
  });

  const fullData = [...headerRows, ...studentRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `TongHop_${cls.name}`);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 25 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 26 },
  ];

  const fileName = `Tong_Hop_Chuyen_Can_${cls.name}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

