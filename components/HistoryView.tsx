
import React, { useEffect, useState } from 'react';
import { useTranscriptionStore } from '../store';
import { HistoryItem } from '../types';
import { VI } from '../lang/vi';

const HistoryView: React.FC = () => {
  const { history, fetchHistory } = useTranscriptionStore();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

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
                            <th className="px-6 py-4 font-medium w-48">{VI.history.table.date}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-white/30">
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
                                            <span className="font-medium text-white group-hover:text-primary transition-colors line-clamp-1">{item.video_title || 'Unknown Video'}</span>
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
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

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