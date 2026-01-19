import React from 'react';
import { useTranscriptionStore } from '../store';
import { VI } from '../lang/vi';

const LoadingView: React.FC = () => {
  const { reset } = useTranscriptionStore();

  return (
    <div className="glass-card relative flex w-full max-w-[520px] flex-col items-center justify-center rounded-2xl p-10 md:p-14">
        {/* Animated Decorative Glow behind the spinner */}
        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[60px]"></div>

        {/* Loading Spinner Area */}
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute h-full w-full animate-spin-slow rounded-full border-2 border-transparent border-t-primary/50 border-r-primary/30"></div>
            {/* Inner Ring Reverse */}
            <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-transparent border-b-primary border-l-primary/60" style={{animationDirection: 'reverse', animationDuration: '4s'}}></div>
            {/* Core Orb */}
            <div className="orb-core relative flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/50">
                <span className="material-symbols-outlined text-white text-[18px] animate-spin-slow">autorenew</span>
            </div>
            {/* Ping Effect */}
            <div className="absolute h-full w-full animate-ping-slow rounded-full border border-primary/20 opacity-75"></div>
        </div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{VI.loading.title}</h2>
            <p className="max-w-[300px] text-base font-normal text-white/70">
                {VI.loading.subtitle}
            </p>
        </div>

        {/* Progress Skeleton/Indicator */}
        <div className="mt-8 w-full max-w-[280px]">
            {/* Step indicator textual */}
            <div className="mb-2 flex justify-between text-xs font-medium text-primary/80">
                <span>{VI.loading.steps.audio}</span>
                <span>75%</span>
            </div>
            {/* Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[75%] animate-pulse rounded-full bg-gradient-to-r from-primary to-blue-400 shadow-[0_0_10px_rgba(59,131,247,0.5)]"></div>
            </div>
            
            {/* Technical details (faked for aesthetic) */}
            <div className="mt-4 flex flex-col gap-1.5 opacity-60">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-green-400"></div>
                    <span className="text-[10px] text-white/60 font-mono">{VI.loading.steps.api}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-green-400"></div>
                    <span className="text-[10px] text-white/60 font-mono">{VI.loading.steps.extract}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] text-primary/80 font-mono">{VI.loading.steps.timestamp}</span>
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
