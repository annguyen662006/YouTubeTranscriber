import { create } from 'zustand';
import { TranscriptionState } from './types';
import { VI } from './lang/vi';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Danh sách các instance Cobalt (API tải video) để dự phòng (Failover)
// Nếu server đầu bị lỗi, sẽ tự động thử server tiếp theo.
const COBALT_INSTANCES = [
    'https://api.cobalt.tools/api/json',
    'https://co.wuk.sh/api/json',
    'https://cobalt.kwiatekmiki.pl/api/json',
    'https://api.server.cobalt.tools/api/json'
];

// Danh sách các CORS Proxy để tải file binary (tránh lỗi trình duyệt chặn)
const CORS_PROXIES = [
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
];

// Hàm thử tải từ API Cobalt với cơ chế thử lại (Retry)
const getAudioStreamUrl = async (youtubeUrl: string): Promise<string> => {
    let lastError: any = null;

    for (const instance of COBALT_INSTANCES) {
        try {
            console.log(`Trying audio fetch via: ${instance}`);
            const response = await fetch(instance, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: youtubeUrl,
                    isAudioOnly: true,
                    aFormat: 'mp3' // Force MP3 for compatibility
                })
            });

            if (!response.ok) continue; // Thử server khác nếu lỗi

            const data = await response.json();
            
            // Cobalt có thể trả về link trực tiếp hoặc link stream
            if (data.url) return data.url;
            if (data.pickerType === 'various' && data.picker && data.picker.length > 0) {
                return data.picker[0].url;
            }
        } catch (err) {
            console.warn(`Instance ${instance} failed:`, err);
            lastError = err;
        }
    }
    
    throw new Error("Tất cả các server tải đều đang bận. Vui lòng thử lại sau giây lát.");
};

// Hàm tải Binary Audio thông qua Proxy
const downloadAudioBinary = async (audioUrl: string): Promise<ArrayBuffer> => {
    for (const proxyGen of CORS_PROXIES) {
        try {
            const proxyUrl = proxyGen(audioUrl);
            const response = await fetch(proxyUrl);
            if (response.ok) {
                return await response.arrayBuffer();
            }
        } catch (err) {
            console.warn("Proxy failed, trying next...");
        }
    }
    // Nếu thất bại hết proxy, thử tải trực tiếp (có thể ăn may nếu server cho phép CORS)
    const directRes = await fetch(audioUrl);
    if (directRes.ok) return await directRes.arrayBuffer();

    throw new Error("Không thể tải xuống file âm thanh do chặn bảo mật trình duyệt.");
};

const fetchAudioBase64 = async (youtubeUrl: string): Promise<string> => {
    // 1. Lấy link stream audio
    const audioStreamUrl = await getAudioStreamUrl(youtubeUrl);
    
    // 2. Tải file binary về bộ nhớ
    const arrayBuffer = await downloadAudioBinary(audioStreamUrl);

    // 3. Kiểm tra kích thước (Gemini giới hạn file upload)
    const sizeInMB = arrayBuffer.byteLength / (1024 * 1024);
    if (sizeInMB > 19) {
        throw new Error(`File âm thanh quá lớn (${sizeInMB.toFixed(1)}MB). Vui lòng chọn video ngắn hơn (< 15 phút).`);
    }

    // 4. Chuyển đổi sang Base64 thủ công (để tránh lỗi call stack với file lớn)
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    // Xử lý chunk lớn để tránh treo
    for (let i = 0; i < len; i += 1024) {
        const chunk = bytes.subarray(i, Math.min(i + 1024, len));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
};

export const useTranscriptionStore = create<TranscriptionState>((set, get) => ({
  url: '',
  status: 'idle',
  transcript: null,
  errorMessage: null,

  setUrl: (url) => set({ url }),

  fetchTranscription: async () => {
    const { url } = get();
    
    // Validate URL cơ bản
    if (!url.trim() || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
        set({ status: 'error', errorMessage: VI.error.defaultMessage });
        return;
    }

    set({ status: 'loading', errorMessage: null });

    try {
      // BƯỚC 1: Tải Audio thật từ YouTube
      // Quá trình này có thể mất 5-10 giây tùy mạng
      const base64Audio = await fetchAudioBase64(url);

      // BƯỚC 2: Gửi cho Gemini 2.5 nghe
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'audio/mp3',
                        data: base64Audio
                    }
                },
                {
                    text: `
                    Listen to this audio carefully (it is from a YouTube video).
                    
                    TASK:
                    Transcribe the audio VERBATIM (word-for-word). 
                    
                    RULES:
                    1. Do NOT summarize. I need the full transcript.
                    2. If there are multiple speakers, identify them (Speaker 1, Speaker 2...).
                    3. Detect the language accurately. If Vietnamese, write standard Vietnamese.
                    4. Timestamp every segment.
                    `
                }
            ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              duration: {
                type: Type.STRING,
                description: "Estimated duration",
              },
              language: {
                type: Type.STRING,
                description: "Detected language",
              },
              segments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestamp: {
                      type: Type.STRING,
                      description: "Time (e.g. 00:15)",
                    },
                    text: {
                      type: Type.STRING,
                      description: "Exact spoken content",
                    },
                  },
                  required: ["timestamp", "text"],
                },
              },
            },
            required: ["duration", "language", "segments"],
          },
        },
      });

      const jsonText = response.text;
      if (!jsonText) throw new Error("AI không phản hồi kết quả.");

      const result = JSON.parse(jsonText);
      set({ status: 'success', transcript: result });

    } catch (error: any) {
      console.error("Transcription pipeline error:", error);
      
      let message = VI.error.defaultMessage;
      
      // Xử lý thông báo lỗi thân thiện hơn
      if (typeof error.message === 'string') {
          if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
              message = "Lỗi kết nối mạng: Không thể tải file âm thanh về trình duyệt. Vui lòng thử lại hoặc chọn video khác.";
          } else if (error.message.includes('quá lớn')) {
              message = error.message;
          } else if (error.message.includes('400')) {
              message = "Dữ liệu không hợp lệ. Có thể video không tồn tại hoặc ở chế độ riêng tư.";
          } else if (error.message.includes('503') || error.message.includes('500')) {
              message = "Máy chủ Gemini đang bận. Vui lòng thử lại sau vài giây.";
          }
      }

      set({ status: 'error', errorMessage: message });
    }
  },

  reset: () => set({ status: 'idle', url: '', transcript: null, errorMessage: null })
}));