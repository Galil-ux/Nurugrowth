
import React from 'react';
import { motion } from 'framer-motion';

const Methodology: React.FC = () => {
  const steps = [
    { title: 'High-Fidelity Profiling', desc: 'Analyzing hyper-local solar adoption trends to establish accurate lead cost benchmarks.', color: 'text-blue-600', dot: 'bg-blue-600' },
    { title: 'Unit Economic Tuning', desc: 'Optimizing your Cost per Watt through targeted messaging alignment and creative testing.', color: 'text-emerald-500', dot: 'bg-emerald-500' },
    { title: 'Pipeline Energizing', desc: 'Deploying solar-specific CRM stacks and automated lead nurturing to prevent leakages.', color: 'text-amber-500', dot: 'bg-amber-500' }
  ];

  return (
    <section id="methodology" className="py-32 px-6 bg-slate-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-14">
            <div>
              <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6">Our Core Engine</div>
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter text-slate-900">
                A Scientific Approach to <span className="text-blue-600">Solar Sales.</span>
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed max-w-lg font-medium">
                We treat your marketing spend like a power plant. Every dollar is measured by its output efficiency.
              </p>
            </div>
            
            <div className="flex flex-col gap-10">
              {steps.map((step, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-6 items-start group"
                >
                  <div className={`w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center ${step.color} font-black text-sm shadow-sm transition-all group-hover:scale-110`}>
                    0{i+1}
                  </div>
                  <div className="pt-1">
                    <h4 className="font-black text-slate-900 mb-2 text-xl tracking-tight leading-none flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${step.dot}`}></span>
                      {step.title}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-sm">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative rounded-[4rem] overflow-hidden shadow-2xl bg-slate-100 aspect-square lg:aspect-[4/5]"
            >
              <img 
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop" 
                alt="Solar Intelligence" 
                className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

              {/* Enhanced Float Card */}
              <div className="absolute bottom-10 left-10 right-10 p-10 glass-card rounded-[2.5rem] border-white/40 shadow-2xl bg-white/95 backdrop-blur-xl group cursor-default">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-blue-600 font-black text-[9px] uppercase tracking-[0.4em]">Efficiency Peak</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter group-hover:text-blue-600 transition-colors">
                    +$4.2M Leak Stopped
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      transition={{ duration: 2, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                    />
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Verified by Growth Lab Data</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
