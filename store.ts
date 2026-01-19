import { create } from 'zustand';
import { TranscriptionState } from './types';
import { VI } from './lang/vi';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase Client
const SUPABASE_URL = 'https://gljzvvegdkwpgitbnjcb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S0ZBExbtXioOE3DgS26fgA_Nwq46a_A'; // Publishable Key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
      // Gọi Supabase Edge Function 'transcribe-youtube'
      // Toàn bộ logic tải audio và gọi Gemini được thực hiện trên server
      const { data, error } = await supabase.functions.invoke('transcribe-youtube', {
        body: { url: url }
      });

      if (error) {
          throw new Error(error.message || "Lỗi khi gọi Server Supabase.");
      }

      if (!data) {
          throw new Error("Không nhận được dữ liệu từ Server.");
      }

      // Supabase function sẽ trả về trực tiếp JSON kết quả
      set({ status: 'success', transcript: data });

    } catch (error: any) {
      console.error("Transcription error:", error);
      
      let message = VI.error.defaultMessage;
      
      if (typeof error.message === 'string') {
          if (error.message.includes('FunctionsFetchError')) {
              message = "Không kết nối được với Server Supabase. Vui lòng kiểm tra lại kết nối mạng.";
          } else {
              message = `Lỗi xử lý: ${error.message}`;
          }
      }

      set({ status: 'error', errorMessage: message });
    }
  },

  reset: () => set({ status: 'idle', url: '', transcript: null, errorMessage: null })
}));