import React from 'react';
import { VI } from '../lang/vi';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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
            <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined" style={{fontSize: '24px'}}>graphic_eq</span>
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight">{VI.header.title}</h2>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
                <a href="#" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">{VI.header.nav.home}</a>
                <a href="#" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">{VI.header.nav.features}</a>
                <a href="#" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">{VI.header.nav.pricing}</a>
                <a href="#" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">{VI.header.nav.contact}</a>
            </nav>
            
            <div className="flex items-center gap-4">
                <button className="hidden sm:flex text-sm font-medium text-white/80 hover:text-white transition-colors">
                    {VI.header.auth.login}
                </button>
                <div className="h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-white/10" title="User Avatar">
                    <img 
                        src="https://picsum.photos/100/100" 
                        alt="User Avatar" 
                        className="h-full w-full object-cover" 
                    />
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
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
