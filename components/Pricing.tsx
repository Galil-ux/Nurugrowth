
import React, { useState, useEffect } from 'react';
import { PRICING_BUNDLES } from '../constants';
import { motion } from 'framer-motion';
import { subscribeSiteSettings } from '../services/firebase';
import { PricingBundle } from '../types';

const Pricing: React.FC = () => {
  const [bundles, setBundles] = useState<PricingBundle[]>(PRICING_BUNDLES);

  useEffect(() => {
    const unsub = subscribeSiteSettings((settings) => {
      if (settings?.pricingBundles && settings.pricingBundles.length > 0) {
        setBundles(settings.pricingBundles);
      } else {
        setBundles(PRICING_BUNDLES);
      }
    });
    return () => unsub();
  }, []);

  const pricingColors = [
    { border: 'border-slate-100', shadow: 'shadow-slate-100', accent: 'text-slate-600', btn: 'bg-slate-900' },
    { border: 'border-blue-600', shadow: 'shadow-blue-600/20', accent: 'text-blue-600', btn: 'bg-blue-600' },
    { border: 'border-emerald-500', shadow: 'shadow-emerald-500/10', accent: 'text-emerald-600', btn: 'bg-emerald-600' }
  ];

  return (
    <section id="solutions" className="py-32 px-6 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-mesh opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6">Investment Structure</div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">Choose Your Trajectory.</h2>
          <p className="text-slate-500 text-lg font-medium">Strategic marketing partnerships designed for impact at every scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bundles.map((bundle, i) => {
            const colors = pricingColors[i % pricingColors.length];
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col p-10 rounded-[3rem] transition-all duration-500 bg-white border ${colors.border} ${colors.shadow} shadow-2xl hover:scale-[1.02]`}
              >
                {bundle.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest z-10 shadow-lg">
                    Growth Choice
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className={`text-2xl font-black mb-4 ${bundle.featured ? 'text-blue-600' : 'text-slate-900'} tracking-tight`}>{bundle.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium min-h-[48px]">{bundle.description}</p>
                </div>

                <div className="mb-10 p-6 rounded-2xl bg-slate-50/80 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-20 blur-2xl rounded-full" />
                  <div className="text-3xl font-black text-slate-900 tracking-tight relative z-10">
                    <span className="text-lg font-bold text-slate-400 mr-1 italic">From</span>
                    {bundle.price}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 relative z-10">
                    {bundle.vat} • {bundle.timeline}
                  </div>
                </div>

                <ul className="flex-grow space-y-4 mb-10">
                  {bundle.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-slate-600 font-medium group/feat">
                      <div className={`mt-1 shrink-0 w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center group-hover/feat:${colors.accent}`}>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <a 
                  href="https://calendly.com/mosemirano6538/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center block text-white ${colors.btn} hover:opacity-90 shadow-xl active:scale-95`}
                >
                  Book Partnership Call
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
