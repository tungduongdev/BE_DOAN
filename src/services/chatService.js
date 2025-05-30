import { GoogleGenerativeAI, HarmBlockThreshold } from '@google/generative-ai';
import { env } from '../config/environment.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Safety settings with correct HarmCategory values
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: HarmBlockThreshold.MEDIUM,
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: HarmBlockThreshold.MEDIUM,
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: HarmBlockThreshold.MEDIUM,
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: HarmBlockThreshold.MEDIUM,
  },
];

// Context about the project that will be sent with each message
const PROJECT_CONTEXT = `
Bạn là trợ lý AI cho một ứng dụng quản lý dự án tương tự Trello. Ứng dụng có các tính năng chính sau:

1. Quản lý Bảng (Board):
   - Tạo bảng mới: Click nút "Tạo bảng mới" ở trang chủ, nhập tên và chọn chế độ riêng tư/công khai
   - Chỉnh sửa bảng: Vào bảng > click biểu tượng "..." > chọn "Chỉnh sửa bảng"
   - Xóa bảng: Vào bảng > click biểu tượng "..." > chọn "Xóa bảng" (chỉ chủ sở hữu mới có quyền này)
   - Mời thành viên: Click "Thêm thành viên" > nhập email > chọn quyền hạn > gửi lời mời

2. Quản lý Danh sách và Thẻ:
   - Tạo danh sách: Click "Thêm danh sách" trong bảng > nhập tên
   - Tạo thẻ: Click "Thêm thẻ" trong danh sách > nhập thông tin thẻ
   - Chỉnh sửa thẻ: Click vào thẻ > chỉnh sửa mô tả, ngày hết hạn, nhãn
   - Di chuyển thẻ: Kéo và thả thẻ giữa các danh sách
   - Đính kèm file: Trong thẻ > click "Đính kèm" > chọn file (hỗ trợ hình ảnh, PDF, etc.)
   - Thêm nhãn: Trong thẻ > click "Nhãn" > chọn màu và tên nhãn
   - Gán người thực hiện: Trong thẻ > click "Thành viên" > chọn người thực hiện

3. Tính năng Người dùng:
   - Đăng ký: Click "Đăng ký" > điền thông tin > xác nhận email
   - Đăng nhập: Nhập email và mật khẩu
   - Quản lý profile: Click avatar > "Cài đặt tài khoản"
   - Đổi mật khẩu: Trong cài đặt tài khoản > "Đổi mật khẩu"

4. Tương tác Thời gian thực:
   - Thông báo: Click biểu tượng chuông để xem thông báo mới
   - Cập nhật tự động: Các thay đổi từ thành viên khác hiển thị ngay lập tức
   - Chat: Click biểu tượng chat để trao đổi với AI assistant

5. Tính năng Nâng cao:
   - Tìm kiếm: Sử dụng thanh tìm kiếm để tìm bảng, thẻ
   - Lọc thẻ: Trong bảng > click "Lọc" > chọn điều kiện (người thực hiện, nhãn, ngày)
   - Sao chép thẻ/bảng: Click "..." trên thẻ/bảng > chọn "Sao chép"
   - Xuất dữ liệu: Trong bảng > "..." > "Xuất dữ liệu"

Lưu ý quan trọng:
- Đảm bảo đã xác minh email sau khi đăng ký
- Chỉ chủ sở hữu bảng mới có quyền xóa bảng và quản lý quyền thành viên
- File đính kèm có giới hạn dung lượng 10MB
- Nên đặt ngày hết hạn cho các thẻ công việc quan trọng
- Sử dụng nhãn để phân loại và quản lý thẻ hiệu quả

Hãy trả lời bằng tiếng Việt một cách chi tiết và dễ hiểu, tập trung vào hướng dẫn từng bước thực hiện.
Khi người dùng hỏi về một tính năng cụ thể, hãy giải thích chi tiết cách sử dụng và các lưu ý quan trọng.
`;

const chat = async (reqBody) => {
  try {
    // Validate input
    if (!reqBody?.message || typeof reqBody.message !== 'string') {
      throw new Error('Invalid or missing message in request body');
    }

    // Trim and sanitize input
    const prompt = reqBody.message.trim();
    if (prompt.length === 0) {
      throw new Error('Message cannot be empty');
    }

    // Combine project context with user's message
    const fullPrompt = `${PROJECT_CONTEXT}\n\nCâu hỏi của người dùng: ${prompt}\n\nVui lòng trả lời chi tiết bằng tiếng Việt về cách sử dụng tính năng này trong dự án của chúng ta:`;

    // Use a supported model, e.g., gemini-2.0-flash-001
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-001', // Updated model name
      safetySettings,
    }, { apiVersion: 'v1' }); // Update to v1 since v1beta may not support newer models

    // Generate content with configuration
    const result = await model.generateContent({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.9,
      },
    });

    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      reply: text,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Gemini API Error:', {
      message: error.message,
      stack: error.stack,
    });

    // Handle specific error cases
    if (error.message.includes('API key')) {
      throw new Error('Invalid or missing API key configuration');
    }

    if (error.message.includes('Quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    }

    throw new Error(error.message || 'Không thể kết nối với Gemini');
  }
};

export const chatService = {
  chat,
};