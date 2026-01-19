import React from 'react';
import { useTranscriptionStore } from '../store';
import { VI } from '../lang/vi';

const ErrorView: React.FC = () => {
  const { errorMessage, reset } = useTranscriptionStore();

  return (
    <div className="w-full max-w-3xl glass-panel rounded-2xl flex flex-col overflow-hidden relative">
        {/* Progress / Status Bar (Inactive/Faded) */}
        <div className="h-1 w-full bg-white/5">
            <div className="h-full w-full bg-red-500/50"></div>
        </div>
        
        <div className="p-8 sm:p-12 flex flex-col gap-8">
            {/* Breadcrumbs */}
            <div className="flex items-center justify-center gap-2 text-sm text-white/40 mb-2">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">link</span> {VI.error.breadcrumbs.url}</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="flex items-center gap-1 text-red-400/80 font-medium"><span class="material-symbols-outlined text-[16px]">error</span> {VI.error.breadcrumbs.analyze}</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span>{VI.error.breadcrumbs.result}</span>
            </div>

            {/* Error Content */}
            <div className="w-full max-w-lg mx-auto transform transition-all">
                <div className="relative overflow-hidden rounded-lg border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]">
                    {/* Decorative background glow inside error card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent pointer-events-none"></div>
                    
                    {/* Icon */}
                    <div className="mb-5 relative">
                        <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full"></div>
                        <span className="material-symbols-outlined text-red-500 text-[64px] relative z-10 drop-shadow-md">
                            cancel
                        </span>
                    </div>

                    <h2 className="text-white text-2xl font-bold tracking-tight mb-3">
                        {VI.error.title}
                    </h2>
                    <p className="text-gray-300/90 text-sm sm:text-base leading-relaxed max-w-sm mx-auto mb-8 font-medium">
                        {errorMessage || VI.error.defaultMessage}
                    </p>

                    <div className="w-full h-px bg-red-500/20 mb-6"></div>

                    <button 
                        onClick={reset}
                        className="group relative w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-180">refresh</span>
                        <span>{VI.error.tryAgain}</span>
                    </button>
                </div>
            </div>
            
            <div className="text-center">
                <p className="text-xs text-white/30">
                    Mã lỗi: <span className="font-mono text-white/50">YT_INVALID_LENGTH_400</span> • <a href="#" className="hover:text-white/70 underline underline-offset-2 transition-colors">{VI.error.report}</a>
                </p>
            </div>
        </div>
    </div>
  );
};

export default ErrorView;
