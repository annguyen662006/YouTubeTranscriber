
import { create } from 'zustand';
import { TranscriptionState } from './types';
import { VI } from './lang/vi';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase Client
const SUPABASE_URL = 'https://gljzvvegdkwpgitbnjcb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S0ZBExbtXioOE3DgS26fgA_Nwq46a_A'; // Publishable Key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Biến lưu trữ interval của bộ đếm tiến trình
let progressInterval: any = null;

export const useTranscriptionStore = create<TranscriptionState>((set, get) => ({
  view: 'home',
  setView: (view) => set({ view }),

  url: '',
  status: 'idle',
  transcript: null,
  errorMessage: null,
  progress: 0,
  loadingMessage: VI.loading.steps.audio,
  
  history: [],
  fetchHistory: async () => {
      const { data, error } = await supabase
          .from('transcriptions')
          .select('*')
          .order('created_at', { ascending: false });
      
      if (!error && data) {
          set({ history: data as any });
      }
  },

  deleteHistoryItem: async (id: string) => {
      // Thêm option count: 'exact' để kiểm tra số dòng thực sự bị xóa
      const { error, count } = await supabase
          .from('transcriptions')
          .delete({ count: 'exact' })
          .eq('id', id);

      if (!error && count !== null && count > 0) {
          // Chỉ cập nhật state nếu DB đã xóa thành công ít nhất 1 dòng
          set((state) => ({
              history: state.history.filter(item => item.id !== id)
          }));
      } else {
          console.error("Failed to delete history item:", error || "No rows deleted (Check RLS Policies)");
          // Nếu xóa thất bại (do lỗi mạng hoặc RLS chặn), reload lại history để đảm bảo đồng bộ
          get().fetchHistory();
      }
  },

  setUrl: (url) => set({ url }),

  fetchTranscription: async () => {
    const { url } = get();
    
    // Validate URL
    if (!url.trim() || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
        set({ status: 'error', errorMessage: VI.error.defaultMessage });
        return;
    }

    // Reset state & Start Simulation
    if (progressInterval) clearInterval(progressInterval);
    
    set({ 
        status: 'loading', 
        errorMessage: null, 
        progress: 0, 
        loadingMessage: VI.loading.steps.audio 
    });

    // --- START SMART SIMULATION ---
    // Giả lập tiến trình để UI mượt mà trong khi chờ Server xử lý đồng bộ
    progressInterval = setInterval(() => {
        set((state) => {
            const current = state.progress;
            let step = 0;
            let msg = state.loadingMessage;

            // Logic tăng tiến trình theo giai đoạn (Logarithmic Simulation)
            if (current < 20) {
                step = 1.5 + Math.random(); // Giai đoạn đầu: Kết nối nhanh
                msg = VI.loading.steps.audio;
            } else if (current < 50) {
                step = 0.4 + Math.random() * 0.5; // Giai đoạn 2: Tải dữ liệu (đều đặn)
                msg = VI.loading.steps.api;
            } else if (current < 75) {
                step = 0.2 + Math.random() * 0.3; // Giai đoạn 3: Groq AI (hơi chậm lại)
                msg = VI.loading.steps.extract;
            } else if (current < 85) {
                 // Đợi phản hồi server
                 step = 0.05;
                 msg = VI.loading.steps.timestamp;
            } else {
                step = 0; // Giữ ở mức cao chờ Gemini client-side
            }

            const newProgress = Math.min(current + step, 85);

            return {
                progress: newProgress,
                loadingMessage: msg
            };
        });
    }, 150); // Cập nhật mỗi 150ms
    // --- END SMART SIMULATION ---

    let attempts = 0;
    const maxAttempts = 40; // ~ 2 phút tối đa
    let isComplete = false;

    try {
        while (!isComplete && attempts < maxAttempts) {
            attempts++;
            
            // Gọi Edge Function (Groq Whisper)
            const { data, error } = await supabase.functions.invoke('transcribe-youtube', {
                body: { url: url }
            });

            if (error) {
                console.error("Supabase Invoke Error:", error);
                throw new Error("Lỗi kết nối đến máy chủ phân tích.");
            }

            if (!data) throw new Error("Không nhận được phản hồi từ server.");

            // TRƯỜNG HỢP 1: Đang xử lý (RapidAPI Processing Phase)
            if (data.processing === true) {
                if (data.progress && data.progress > get().progress) {
                    set({ progress: data.progress });
                }
                await delay(3000);
                continue;
            }

            // TRƯỜNG HỢP 2: Thành công từ Groq -> Bắt đầu bước Gemini Client-side
            if (data.segments) {
                let finalData = data;

                // --- AUTO GRAMMAR FIX STEP (MOVED TO SERVER) ---
                set({ 
                    progress: 90, 
                    loadingMessage: VI.loading.steps.fixing 
                });

                try {
                    const rawText = finalData.segments.map((s: any) => s.text).join('\n\n');
                    
                    // Gọi Edge Function thay vì gọi trực tiếp Gemini ở Client
                    const { data: fixData, error: fixError } = await supabase.functions.invoke('transcribe-youtube', {
                        body: { 
                            action: 'fix_grammar', 
                            text: rawText 
                        }
                    });

                    if (!fixError && fixData && fixData.correctedText) {
                        // Tạo segments mới từ văn bản đã sửa
                        const newSegments = fixData.correctedText.split('\n\n').map((t: string) => ({
                            timestamp: '', 
                            text: t.trim()
                        })).filter((s: any) => s.text.length > 0);
                        
                        finalData = {
                            ...finalData,
                            segments: newSegments
                        };
                    } else {
                        console.warn("Auto-fix grammar server returned no data or error:", fixError);
                    }
                } catch (geminiError: any) {
                    console.warn("Auto-fix grammar failed, using raw transcript:", geminiError);
                }
                // --- END AUTO GRAMMAR FIX STEP ---
                
                // Dừng Simulation
                if (progressInterval) clearInterval(progressInterval);

                set({ 
                    progress: 100, 
                    loadingMessage: "Hoàn tất!", 
                    transcript: finalData,
                    status: 'success'
                });
                isComplete = true;

                // Lưu vào Supabase (Bản đã sửa lỗi)
                await supabase.from('transcriptions').insert({
                    video_url: url,
                    video_title: finalData.title || url,
                    duration: finalData.duration,
                    content: finalData,
                    status: 'success'
                });
                
                // Refresh history
                get().fetchHistory();
                return;
            }

            // TRƯỜNG HỢP 3: Lỗi trả về từ logic bên trong
            if (data.error) {
                throw new Error(data.error);
            }

            throw new Error("Phản hồi không hợp lệ từ hệ thống.");
        }

        if (!isComplete) {
            throw new Error("Quá thời gian chờ xử lý video. Vui lòng thử lại sau.");
        }

    } catch (error: any) {
      if (progressInterval) clearInterval(progressInterval);
      
      console.error("Pipeline error:", error);
      let message = VI.error.defaultMessage;
      if (typeof error.message === 'string') {
          message = error.message;
      }
      set({ status: 'error', errorMessage: message, progress: 0 });

      const { url } = get();
      // Chỉ lưu log lỗi nếu không phải do thiếu API key (để tránh spam DB)
      if (!message.includes("API Key")) {
          await supabase.from('transcriptions').insert({
              video_url: url,
              video_title: 'Failed Video',
              duration: '00:00',
              status: 'error',
              error_message: message
          });
      }
      get().fetchHistory();
    }
  },

  fixGrammar: async () => {
    const { transcript } = get();
    if (!transcript) return "";

    try {
        const fullText = transcript.segments.map(s => s.text).join('\n\n');

        // Gọi Edge Function thay vì Gemini trực tiếp
        const { data, error } = await supabase.functions.invoke('transcribe-youtube', {
            body: { 
                action: 'fix_grammar', 
                text: fullText 
            }
        });

        if (error) throw new Error(error.message || "Lỗi khi gọi server.");
        if (!data || !data.correctedText) throw new Error("Server không trả về dữ liệu hợp lệ.");

        return data.correctedText;

    } catch (err: any) {
        console.error("Fix Grammar Error:", err);
        throw new Error(err.message || "Lỗi khi xử lý văn bản.");
    }
  },

  updateTranscript: (newText: string) => {
      const { transcript } = get();
      if (!transcript) return;

      const newSegments = newText.split('\n\n').map(t => ({
          timestamp: '', 
          text: t.trim()
      })).filter(s => s.text.length > 0);

      set({
          transcript: {
              ...transcript,
              segments: newSegments
          }
      });
  },

  reset: () => {
      if (progressInterval) clearInterval(progressInterval);
      set({ status: 'idle', url: '', transcript: null, errorMessage: null, progress: 0 })
  }
}));
