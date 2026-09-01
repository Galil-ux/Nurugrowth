
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeSiteSettings } from '../services/firebase';
import { SiteSettings } from '../types';

const Hero: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const unsub = subscribeSiteSettings((data) => {
      setSettings(data);
    });
    return () => unsub();
  }, []);

  const stats = [
    { label: 'Strategic Clarity', val: '98%', color: 'text-blue-600' },
    { label: 'Market Readiness', val: 'Tier-1', color: 'text-rose-600' },
    { label: 'Scale Potential', val: '12X', color: 'text-amber-500' },
    { label: 'Active Region', val: 'Kenya', color: 'text-emerald-600' },
  ];

  const renderTitle = (titleText: string) => {
    const match = titleText.match(/^(.*?)\{(.*?)\}(.*)$/);
    if (match) {
      return (
        <>
          {match[1]}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-500">
            {match[2]}
          </span>
          {match[3]}
        </>
      );
    }
    return titleText;
  };

  const heroEyebrow = settings?.heroEyebrow || 'Growth Intelligence Lab';
  const heroTitle = settings?.heroTitle || 'Marketing That Powers Kenya’s {Clean Energy Future}';
  const heroSubtext = settings?.heroSubtext || 'We engineer data-backed acquisition systems for solar innovators and clean energy brands across East Africa.';
  const primaryText = settings?.heroPrimaryBtnText || 'Book Clarity Call';
  const primaryUrl = settings?.heroPrimaryBtnUrl || 'https://calendly.com/mosemirano6538/30min';
  const secondaryText = settings?.heroSecondaryBtnText || 'Analyze ROI Now';
  const secondaryUrl = settings?.heroSecondaryBtnUrl || '#lab';

  return (
    <section className="relative px-6 pt-24 pb-16 md:pt-44 md:pb-40 overflow-hidden bg-white">
      {/* Dynamic Animated Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-100/30 blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-rose-100/20 blur-[80px] md:blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-blue-600 text-[9px] md:text-[10px] font-black mb-6 md:mb-12 uppercase tracking-[0.2em] shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2.5 animate-pulse"></span>
          {heroEyebrow}
        </motion.div>
        
        <div className="mb-8 md:mb-12 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.15] md:leading-[1.1] text-slate-900 mb-6 md:mb-10"
          >
            {renderTitle(heroTitle)}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-sm md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium px-2 md:px-4"
          >
            {heroSubtext}
          </motion.p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-16 md:mb-32">
          <motion.a
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 text-center"
          >
            {primaryText}
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={secondaryUrl}
            className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all text-center shadow-sm hover:bg-slate-50"
          >
            {secondaryText}
          </motion.a>
        </div>

        {/* Sophisticated Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-5xl mx-auto px-0 md:px-4"
        >
          <div className="bg-white/50 backdrop-blur border border-slate-100/80 rounded-[2rem] md:rounded-[3rem] p-1 md:p-1.5 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="bg-white rounded-[1.8rem] md:rounded-[2.8rem] py-8 md:py-16 px-4 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {stats.map((stat, i) => (
                <div key={i} className={`text-center group transition-all duration-500 py-4 md:py-0 ${i > 1 ? 'md:pt-0' : ''}`}>
                  <div className={`text-2xl md:text-5xl font-black ${stat.color} mb-1 md:mb-2 tracking-tighter group-hover:scale-110 transition-all`}>
                    {stat.val}
                  </div>
                  <div className="text-slate-400 text-[8px] md:text-[9px] uppercase font-black tracking-[0.2em] md:tracking-[0.25em]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
