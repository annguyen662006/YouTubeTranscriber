import React, { useRef } from 'react';
import { useTranscriptionStore } from '../store';
import { VI } from '../lang/vi';

const HomeView: React.FC = () => {
  const { url, setUrl, fetchTranscription } = useTranscriptionStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleStart = () => {
      if (url.trim()) {
          fetchTranscription();
      }
  };

  return (
    <>
      {/* Floating Decorative Elements (Specific to Home View) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" style={{animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>

      {/* Glass Card Container */}
      <div className="glass-card w-full max-w-3xl rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col items-center text-center relative overflow-hidden">
        {/* Inner Glow for effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="mb-6 inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
          <span className="material-symbols-outlined text-primary" style={{fontSize: '32px'}}>smart_toy</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight drop-shadow-sm">
            {VI.home.heroTitle} <br className="hidden md:block"/> {VI.home.heroTitleBreak}
        </h1>
        
        <p className="text-lg text-gray-300 mb-10 max-w-xl leading-relaxed font-light">
           {VI.home.description}
        </p>

        {/* Input Form */}
        <div className="w-full max-w-xl flex flex-col gap-4">
            <div className="glass-input rounded-xl p-1.5 flex items-center group">
                <div className="pl-4 text-gray-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined">link</span>
                </div>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-transparent border-none text-white placeholder-gray-400/70 focus:ring-0 focus:outline-none h-12 px-4 text-base font-normal"
                    placeholder={VI.home.placeholder}
                />
                <button 
                    onClick={handlePaste}
                    className="hidden sm:flex items-center justify-center h-10 w-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" 
                    title="Dán từ clipboard"
                >
                    <span className="material-symbols-outlined" style={{fontSize: '20px'}}>content_paste</span>
                </button>
            </div>
            
            <button 
                onClick={handleStart}
                className="w-full h-14 bg-primary hover:bg-blue-600 active:scale-[0.98] text-white text-base font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group mt-2"
            >
                <span>{VI.home.startBtn}</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{fontSize: '20px'}}>arrow_forward</span>
            </button>
        </div>

        {/* Footer Info */}
        <div className="mt-10 pt-8 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400" style={{fontSize: '18px'}}>check_circle</span>
                <span>{VI.home.features.noCard}</span>
            </div>
            <div className="hidden md:block w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400" style={{fontSize: '18px'}}>bolt</span>
                <span>{VI.home.features.fast}</span>
            </div>
            <div className="hidden md:block w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400" style={{fontSize: '18px'}}>translate</span>
                <span>{VI.home.features.multiLang}</span>
            </div>
        </div>
      </div>
    </>
  );
};

export default HomeView;
