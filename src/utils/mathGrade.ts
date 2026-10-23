import { GradeRecord } from '../types';

/**
 * Tính điểm trung bình môn Toán theo quy chuẩn:
 * ĐTB = (Tổng các điểm TX + 2 * GK + 3 * CK) / (Số lượng điểm TX + 5)
 */
export function calculateAverage(record: Partial<GradeRecord>): number | null {
  const txScores: number[] = [];
  if (record.tx1 !== undefined && record.tx1 !== null && !isNaN(record.tx1)) txScores.push(record.tx1);
  if (record.tx2 !== undefined && record.tx2 !== null && !isNaN(record.tx2)) txScores.push(record.tx2);
  if (record.tx3 !== undefined && record.tx3 !== null && !isNaN(record.tx3)) txScores.push(record.tx3);
  if (record.tx4 !== undefined && record.tx4 !== null && !isNaN(record.tx4)) txScores.push(record.tx4);

  const hasGK = record.gk !== undefined && record.gk !== null && !isNaN(record.gk);
  const hasCK = record.ck !== undefined && record.ck !== null && !isNaN(record.ck);

  // Cần có tối thiểu 1 điểm TX, điểm GK và điểm CK để tính ĐTB hoàn chỉnh
  if (txScores.length === 0 && !hasGK && !hasCK) {
    return null;
  }

  // Nếu chưa có đủ cả GK và CK nhưng có một số điểm, tính điểm tạm thời
  if (hasGK && hasCK) {
    const sumTX = txScores.reduce((acc, val) => acc + val, 0);
    const weight = txScores.length + 2 + 3; // số lượng TX + 2 cho GK + 3 cho CK
    const total = sumTX + 2 * (record.gk || 0) + 3 * (record.ck || 0);
    const avg = total / weight;
    return Math.round(avg * 10) / 10;
  }

  // Nếu chỉ có thường xuyên hoặc giữa kỳ
  const components: { score: number; weight: number }[] = [];
  txScores.forEach(s => components.push({ score: s, weight: 1 }));
  if (hasGK) components.push({ score: record.gk!, weight: 2 });
  if (hasCK) components.push({ score: record.ck!, weight: 3 });

  const totalWeight = components.reduce((acc, c) => acc + c.weight, 0);
  if (totalWeight === 0) return null;

  const totalScore = components.reduce((acc, c) => acc + c.score * c.weight, 0);
  return Math.round((totalScore / totalWeight) * 10) / 10;
}

/**
 * Xếp loại học lực theo Thông tư đánh giá THCS
 */
export function classifyGrade(avg: number | null): 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' | 'Chưa xếp loại' {
  if (avg === null || isNaN(avg)) return 'Chưa xếp loại';
  if (avg >= 8.0) return 'Tốt';
  if (avg >= 6.5) return 'Khá';
  if (avg >= 5.0) return 'Đạt';
  return 'Chưa đạt';
}

/**
 * Đánh giá xu hướng tiến bộ qua các lần kiểm tra
 */
export function assessProgress(record: Partial<GradeRecord>): {
  status: 'Tiến bộ vượt bậc' | 'Có tiến bộ' | 'Giữ vững' | 'Cần hỗ trợ' | 'Chưa đủ dữ liệu';
  color: string;
  description: string;
} {
  const scores: { name: string; val: number }[] = [];
  if (record.tx1 != null) scores.push({ name: 'TX1', val: record.tx1 });
  if (record.tx2 != null) scores.push({ name: 'TX2', val: record.tx2 });
  if (record.tx3 != null) scores.push({ name: 'TX3', val: record.tx3 });
  if (record.gk != null) scores.push({ name: 'GK', val: record.gk });
  if (record.ck != null) scores.push({ name: 'CK', val: record.ck });

  if (scores.length < 2) {
    return {
      status: 'Chưa đủ dữ liệu',
      color: 'text-slate-500 bg-slate-100',
      description: 'Chưa có đủ các cột điểm để đối chiếu xu hướng'
    };
  }

  const firstScore = scores[0].val;
  const lastScore = scores[scores.length - 1].val;
  const diff = lastScore - firstScore;

  if (lastScore < 5.0 || (record.dtb != null && record.dtb < 5.0)) {
    return {
      status: 'Cần hỗ trợ',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      description: 'Điểm dưới trung bình hoặc gặp khó khăn ở các nội dung gần đây'
    };
  }

  if (diff >= 1.5) {
    return {
      status: 'Tiến bộ vượt bậc',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: `Tăng ${diff.toFixed(1)} điểm so với bài đầu tiên, tiến bộ rất rõ rệt!`
    };
  }

  if (diff >= 0.5) {
    return {
      status: 'Có tiến bộ',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      description: `Tăng ${diff.toFixed(1)} điểm, giữ nhịp học tập tốt`
    };
  }

  if (diff >= -0.5) {
    return {
      status: 'Giữ vững',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      description: 'Phong độ ổn định qua các đợt kiểm tra'
    };
  }

  return {
    status: 'Cần hỗ trợ',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    description: `Điểm giảm ${Math.abs(diff).toFixed(1)} điểm, cần nhắc nhở và củng cố kiến thức`
  };
}
