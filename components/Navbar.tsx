
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAVIGATION_LINKS } from '../constants';
import { useAuth } from '../services/AuthContext';

const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform duration-500 group-hover:rotate-12">
    <path d="M50 20L85 52L72 52L50 32L28 52L15 52L50 20Z" fill="currentColor" />
    <path d="M48 45L70 67L83 67L50 35L17 67L30 67L48 45Z" fill="currentColor" opacity="0.8" />
    <path d="M45 58L55 58L55 80L45 80L45 58Z" fill="currentColor" opacity="0.6" />
  </svg>
);

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isEditor } = useAuth();

  const visibleLinks = NAVIGATION_LINKS.filter(link => link.view !== 'cms');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Standard hash navigation will be handled by the hashchange listener in App.tsx
    setIsMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.hash = '#home';
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 px-6 ${
        isScrolled ? 'pt-4' : 'pt-8'
      }`}>
        <div className={`max-w-7xl mx-auto transition-all duration-700 rounded-[2rem] px-8 flex items-center justify-between ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-2xl border border-slate-200/50 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.04)]' 
            : 'bg-transparent py-4'
        }`}>
          <a href="#home" onClick={handleLogoClick} className="flex items-center group shrink-0">
            <div className="text-slate-900">
              <LogoIcon />
            </div>
            <div className="flex items-center ml-2.5">
              <span className="text-lg font-black tracking-tighter text-slate-900 uppercase">Nuru</span>
              <span className="text-lg font-black tracking-tighter text-blue-600 uppercase ml-0.5">Growth</span>
            </div>
          </a>
          
          <div className="hidden lg:flex items-center gap-10">
            {visibleLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-blue-600 transition-all relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#lab"
              onClick={(e) => handleNavClick(e, '#lab')}
              className="hidden sm:flex bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              Analyze ROI
            </a>

            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 bg-slate-100/80 backdrop-blur hover:bg-slate-200 rounded-2xl transition-all active:scale-90"
              aria-label="Open Menu"
            >
              <span className="w-5 h-0.5 bg-slate-900 rounded-full"></span>
              <span className="w-4 h-0.5 bg-slate-900 rounded-full ml-1"></span>
              <span className="w-5 h-0.5 bg-slate-900 rounded-full"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-in Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setIsMenuOpen(false)} 
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[320px] sm:max-w-md h-full bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-8 border-b border-slate-100">
                <div className="flex items-center">
                  <div className="text-slate-900"><LogoIcon /></div>
                  <div className="flex items-center ml-2.5">
                    <span className="text-lg font-black tracking-tighter text-slate-900 uppercase">Nuru</span>
                    <span className="text-lg font-black tracking-tighter text-blue-600 uppercase ml-0.5">Growth</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-grow py-10 px-8 flex flex-col gap-2 overflow-y-auto">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 pl-1">Menu</div>
                {visibleLinks.map((link, i) => (
                  <motion.a 
                    key={link.name} 
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (i * 0.05) }}
                    onClick={(e) => handleNavClick(e, link.href)} 
                    className="text-2xl font-black text-slate-900 tracking-tighter hover:text-blue-600 transition-all flex items-center group py-4 px-2 hover:translate-x-2"
                  >
                    <span className="text-blue-600/10 mr-4 font-mono group-hover:text-blue-600 transition-colors text-lg">0{i+1}</span>
                    {link.name}
                  </motion.a>
                ))}
              </div>

              {/* Drawer Footer / CTA */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Ready to scale your solar venture?</p>
                <a 
                  href="#lab" 
                  onClick={(e) => handleNavClick(e, '#lab')} 
                  className="block w-full bg-slate-900 hover:bg-blue-600 text-white text-center py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                >
                  Analyze ROI Now
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
