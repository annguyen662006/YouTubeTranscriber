
import React, { useEffect, useState } from 'react';
import { useTranscriptionStore } from '../store';
import { HistoryItem } from '../types';
import { VI } from '../lang/vi';

const HistoryView: React.FC = () => {
  const { history, fetchHistory, deleteHistoryItem } = useTranscriptionStore();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<HistoryItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });
  };

  const handleDownloadDoc = () => {
      if (!selectedItem || !selectedItem.content) return;

      const title = selectedItem.video_title || "Transcript";
      
      // --- XỬ LÝ TÊN FILE ---
      const removeAccents = (str: string) => {
        return str.normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/đ/g, "d")
                  .replace(/Đ/g, "D");
      };

      const safeTitle = removeAccents(title)
        .replace(/[^a-zA-Z0-9\s-]/g, '') 
        .trim()
        .replace(/\s+/g, '-'); 
        
      const filename = `${safeTitle || 'transcript'}.doc`;

      // --- XỬ LÝ NỘI DUNG ---
      const displayTitle = title.toUpperCase();

      const contentHtml = selectedItem.content.segments.map(s => 
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

  const confirmDelete = async () => {
      if (itemToDelete) {
          await deleteHistoryItem(itemToDelete.id);
          setItemToDelete(null);
      }
  };

  return (
    <div className="w-full max-w-6xl h-[85vh] flex flex-col">
        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
             <div className="p-2 rounded-lg bg-white/10">
                <span className="material-symbols-outlined text-white">history</span>
             </div>
             <h2 className="text-2xl font-bold text-white">{VI.history.title}</h2>
        </div>

        {/* Table Container */}
        <div className="glass-panel w-full flex-1 rounded-2xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto glass-scroll">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-xs text-white/50 uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                        <tr>
                            <th className="px-6 py-4 font-medium w-16 text-center">{VI.history.table.index}</th>
                            <th className="px-6 py-4 font-medium">{VI.history.table.video}</th>
                            <th className="px-6 py-4 font-medium w-32">{VI.history.table.duration}</th>
                            <th className="px-6 py-4 font-medium w-32">{VI.history.table.status}</th>
                            <th className="px-6 py-4 font-medium w-40">{VI.history.table.date}</th>
                            <th className="px-6 py-4 font-medium w-20 text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                                    {VI.history.empty}
                                </td>
                            </tr>
                        ) : (
                            history.map((item, index) => (
                                <tr 
                                    key={item.id} 
                                    onClick={() => item.status === 'success' && setSelectedItem(item)}
                                    className={`group transition-colors ${item.status === 'success' ? 'hover:bg-white/5 cursor-pointer' : 'opacity-60 bg-red-500/5'}`}
                                >
                                    <td className="px-6 py-4 text-center text-white/40">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-white group-hover:text-primary transition-colors line-clamp-1">{item.video_title || 'Video không tên'}</span>
                                            <span className="text-xs text-white/40 font-mono line-clamp-1">{item.video_url}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/70">{item.duration}</td>
                                    <td className="px-6 py-4">
                                        {item.status === 'success' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                                {VI.history.status.success}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                {VI.history.status.error}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-white/40 font-mono text-xs">
                                        {formatDate(item.created_at)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setItemToDelete(item);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all"
                                            title={VI.history.delete.tooltip}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Delete Confirmation Modal */}
        {itemToDelete && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="glass-card w-full max-w-sm flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-red-500/20 animate-pulse-slow" style={{animationDuration: '0.2s', animationName: 'none'}}>
                     <div className="p-6 flex flex-col items-center text-center gap-4">
                         <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                             <span className="material-symbols-outlined text-red-500 text-[28px]">warning</span>
                         </div>
                         <div>
                             <h3 className="text-lg font-bold text-white mb-2">{VI.history.delete.title}</h3>
                             <p className="text-sm text-white/60 leading-relaxed">{VI.history.delete.message}</p>
                         </div>
                     </div>
                     <div className="p-4 border-t border-white/5 bg-white/5 flex gap-3">
                         <button 
                            onClick={() => setItemToDelete(null)}
                            className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm font-medium"
                         >
                             {VI.history.delete.cancel}
                         </button>
                         <button 
                            onClick={confirmDelete}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all text-sm font-bold"
                         >
                             {VI.history.delete.confirm}
                         </button>
                     </div>
                </div>
            </div>
        )}

        {/* Detail Modal */}
        {selectedItem && selectedItem.content && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="glass-card w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-pulse-slow" style={{animationDuration: '0.2s', animationName: 'none'}}>
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-bold text-white max-w-2xl line-clamp-1">{selectedItem.video_title}</h3>
                             <p className="text-xs text-white/50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {formatDate(selectedItem.created_at)}
                            </p>
                        </div>
                        <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto glass-scroll p-8">
                        <div className="max-w-3xl mx-auto flex flex-col gap-6">
                            {selectedItem.content.segments.map((seg, i) => (
                                <div key={i} className="text-white/90 text-lg font-light leading-relaxed">
                                    {seg.text}
                                </div>
                            ))}
                        </div>
                    </div>

                     {/* Footer */}
                     <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
                        <button 
                             onClick={handleDownloadDoc}
                             className="mr-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors border border-white/10"
                        >
                             <span className="material-symbols-outlined text-[18px]">download</span>
                             {VI.result.footer.downloadDoc}
                        </button>
                        <button 
                             onClick={() => {
                                 const text = selectedItem.content?.segments.map(s => s.text).join('\n\n') || "";
                                 navigator.clipboard.writeText(text);
                             }}
                             className="px-4 py-2 bg-primary hover:bg-blue-600 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors"
                        >
                             <span className="material-symbols-outlined text-[18px]">content_copy</span>
                             {VI.result.copy}
                        </button>
                     </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default HistoryView;