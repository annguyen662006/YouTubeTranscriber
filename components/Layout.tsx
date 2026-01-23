
import React from 'react';
import { useTranscriptionStore } from '../store';
import { VI } from '../lang/vi';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { view, setView } = useTranscriptionStore();

  return (
    <div className="relative min-h-screen w-full animated-bg flex flex-col text-white">
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
             {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#111418] to-[#064e3b] opacity-80"></div>
            {/* Noise */}
            <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay"></div>
             {/* Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[100px] opacity-30 mix-blend-screen" style={{animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
        </div>

        {/* Header */}
        <header className="relative z-50 w-full px-6 py-5 lg:px-12 flex items-center justify-between border-b border-white/5 bg-black/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined" style={{fontSize: '24px'}}>graphic_eq</span>
                </div>
                <h2 className="text-white text-lg font-bold tracking-tight">{VI.header.title}</h2>
            </div>
            
            <nav className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                    onClick={() => setView('home')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'home' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    {VI.header.nav.home}
                </button>
                <button 
                    onClick={() => setView('history')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    {VI.header.nav.history}
                </button>
            </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 w-full">
            {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 w-full py-6 text-center text-xs text-white/30 border-t border-white/5 bg-black/10 backdrop-blur-sm">
            {VI.footer}
        </footer>
    </div>
  );
};

export default Layout;