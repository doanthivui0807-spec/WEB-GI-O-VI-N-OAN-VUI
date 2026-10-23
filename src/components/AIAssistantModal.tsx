import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Copy, 
  Check, 
  BookOpen, 
  GraduationCap, 
  FileCheck, 
  HelpCircle,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { TeacherProfile } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  initialPrompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  profile,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào cô Đoàn Thị Vui! Em là Trợ lý AI Toán học đồng hành cùng cô tại ${profile.school}.
Em có thể hỗ trợ cô:
• Soạn Kế hoạch bài dạy (giáo án) Toán 6, 7, 8, 9 chuẩn CV 5512
• Ra đề trắc nghiệm và ma trận kiểm tra định kỳ
• Hướng dẫn giải toán và phân hóa bài tập theo năng lực
• Đề xuất giải pháp bồi dưỡng học sinh cần quan tâm
• Soạn lời nhận xét học bạ và tin nhắn gửi phụ huynh

Cô hãy chọn một gợi ý bên dưới hoặc gửi yêu cầu cho em nhé!`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Gợi ý Kế hoạch bài dạy Toán 8: Hằng đẳng thức (GDPT 2018)',
    'Tạo 5 câu trắc nghiệm Toán 9 có ma trận 4 mức độ nhận thức',
    'Tạo bài tập phân hóa 3 mức độ cho học sinh lớp 8A5',
    'Hướng dẫn giải bài toán chứng minh Tứ giác nội tiếp lớp 9',
    'Đề xuất 3 biện pháp kèm cặp học sinh có điểm dưới 5.0',
    'Gợi ý nhận xét học bạ môn Toán khích lệ học sinh tiến bộ',
    'Ý tưởng trò chơi khởi động Toán 6: Phép tính số nguyên',
    'Soạn tin nhắn Zalo gửi phụ huynh nhắc lịch kiểm tra định kỳ',
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle initial prompt passed from other modules
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: promptText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: `Bạn là "TRỢ LÝ AI TOÁN HỌC – CÔ VUI", trợ lý sư phạm cao cấp dành riêng cho cô giáo Đoàn Thị Vui (Giáo viên Toán – ${profile.school}).
Bạn chuyên sâu Chương trình GDPT 2018 môn Toán THCS (lớp 6, 7, 8, 9).
Khi trả lời:
- Luôn giữ thái độ ân cần, tôn trọng, chuyên nghiệp.
- Trình bày công thức Toán rõ ràng, mạch lạc, dễ hiểu.
- Các bài tập hoặc giáo án phải phân chia rõ ràng: Mức 1 (Nhận biết), Mức 2 (Thông hiểu), Mức 3 (Vận dụng), Mức 4 (Vận dụng cao).
- Cung cấp nội dung hoàn chỉnh để cô giáo có thể sao chép trực tiếp vào giáo án hoặc đề bài.`,
        }),
      });

      const data = await res.json();
      let replyText = data.reply;

      if (!res.ok || !replyText) {
        // Fallback intelligent pedagogical response if server API key is not configured
        replyText = generatePedagogicalFallback(promptText, profile);
      }

      const aiMsg: Message = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn('Fallback AI triggered:', err);
      const fallbackReply = generatePedagogicalFallback(promptText, profile);
      const aiMsg: Message = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: fallbackReply,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-3xl shadow-2xl flex flex-col transition-all duration-300 border border-slate-200 ${
          isExpanded ? 'w-[96vw] h-[94vh]' : 'max-w-2xl w-full h-[85vh]'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B2D59] via-[#1565C0] to-[#1E88E5] text-white p-4 sm:p-5 rounded-t-3xl flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-slate-950 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold font-serif tracking-wide">
                  TRỢ LÝ AI TOÁN HỌC – CÔ VUI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs text-sky-100 italic">
                Chuyên môn Toán THCS – Trường TH-THCS Hòa Nam
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-sky-100 transition"
              title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-sky-100 transition"
              title="Đóng trợ lý AI"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
          {messages.map((m) => {
            const isAI = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex items-start space-x-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-full bg-[#1565C0] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed font-serif whitespace-pre-line relative group ${
                    isAI
                      ? 'bg-white text-slate-800 border border-slate-200/90'
                      : 'bg-[#1565C0] text-white'
                  }`}
                >
                  <div>{m.text}</div>
                  
                  <div className={`flex items-center justify-between mt-2 pt-1 border-t text-[10px] ${
                    isAI ? 'border-slate-100 text-slate-400' : 'border-white/20 text-sky-100'
                  }`}>
                    <span>{m.time}</span>
                    {isAI && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="inline-flex items-center space-x-1 text-[#1565C0] hover:text-[#0B2D59] font-bold"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    Cô
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-3 text-xs text-slate-500 font-semibold p-3 bg-white rounded-2xl border border-slate-200 w-fit animate-pulse">
              <RefreshCw className="w-4 h-4 text-[#1565C0] animate-spin" />
              <span>Trợ lý AI đang suy nghĩ và biên soạn nội dung sư phạm cho cô...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="p-3 bg-white border-t border-slate-100 overflow-x-auto scrollbar-thin shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Gợi ý thao tác nhanh môn Toán:</span>
          </div>
          <div className="flex items-center space-x-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(p)}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#1565C0] text-[11px] font-medium border border-sky-100 shrink-0 transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white rounded-b-3xl border-t border-slate-200 flex items-center space-x-2 shrink-0">
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt(inputValue);
              }
            }}
            placeholder="Hỏi AI về giáo án, bài toán, ma trận đề, nhận xét học sinh..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#1565C0] font-serif resize-none"
          />

          <button
            onClick={() => handleSendPrompt(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 rounded-2xl bg-[#1565C0] hover:bg-[#0B2D59] text-white disabled:opacity-40 transition shadow-md"
            title="Gửi câu hỏi"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Intelligent Pedagogical Fallback when API key is not present or network is restricted
 */
function generatePedagogicalFallback(prompt: string, profile: TeacherProfile): string {
  const p = prompt.toLowerCase();

  if (p.includes('giáo án') || p.includes('kế hoạch bài dạy') || p.includes('hằng đẳng thức')) {
    return `KẾ HOẠCH BÀI DẠY MÔN TOÁN 8 (THEO CÔNG VĂN 5512/BGDĐT)
Chủ đề: NHỮNG HẰNG ĐẲNG THỨC ĐÁNG NHỚ (Tiết 1)
Giáo viên: ${profile.name} | Trường: ${profile.school}

I. MỤC TIÊU:
1. Kiến thức:
- Học sinh nhận biết và phát biểu được 3 hằng đẳng thức đầu tiên:
  (A + B)² = A² + 2AB + B²
  (A - B)² = A² - 2AB + B²
  A² - B² = (A - B)(A + B)
2. Năng lực:
- Năng lực tư duy và lập luận toán học: Biết so sánh, khái quát hóa từ các trường hợp cụ thể.
- Năng lực giải quyết vấn đề: Vận dụng tính nhanh và rút gọn biểu thức.
3. Phẩm chất:
- Rèn tính cẩn thận, chính xác khi biến đổi dấu và hệ số.

II. TIẾN TRÌNH DẠY HỌC:
• Hoạt động 1: Khởi động (5 phút)
- Trò chơi "Ai nhanh hơn": Tính nhanh (x + 1)(x + 1) và (x + 2)(x + 2).
• Hoạt động 2: Hình thành kiến thức (18 phút)
- Khái quát công thức bình phương một tổng thông qua ghép diện tích hình vuông.
• Hoạt động 3: Luyện tập (15 phút) - Phân hóa:
  - Mức 1 (Nhận biết): Tính (x + 3)², (2x + 1)²
  - Mức 2 (Thông hiểu): Tính nhanh 101², 99²
  - Mức 3 (Vận dụng): Rút gọn P = (x + 2)² - (x - 2)²
• Hoạt động 4: Vận dụng & Hướng dẫn về nhà (7 phút).`;
  }

  if (p.includes('trắc nghiệm') || p.includes('ma trận')) {
    return `BỘ 5 CÂU TRẮC NGHIỆM ĐÁNH GIÁ 4 MỨC ĐỘ NHẬN THỨC MÔN TOÁN THCS

Câu 1 [Mức 1: Nhận biết]:
Kết quả của phép tính (x - y)² là:
A. x² - y²          B. x² - 2xy + y² (Đáp án đúng)
C. x² + 2xy + y²    D. x² - xy + y²

Câu 2 [Mức 1: Nhận biết]:
Căn bậc hai số học của 81 là:
A. 9 (Đáp án đúng)  B. -9
C. ±9               D. 81

Câu 3 [Mức 2: Thông hiểu]:
Biểu thức (x - 3)(x + 3) viết dưới dạng hiệu hai bình phương là:
A. x² - 6           B. x² - 9 (Đáp án đúng)
C. x² + 9           D. 9 - x²

Câu 4 [Mức 3: Vận dụng]:
Giá trị nhỏ nhất của biểu thức A = x² - 4x + 7 là:
A. 7                B. 4
C. 3 (Đáp án đúng vì A = (x-2)² + 3 ≥ 3)
D. 0

Câu 5 [Mức 4: Vận dụng cao]:
Cho x + y = 5 và xy = 6. Giá trị của x³ + y³ là:
A. 35 (Đáp án đúng: (x+y)³ - 3xy(x+y) = 125 - 90 = 35)
B. 65
C. 125
D. 95`;
  }

  if (p.includes('kèm cặp') || p.includes('dưới 5') || p.includes('học sinh yếu')) {
    return `ĐỀ XUẤT 4 BIỆN PHÁP SƯ PHẠM KÈM CẶP HỌC SINH MÔN TOÁN CẦN HỖ TRỢ:

1. Phân loại lỗ hổng kiến thức cốt lõi:
- Thường học sinh bị điểm dưới 5.0 do hổng kỹ năng cộng trừ số âm, quy tắc chuyển vế đổi dấu và quy đồng mẫu số.
- Thiết kế riêng "Phiếu ôn tập cấp tốc 10 phút" tập trung vào 1 dạng toán cơ bản nhất mỗi ngày.

2. Mô hình "Đôi bạn cùng tiến":
- Xếp một học sinh khá giỏi ngồi cạnh để hỗ trợ nhắc nhở kiểm tra đáp số bài tập về nhà.

3. Khích lệ tâm lý và chia nhỏ mục tiêu:
- Thay vì yêu cầu làm trọn vẹn cả bài kiểm tra 10 câu, cô hãy giao mục tiêu đạt chắc chắn 5 điểm ở phần nhận biết, sau đó cho điểm cộng tiến bộ khi em đạt được.

4. Phối hợp với gia đình qua Zalo:
- Gửi tin nhắn ngắn gọn, thân tình cho phụ huynh hướng dẫn khung giờ 20h-20h30 cho con luyện 3 bài toán mẫu.`;
  }

  return `GỢI Ý CHUYÊN MÔN DÀNH CHO CÔ ĐOÀN THỊ VUI:

Em đã ghi nhận yêu cầu của cô về: "${prompt}".

Đề xuất giải pháp thực hiện:
1. Mục tiêu trọng tâm: Bám sát chuẩn đầu ra Chương trình GDPT 2018 môn Toán của trường TH-THCS Hòa Nam.
2. Phương pháp: Kết hợp trực quan hóa hình học (thước, compa, mô hình GeoGebra) và chia nhỏ bước tư duy đại số.
3. Phân hóa đối tượng:
   - Nhóm cần hỗ trợ: Củng cố công thức mẫu, làm bài tập tương tự.
   - Nhóm khá giỏi: Mở rộng bài toán thực tế và tìm tòi cách giải hay.

Cô có thể sao chép nội dung này hoặc nhấn thêm một câu hỏi chi tiết hơn để em hỗ trợ cô trọn vẹn nhất nhé!`;
}
