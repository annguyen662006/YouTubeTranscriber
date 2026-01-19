import React, { useState } from 'react';
import { useTranscriptionStore } from '../store';
import { VI } from '../lang/vi';

const ResultView: React.FC = () => {
  const { transcript, reset } = useTranscriptionStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!transcript) return;
    const text = transcript.segments.map(s => `${s.timestamp} ${s.text}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!transcript) return null;

  return (
    <div className="glass-panel w-full max-w-6xl h-full flex flex-col rounded-3xl shadow-2xl overflow-hidden relative max-h-[85vh]">
        {/* Card Header (Sticky) */}
        <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-white/5 bg-background-dark/30 backdrop-blur-xl z-20">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{VI.result.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-white/50 text-sm">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>{VI.result.duration}: {transcript.duration}</span>
                    <span className="mx-1">•</span>
                    <span className="material-symbols-outlined text-[16px]">translate</span>
                    <span>{VI.result.language}: {transcript.language}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={reset}
                    className="glass-button-secondary h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-white hover:text-white group"
                >
                    <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform">refresh</span>
                    <span>{VI.result.new}</span>
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

        {/* Scrollable Transcript Content */}
        <div className="flex-1 overflow-y-auto glass-scroll p-0 relative">
            <div className="flex flex-col">
                {transcript.segments.map((segment, index) => (
                    <div 
                        key={index} 
                        className={`group flex flex-col sm:flex-row border-b border-white/5 transition-colors ${index === 2 ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-white/[0.02]'}`}
                    >
                        {/* Timestamp */}
                        <div className="sm:w-32 md:w-40 shrink-0 p-4 sm:p-6 sm:pr-0">
                            <button className={`font-mono text-primary text-sm ${index === 2 ? 'font-bold' : 'font-medium opacity-80 group-hover:opacity-100'} hover:underline hover:text-blue-400 transition-colors flex items-center gap-1`}>
                                {segment.timestamp}
                                <span className={`material-symbols-outlined text-[14px] ${index === 2 ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>play_arrow</span>
                            </button>
                        </div>
                        {/* Text */}
                        <div className="flex-1 p-4 sm:p-6 sm:pl-4">
                            <p className={`${index === 2 ? 'text-white text-lg font-medium' : 'text-white/90 text-base font-light'} leading-relaxed`}>
                                {segment.text}
                            </p>
                        </div>
                    </div>
                ))}
                {/* Bottom Spacer */}
                <div className="h-10"></div>
            </div>
        </div>

        {/* Footer / Status Bar */}
        <div className="shrink-0 p-4 border-t border-white/5 bg-background-dark/50 backdrop-blur-md flex justify-between items-center text-xs text-white/40">
            <div>{VI.result.footer.model}</div>
            <div className="flex gap-4">
                {VI.result.footer.export.map((item, i) => (
                    <span key={i} className="hover:text-white cursor-pointer">{item}</span>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ResultView;
