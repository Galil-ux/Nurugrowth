
import React from 'react';
import { SERVICES } from '../constants';
import { motion } from 'framer-motion';

const Services: React.FC = () => {
  const categoryColors = [
    { accent: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50/50' },
    { accent: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50/50' },
    { accent: 'bg-rose-500', text: 'text-rose-500', bg: 'bg-rose-50/50' }
  ];

  return (
    <section id="services" className="py-32 px-6 bg-white border-t border-slate-100 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {SERVICES.map((service, i) => {
            const colors = categoryColors[i % categoryColors.length];
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-10 rounded-[2.5rem] ${colors.bg} border border-transparent hover:border-slate-100 transition-all duration-500 group`}
              >
                <div className="space-y-6 mb-10">
                  <span className={`inline-block w-12 h-1.5 ${colors.accent} rounded-full transition-all group-hover:w-20`}></span>
                  <h3 className={`text-[11px] font-black ${colors.text} uppercase tracking-[0.4em]`}>
                    {service.category}
                  </h3>
                </div>
                <ul className="space-y-5">
                  {service.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-4 text-slate-600 font-bold text-lg tracking-tight hover:text-slate-900 transition-all cursor-default group/item">
                      <span className={`w-2 h-2 rounded-full bg-slate-200 group-hover/item:${colors.accent} transition-colors`}></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
