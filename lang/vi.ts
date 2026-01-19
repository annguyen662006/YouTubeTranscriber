export const VI = {
  header: {
    title: "YouTube Transcriber",
    nav: {
      home: "Trang chủ",
      features: "Tính năng",
      pricing: "Giá cả",
      contact: "Liên hệ",
      history: "Lịch sử",
      support: "Hỗ trợ"
    },
    auth: {
      login: "Đăng nhập",
      register: "Đăng ký"
    }
  },
  home: {
    heroTitle: "Chuyển đổi Video YouTube",
    heroTitleBreak: "sang Văn bản",
    description: "Sức mạnh Supabase & Gemini 2.5: Xử lý âm thanh Native Audio trên Cloud Server tốc độ cao.",
    placeholder: "Dán đường dẫn URL video YouTube tại đây...",
    startBtn: "Bắt đầu chuyển đổi",
    features: {
      noCard: "Cloud Processing",
      fast: "Native Audio Model",
      multiLang: "Đa ngôn ngữ"
    }
  },
  loading: {
    title: "Đang xử lý trên Cloud...",
    subtitle: "Yêu cầu đã được gửi tới Supabase Edge Function. Hệ thống đang tải âm thanh và phân tích trực tiếp.",
    steps: {
      audio: "Kết nối Supabase Cloud",
      api: "Server đang tải Audio...",
      extract: "Gemini 2.5 đang nghe...",
      timestamp: "Đang tạo định dạng JSON..."
    },
    cancel: "Hủy bỏ"
  },
  result: {
    title: "Kết quả Audio-to-Text",
    new: "Tạo bản mới",
    copy: "Sao chép văn bản",
    copied: "Đã sao chép!",
    duration: "Thời lượng",
    language: "Ngôn ngữ phát hiện",
    footer: {
      model: "Powered by Gemini 2.5 Flash (Server-side)",
      export: ["Export .SRT", "Export .TXT", "Export .JSON"]
    }
  },
  error: {
    title: "Lỗi xử lý",
    defaultMessage: "Đã xảy ra lỗi khi xử lý trên Server. Vui lòng kiểm tra lại URL hoặc thử lại sau.",
    tryAgain: "Thử lại",
    report: "Báo cáo vấn đề",
    breadcrumbs: {
      url: "URL",
      analyze: "Cloud Analyze",
      result: "Kết quả"
    }
  },
  footer: "© 2024 YouTube Transcriber. All rights reserved."
};