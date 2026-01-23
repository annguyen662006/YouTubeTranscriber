
export const VI = {
  header: {
    title: "Chép Lời YouTube",
    nav: {
      home: "Trang chủ",
      history: "Lịch sử",
    }
  },
  home: {
    heroTitle: "Chuyển đổi Video YouTube",
    heroTitleBreak: "sang Văn bản",
    description: "Sử dụng công nghệ Supabase Edge kết hợp Groq (Whisper) tốc độ siêu tốc để trích xuất văn bản và Gemini AI để chuẩn hóa dữ liệu.",
    placeholder: "Dán đường dẫn URL video YouTube tại đây...",
    startBtn: "Bắt đầu trích xuất",
    footerText: "Phát triển bởi Thành Vinh",
    features: {
      noCard: "Trích xuất trực tiếp",
      fast: "Tốc độ cực nhanh",
      multiLang: "Hỗ trợ mọi ngôn ngữ"
    }
  },
  loading: {
    title: "Đang trích xuất dữ liệu...",
    subtitle: "Hệ thống đang tải luồng âm thanh, sử dụng Groq Whisper để nghe và Gemini để phân tích.",
    steps: {
      audio: "Kết nối Engine (YouTube MP3)",
      api: "Đang tải luồng dữ liệu...",
      extract: "Groq AI (Whisper) đang nghe...",
      timestamp: "Gemini đang tạo định dạng JSON...",
      fixing: "Gemini AI đang sửa lỗi chính tả & định dạng..."
    },
    cancel: "Hủy bỏ"
  },
  result: {
    title: "Nội dung Video",
    new: "Tạo bản mới",
    copy: "Sao chép",
    copied: "Đã sao chép!",
    fixGrammar: "Sửa lại (Thủ công)",
    duration: "Thời lượng",
    language: "Ngôn ngữ",
    footer: {
      model: "Phát triển bởi Thành Vinh",
      downloadDoc: "Tải xuống file .DOC"
    },
    modal: {
        title: "Chỉnh sửa văn bản (Gemini AI)",
        description: "Gemini sẽ phân tích và sửa lỗi chính tả, ngữ pháp cho toàn bộ văn bản.",
        original: "Bản gốc",
        corrected: "Bản đã sửa",
        fixing: "Đang xử lý...",
        confirm: "Áp dụng thay đổi",
        cancel: "Hủy bỏ"
    }
  },
  history: {
      title: "Lịch sử chuyển đổi",
      empty: "Chưa có dữ liệu lịch sử.",
      table: {
          index: "#",
          video: "Video / Tiêu đề",
          duration: "Thời lượng",
          status: "Trạng thái",
          date: "Ngày tạo",
          action: "Hành động"
      },
      status: {
          success: "Thành công",
          error: "Lỗi"
      },
      modalTitle: "Nội dung chi tiết",
      delete: {
          tooltip: "Xóa bản ghi",
          title: "Xác nhận xóa",
          message: "Bạn có chắc chắn muốn xóa bản ghi này không? Hành động này không thể hoàn tác.",
          confirm: "Xóa vĩnh viễn",
          cancel: "Hủy bỏ"
      }
  },
  error: {
    title: "Không thể trích xuất",
    defaultMessage: "Không tìm thấy dữ liệu phù hợp. Video có thể bị giới hạn quyền truy cập hoặc quá dài.",
    tryAgain: "Thử link khác",
    report: "Báo cáo vấn đề",
    breadcrumbs: {
      url: "URL",
      analyze: "Phân tích",
      result: "Kết quả"
    }
  },
  footer: "© 2026 Chép Lời YouTube. Bảo lưu mọi quyền."
};