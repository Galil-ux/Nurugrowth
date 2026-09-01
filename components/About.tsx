
import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const helpPoints = [
    "Precision-Targeting: Capturing homeowners in the 'Active Consideration' phase.",
    "Trust-Building: Establishing the high-authority status required for capital decisions.",
    "Funnel Engineering: Eliminating technical friction to lower acquisition costs.",
    "Institutional Consistency: Standardizing messaging across diverse regional counties."
  ];

  return (
    <section id="about" className="py-32 px-6 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6">Clarity. Strategy. Growth.</div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-8">How I Help</h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                You’re solving a critical energy gap—but generic marketing, confusing tech jargon, or scattergun ads aren’t moving the needle.
              </p>
            </div>
            
            <p className="text-lg text-slate-600 font-medium">
              At NuruGrowth, we blend strategic marketing rigor with purpose-led clarity to create institutional campaigns that:
            </p>

            <div className="space-y-6">
              {helpPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm shrink-0 mt-1">
                    ✓
                  </div>
                  <span className="text-lg font-black text-slate-900 tracking-tight leading-snug">{point}</span>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
              <p className="text-slate-500 font-medium italic leading-relaxed">
                "We’re your strategic partner—not a checklist agency—so your impact scales with integrity and data-backed certainty."
              </p>
              <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Supporting solar innovators across Kenya & East Africa | 100% Remote | Institutional Standards
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-16 rounded-[4rem] bg-white border-slate-200 shadow-2xl space-y-12"
          >
            <div>
              <div className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6">Founder's Perspective</div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-8">Moses Mutuma</h2>
              <div className="w-20 h-1 bg-red-600 mb-10"></div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-6">
                I’m Moses Mutuma, founder of NuruGrowth—a marketing agency built exclusively for solar innovators and clean energy brands across East Africa.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-10">
                With deep roots in systems design and regional growth strategy, I help you translate your mission into institutional customer acquisition—ensuring more Kenyan homes and businesses access reliable, clean power.
              </p>
              <p className="text-xl font-black text-slate-900 tracking-tight leading-relaxed">
                No generic templates. No guesswork. Just focused, human-centric marketing that delivers measurable scale for your legacy.
              </p>
            </div>

            <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
              <span className="text-2xl font-black text-blue-600 tracking-tighter uppercase italic">Power your brand forward.</span>
              <a 
                href="https://calendly.com/mosemirano6538/30min" 
                target="_blank"
                className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
              >
                Ready to Grow!
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
