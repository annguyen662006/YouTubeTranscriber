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
    description: "Công nghệ Native Audio Processing: Trích xuất âm thanh trực tiếp và sử dụng AI để nghe và chép lại chính xác từng từ.",
    placeholder: "Dán đường dẫn URL video YouTube tại đây...",
    startBtn: "Bắt đầu chuyển đổi",
    features: {
      noCard: "Native Speech-to-Text",
      fast: "Không phỏng đoán",
      multiLang: "Độ chính xác 99%"
    }
  },
  loading: {
    title: "Đang xử lý âm thanh thực...",
    subtitle: "Chúng tôi đang tải luồng âm thanh từ YouTube và gửi cho AI nghe. Quá trình này đảm bảo độ chính xác tuyệt đối.",
    steps: {
      audio: "Kết nối máy chủ Audio",
      api: "Đang tải xuống file âm thanh (MP3)...",
      extract: "AI đang nghe và phân tích...",
      timestamp: "Đồng bộ hóa thời gian..."
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
      model: "Powered by Gemini 2.5 Flash (Native Audio)",
      export: ["Export .SRT", "Export .TXT", "Export .JSON"]
    }
  },
  error: {
    title: "Lỗi xử lý",
    defaultMessage: "Không thể tải xuống âm thanh từ video này. Video có thể quá dài, bị giới hạn bản quyền hoặc Server tải đang bận.",
    tryAgain: "Thử lại",
    report: "Báo cáo vấn đề",
    breadcrumbs: {
      url: "URL",
      analyze: "Tải âm thanh",
      result: "Kết quả"
    }
  },
  footer: "© 2024 YouTube Transcriber. All rights reserved."
};