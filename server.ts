import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Assistant endpoint for Math Teacher Co Vui
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Nội dung yêu cầu không được để trống.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm khóa trong mục Cài đặt hoặc Secrets.',
        fallback: true
      });
    }

    const defaultInstruction = `Bạn là "TRỢ LÝ AI TOÁN HỌC – CÔ VUI", trợ lý thông minh chuyên môn Toán THCS (lớp 6, 7, 8, 9) theo Chương trình Giáo dục phổ thông (GDPT 2018) Việt Nam dành cho cô giáo Đoàn Thị Vui (Trường TH-THCS Hòa Nam).
Phong cách: Tận tâm, sư phạm chuẩn mực, ngôn từ tiếng Việt trong sáng, hướng dẫn chi tiết, công thức Toán rõ ràng (dùng ký hiệu trực quan), phân hóa học sinh phù hợp (Giỏi, Khá, Đạt, Cần hỗ trợ).
Luôn đưa ra câu trả lời thực tế, có thể sao chép ngay để sử dụng vào giáo án, phiếu học tập, đề kiểm tra hoặc gửi phụ huynh/học sinh.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || defaultInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Không có phản hồi từ mô hình.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Lỗi Gemini API:', error);
    return res.status(500).json({
      error: error?.message || 'Có lỗi xảy ra khi xử lý phản hồi từ AI.',
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Không thể khởi động server:', err);
});
