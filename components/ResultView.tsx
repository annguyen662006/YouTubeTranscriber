

import React, { useState } from 'react';
import { useTranscriptionStore } from '../store';
import { VI } from '../lang/vi';

const ResultView: React.FC = () => {
  const { transcript, reset, fixGrammar, updateTranscript } = useTranscriptionStore();
  const [copied, setCopied] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [correctedText, setCorrectedText] = useState<string | null>(null);

  const handleCopy = () => {
    if (!transcript) return;
    const text = transcript.segments.map(s => s.text).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadDoc = () => {
      if (!transcript) return;

      const title = transcript.title || "Transcript";
      
      // --- XỬ LÝ TÊN FILE ---
      // Hàm chuyển tiếng Việt có dấu sang không dấu
      const removeAccents = (str: string) => {
        return str.normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/đ/g, "d")
                  .replace(/Đ/g, "D");
      };

      // Tạo tên file an toàn: Không dấu, chỉ giữ chữ số, thay khoảng trắng bằng gạch ngang
      const safeTitle = removeAccents(title)
        .replace(/[^a-zA-Z0-9\s-]/g, '') 
        .trim()
        .replace(/\s+/g, '-'); 
        
      const filename = `${safeTitle || 'transcript'}.doc`;

      // --- XỬ LÝ NỘI DUNG ---
      const displayTitle = title.toUpperCase(); // Tiêu đề in hoa

      // Nội dung HTML cho file Word
      const contentHtml = transcript.segments.map(s => 
          `<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12pt; line-height: 1.5;">${s.text}</p>`
      ).join('');
      
      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>${title}</title>
            <style>
                /* Cấu hình trang mặc định */
                @page { 
                    size: 21cm 29.7cm; 
                    margin: 2.54cm 2.54cm 2.54cm 2.54cm; 
                    mso-page-orientation: portrait; 
                }
                body { 
                    font-family: 'Times New Roman', serif; 
                    font-size: 12pt; 
                }
            </style>
        </head>
        <body>
      `;
      const footer = "</body></html>";
      
      // Ghép nội dung: Tiêu đề In hoa + Đậm + Căn giữa + 14pt (hoặc 16pt tùy chỉnh)
      const sourceHTML = header + 
          `<h1 style="font-family: 'Times New Roman', serif; font-size: 14pt; font-weight: bold; margin-bottom: 24pt; text-align: center; text-transform: uppercase;">${displayTitle}</h1>` + 
          contentHtml + 
          footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], {
          type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleFixGrammar = async () => {
      setIsModalOpen(true);
      setIsFixing(true);
      setCorrectedText(null);
      try {
          const result = await fixGrammar();
          setCorrectedText(result);
      } catch (e) {
          console.error(e);
          setCorrectedText("Có lỗi xảy ra khi kết nối với Gemini AI.");
      } finally {
          setIsFixing(false);
      }
  };

  const applyCorrection = () => {
      if (correctedText) {
          updateTranscript(correctedText);
      }
      setIsModalOpen(false);
  };

  if (!transcript) return null;

  return (
    <div className="glass-panel w-full max-w-6xl h-full flex flex-col rounded-3xl shadow-2xl overflow-hidden relative max-h-[85vh]">
        {/* Card Header (Sticky) */}
        <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-white/5 bg-background-dark/30 backdrop-blur-xl z-20">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{VI.result.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-white/50 text-sm">
                    <span className="material-symbols-outlined text-[16px]">translate</span>
                    <span>{VI.result.language}: {transcript.language}</span>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <button 
                    onClick={reset}
                    className="glass-button-secondary h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-white hover:text-white group"
                >
                    <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform">refresh</span>
                    <span>{VI.result.new}</span>
                </button>
                <button 
                    onClick={handleFixGrammar}
                    className="glass-button-secondary h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-purple-300 hover:text-purple-200 border-purple-500/20 hover:bg-purple-500/10"
                >
                    <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
                    <span>{VI.result.fixGrammar}</span>
                </button>
                <button 
                    onClick={handleCopy}
                    className="h-10 px-5 rounded-xl bg-primary hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
                >
                    <span className="material-symbols-outlined text-[20px]">{copied ? 'check' : 'content_copy'}</span>
                    <span>{copied ? VI.result.copied : VI.result.copy}</span>
                </button>
            </div>
        </div>

        {/* Scrollable Transcript Content - No Timeline */}
        <div className="flex-1 overflow-y-auto glass-scroll p-6 md:p-10 relative">
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                {transcript.segments.map((segment, index) => (
                    <div 
                        key={index} 
                        className="text-white/90 text-lg font-light leading-relaxed hover:text-white transition-colors"
                    >
                        {segment.text}
                    </div>
                ))}
                {/* Bottom Spacer */}
                <div className="h-10"></div>
            </div>
        </div>

        {/* Footer / Status Bar */}
        <div className="shrink-0 p-4 border-t border-white/5 bg-background-dark/50 backdrop-blur-md flex justify-between items-center text-xs text-white/40">
            <div>{VI.result.footer.model}</div>
            <div>
                <button 
                    onClick={handleDownloadDoc}
                    className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
                >
                     <span className="material-symbols-outlined text-[16px]">download</span>
                     <span>{VI.result.footer.downloadDoc}</span>
                </button>
            </div>
        </div>

        {/* Fix Grammar Modal */}
        {isModalOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="glass-card w-full max-w-4xl h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-pulse-slow" style={{animationDuration: '0.2s', animationName: 'none'}}>
                    {/* Modal Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <span className="material-symbols-outlined text-purple-300">auto_fix_high</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{VI.result.modal.title}</h3>
                                <p className="text-sm text-white/50">{VI.result.modal.description}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 p-6 overflow-hidden relative">
                         {isFixing ? (
                             <div className="h-full flex flex-col items-center justify-center gap-4">
                                 <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                 <p className="text-purple-200 animate-pulse">{VI.result.modal.fixing}</p>
                             </div>
                         ) : (
                             <div className="h-full overflow-y-auto glass-scroll bg-black/20 rounded-xl p-6 border border-white/5">
                                 {correctedText ? (
                                    <div className="whitespace-pre-wrap text-white/90 text-lg leading-relaxed font-light">
                                        {correctedText}
                                    </div>
                                 ) : (
                                     <div className="text-center text-red-400">Error loading data.</div>
                                 )}
                             </div>
                         )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                        >
                            {VI.result.modal.cancel}
                        </button>
                        <button 
                            disabled={isFixing || !correctedText}
                            onClick={applyCorrection}
                            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {VI.result.modal.confirm}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ResultView;