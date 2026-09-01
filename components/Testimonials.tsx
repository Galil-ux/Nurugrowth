
import React from 'react';
import { TESTIMONIALS_DATA } from '../constants';

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-32 px-6 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-5xl font-black mb-6 tracking-tight text-slate-900">Voices of the Transition.</h2>
          <p className="text-slate-500 text-lg font-medium">Real impact measured in connections, dignity, and revenue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS_DATA.map((rev, i) => (
            <div key={i} className="glass-card p-12 rounded-[3.5rem] relative group border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
              <div className="absolute top-10 left-10 text-6xl text-blue-100/30 font-serif leading-none font-bold">“</div>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed relative z-10 italic font-medium flex-grow">
                {rev.text}
              </p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-8">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 shadow-sm">
                  {rev.author[0]}
                </div>
                <div>
                  <div className="text-slate-900 font-black">{rev.author}</div>
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{rev.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
