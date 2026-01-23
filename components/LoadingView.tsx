
import React from 'react';
import { useTranscriptionStore } from '../store';
import { VI } from '../lang/vi';

const LoadingView: React.FC = () => {
  const { reset, progress, loadingMessage } = useTranscriptionStore();

  // Xác định bước hiện tại dựa trên progress giả định để highlight UI
  // 0-20: Khởi tạo
  // 20-75: Groq (API)
  // 75-85: Timestamp Processing
  // 85-100: Gemini Fix Grammar (New Step)
  
  const isAudioStep = progress > 5;
  const isApiStep = progress > 20; 
  const isExtractStep = progress > 75; 
  const isFixingStep = progress > 88; // Step mới: Sửa lỗi chính tả

  return (
    <div className="glass-card relative flex w-full max-w-[520px] flex-col items-center justify-center rounded-2xl p-10 md:p-14 transition-all duration-500">
        {/* Animated Decorative Glow behind the spinner */}
        <div className={`absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px] animate-pulse transition-colors duration-1000 ${isFixingStep ? 'bg-purple-600/30' : 'bg-primary/20'}`}></div>

        {/* Loading Spinner Area */}
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
            {/* Outer Ring */}
            <div className={`absolute h-full w-full animate-spin-slow rounded-full border-2 border-transparent transition-colors ${isFixingStep ? 'border-t-purple-500/50 border-r-purple-500/30' : 'border-t-primary/50 border-r-primary/30'}`}></div>
            {/* Inner Ring Reverse */}
            <div className={`absolute h-16 w-16 animate-spin rounded-full border-2 border-transparent transition-colors ${isFixingStep ? 'border-b-purple-500 border-l-purple-500/60' : 'border-b-primary border-l-primary/60'}`} style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
            {/* Core Orb */}
            <div className={`orb-core relative flex h-8 w-8 animate-pulse items-center justify-center rounded-full shadow-lg transition-colors ${isFixingStep ? 'bg-purple-500 shadow-purple-500/50' : 'bg-primary shadow-primary/50'}`}>
                <span className="material-symbols-outlined text-white text-[18px] animate-spin-slow">{isFixingStep ? 'auto_fix_high' : 'autorenew'}</span>
            </div>
            {/* Ping Effect */}
            <div className={`absolute h-full w-full animate-ping-slow rounded-full border opacity-75 transition-colors ${isFixingStep ? 'border-purple-500/20' : 'border-primary/20'}`}></div>
        </div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{VI.loading.title}</h2>
            <p className="max-w-[300px] text-base font-normal text-white/70 min-h-[48px] flex items-center justify-center animate-pulse">
                {loadingMessage}
            </p>
        </div>

        {/* Progress Skeleton/Indicator */}
        <div className="mt-8 w-full max-w-[280px]">
            {/* Step indicator textual */}
            <div className="mb-2 flex justify-between text-xs font-medium text-primary/80">
                <span className="animate-pulse">
                    {isFixingStep ? "Gemini 3 Flash..." : (isExtractStep ? "Groq Whisper..." : "YouTube Engine...")}
                </span>
                <span>{Math.round(progress)}%</span>
            </div>
            {/* Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div 
                    className={`h-full rounded-full bg-gradient-to-r shadow-[0_0_10px_rgba(59,131,247,0.5)] transition-all duration-500 ease-out ${isFixingStep ? 'from-purple-500 to-pink-400' : 'from-primary to-blue-400'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            
            {/* Technical details steps */}
            <div className="mt-4 flex flex-col gap-1.5 opacity-80">
                <div className={`flex items-center gap-2 transition-opacity duration-300 ${isAudioStep ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${isAudioStep ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]' : 'bg-white/30'}`}></div>
                    <span className="text-[10px] text-white/80 font-mono">{VI.loading.steps.audio}</span>
                </div>
                <div className={`flex items-center gap-2 transition-opacity duration-300 ${isApiStep ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${isApiStep ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]' : 'bg-white/30'}`}></div>
                    <span className="text-[10px] text-white/80 font-mono">{VI.loading.steps.extract}</span>
                </div>
                {/* Visual Step for Gemini Fixing */}
                <div className={`flex items-center gap-2 transition-opacity duration-300 ${isFixingStep ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${isFixingStep ? 'bg-purple-500 animate-pulse' : 'bg-white/30'}`}></div>
                    <span className={`text-[10px] font-mono ${isFixingStep ? 'text-purple-300 font-bold' : 'text-white/80'}`}>
                        {VI.loading.steps.fixing}
                    </span>
                </div>
            </div>
        </div>

        {/* Cancel Action */}
        <div className="mt-8">
            <button 
                onClick={reset}
                className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/50 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white"
            >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>{VI.loading.cancel}</span>
            </button>
        </div>
    </div>
  );
};

export default LoadingView;