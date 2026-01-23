
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI, Type } from "npm:@google/genai";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDAPI_HOST = "youtube-mp36.p.rapidapi.com";
const RAPIDAPI_URL = "https://youtube-mp36.p.rapidapi.com";
const GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

function extractVideoId(url: string): string | null {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function formatTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const reqData = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('API_KEY');
    
    if (!apiKey) throw new Error("Chưa cấu hình Gemini API Key.");

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // === ACTION: FIX GRAMMAR ===
    if (reqData.action === 'fix_grammar') {
        const { text } = reqData;
        if (!text) throw new Error("Thiếu nội dung văn bản.");

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [{ 
                    text: `
                    Bạn là một chuyên gia biên tập nội dung. Nhiệm vụ của bạn là chỉnh sửa văn bản dưới đây.

                    Các yêu cầu bắt buộc:
                    1. CHỈNH SỬA: Sửa lỗi chính tả, ngữ pháp, dấu câu và viết hoa danh từ riêng.
                    2. ĐỊNH DẠNG ĐOẠN VĂN (QUAN TRỌNG): Hãy tự động phân chia văn bản thành các đoạn văn (paragraphs) hợp lý dựa trên sự thay đổi của ý tưởng hoặc chủ đề. 
                    3. KÝ TỰ NGĂN CÁCH: Sử dụng đúng 2 ký tự xuống dòng (\n\n) để ngăn cách giữa các đoạn văn.
                    4. KHÔNG thay đổi ý nghĩa gốc hoặc thêm lời dẫn. Chỉ trả về nội dung đã chỉnh sửa.

                    Văn bản gốc:
                    ${text}
                    ` 
                }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        correctedText: { type: Type.STRING }
                    },
                    required: ["correctedText"]
                }
            }
        });

        const resultText = response.text;
        
        return new Response(resultText, {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // === ACTION: DEFAULT (Transcribe) ===
    const { url } = reqData;
    if (!url) throw new Error("Thiếu tham số 'url'.");

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!rapidApiKey) throw new Error("Chưa cấu hình RAPIDAPI_KEY.");
    if (!groqApiKey) throw new Error("Chưa cấu hình GROQ_API_KEY.");
    
    // BƯỚC 1: Lấy Video ID
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error("Link YouTube không hợp lệ.");

    // BƯỚC 2: Gọi RapidAPI lấy link download
    const rapidUrl = `${RAPIDAPI_URL}/dl?id=${videoId}`;
    console.log(`Checking status for Video ID: ${videoId}`);

    const rapidResponse = await fetch(rapidUrl, {
        method: "GET",
        headers: {
            "x-rapidapi-host": RAPIDAPI_HOST,
            "x-rapidapi-key": rapidApiKey
        }
    });

    if (!rapidResponse.ok) throw new Error(`Lỗi kết nối RapidAPI: ${rapidResponse.status}`);

    const data = await rapidResponse.json();
    
    // Check Processing
    if (data.status === 'processing' || data.msg === 'in process' || data.msg === 'queue') {
        console.log("Video is processing.");
        return new Response(JSON.stringify({
            processing: true,
            progress: data.progress || 0,
            message: "Đang chuyển đổi định dạng video..."
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (data.status === 'fail') throw new Error(data.msg || "Không thể lấy link tải video.");

    let audioUrl = data.link || data.url || data.mp3;
    if (!audioUrl) throw new Error("API không trả về link tải.");

    // BƯỚC 3: Download Audio Stream
    console.log("Downloading audio stream...");
    const mediaRes = await fetch(audioUrl);
    if (!mediaRes.ok) throw new Error("Không thể tải file audio.");

    const blob = await mediaRes.blob();
    console.log(`Audio size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

    // BƯỚC 4: Gửi sang Groq (Whisper)
    console.log("Sending to Groq (Whisper-large-v3)...");
    
    const formData = new FormData();
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'whisper-large-v3'); 
    formData.append('response_format', 'verbose_json'); 

    const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqApiKey}`,
        },
        body: formData
    });

    if (!groqResponse.ok) {
        const errText = await groqResponse.text();
        throw new Error(`Groq API Error: ${groqResponse.status} - ${errText}`);
    }

    const groqData = await groqResponse.json();
    
    // Chuẩn bị dữ liệu Fallback
    const fallbackResult = {
        title: data.title || "Video không tên", // Get Title from RapidAPI data
        duration: formatTimestamp(groqData.duration || 0),
        language: groqData.language || "Unknown",
        segments: groqData.segments ? groqData.segments.map((s: any) => ({
            timestamp: formatTimestamp(s.start),
            text: s.text.trim()
        })) : [{ timestamp: "00:00", text: groqData.text }]
    };

    console.log("Groq Transcription Complete.");

    // BƯỚC 5: Thử gửi sang Gemini để "làm đẹp"
    try {
        console.log("Attempting Gemini formatting...");
        
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    {
                        text: `
                        Refine the following transcript. Fix spelling errors and proper nouns only. 
                        Do not change the meaning. Keep the timestamps close to the original if possible.
                        
                        Input JSON: ${JSON.stringify(fallbackResult)}

                        Output strict JSON matching the input schema.
                        `
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        language: { type: Type.STRING },
                        segments: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    timestamp: { type: Type.STRING },
                                    text: { type: Type.STRING }
                                },
                                required: ["timestamp", "text"]
                            }
                        }
                    },
                    required: ["duration", "language", "segments"]
                }
            }
        });

        const textResult = response.text;
        if (textResult) {
            console.log("Gemini formatting success.");
            return new Response(textResult, {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    } catch (geminiError: any) {
        console.warn("Gemini Error (Fallback to Raw Groq):", geminiError.message);
    }

    // Fallback if Gemini fails
    return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
