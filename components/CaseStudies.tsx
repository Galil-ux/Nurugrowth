
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

interface CaseStudy {
  id: string;
  client: string;
  industry: string;
  problem: string;
  result: string;
  catalyst: string;
  diagnostic: {
    intel: string;
    segment: string;
    aha: string;
  };
  pivot: {
    theory: string;
    action: string;
    tech: string;
  };
  metrics: {
    label: string;
    before: string;
    after: string;
    improvement: string;
  }[];
  quote: {
    text: string;
    author: string;
    role: string;
  };
  img: string;
}

const CaseStudies: React.FC = () => {
  const [activeStudy, setActiveStudy] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const studies: CaseStudy[] = [
    {
      id: 'sunafya',
      client: 'SunAfya Energy',
      industry: 'Residential Solar (B2C)',
      problem: 'High Customer Acquisition Cost (CAC) and stagnating lead quality in rural Kenya.',
      result: '216% Increase in Conv. Rate | -62% CAC',
      catalyst: 'Identified that rural homeowners prioritized "Energy Dignity" and school lighting over "Cost Savings".',
      diagnostic: {
        intel: "Analysis of 12 regional competitors showed they were all pitching 'ROI' to a demographic with no fixed grid baseline.",
        segment: "Data mining revealed the ICP was actually multi-generational households with children in boarding schools, not just local business owners.",
        aha: "Customers weren't buying to save money; they were buying to secure their children's education through reliable study hours."
      },
      pivot: {
        theory: "By shifting the value proposition from 'Save Money' to 'Invest in Your Legacy', resonance would increase in targeted counties.",
        action: "Overhauled creative to feature local success stories focused on community impact and educational outcomes.",
        tech: "Utilized NuruGrowth's ROI Engine to re-allocate 40% of the budget from Google Search to localized SMS and Radio-to-WhatsApp funnels."
      },
      metrics: [
        { label: 'Conv. Rate', before: '1.2%', after: '3.8%', improvement: '+216%' },
        { label: 'Cost Per Lead', before: 'KSh 850', after: 'KSh 320', improvement: '-62%' },
        { label: 'Sales Velocity', before: '45 Days', after: '28 Days', improvement: '37% Faster' }
      ],
      quote: {
        text: "We thought we knew our customers, but NuruGrowth's research showed us we were missing 40% of our market. The data didn't just change our marketing; it changed our product roadmap.",
        author: "Brian O.",
        role: "FOUNDER, SUNAFYA"
      },
      img: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1200'
    },
    {
      id: 'pwanisolar',
      client: 'Pwani Solar Solutions',
      industry: 'Commercial Solar (C&I)',
      problem: 'Unable to close private sector deals, over-reliant on NGO contracts.',
      result: '150% Private Sector Revenue Growth',
      catalyst: 'Research revealed that agri-businesses were unaware that solar could power heavy processing machinery, not just lighting.',
      diagnostic: {
        intel: "Conducted technical audits of 50 local mills and found 80% could operate on hybrid solar-diesel systems.",
        segment: "Identified 'Processing-First' ICPs who viewed power outages as their #1 operational risk.",
        aha: "The barrier wasn't the cost of solar; it was the perceived technical limitation regarding high-torque machinery."
      },
      pivot: {
        theory: "A technical education-first messaging strategy would build the trust necessary for high-investment C&I decisions.",
        action: "Created 'Solar for Processing' whitepapers and live demonstration events at local trade shows.",
        tech: "Implemented a dedicated B2B LinkedIn and direct-outreach system focusing on operational uptime metrics."
      },
      metrics: [
        { label: 'B2B Leads', before: '5/mo', after: '22/mo', improvement: '+340%' },
        { label: 'Close Rate', before: '8%', after: '19%', improvement: '+137%' },
        { label: 'Avg Deal Size', before: 'KSh 1.2M', after: 'KSh 2.8M', improvement: '+133%' }
      ],
      quote: {
        text: "NuruGrowth helped us craft offers for schools, churches, and agri-businesses—revenue from private clients grew by 150% in 5 months. They are deeply aligned with our mission.",
        author: "Daniel M.",
        role: "CEO, LAKE REGION POWER"
      },
      img: 'https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=1200'
    }
  ];

  const current = studies[activeStudy];

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    
    try {
      const doc = new jsPDF();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text("CASE STUDY EVIDENCE", 105, 20, { align: "center" });
      
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(current.client.toUpperCase(), 105, 30, { align: "center" });
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 35, 190, 35);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("THE CHALLENGE", 20, 50);
      doc.setFont("helvetica", "normal");
      const splitProblem = doc.splitTextToSize(current.problem, 170);
      doc.text(splitProblem, 20, 55);
      
      doc.setFont("helvetica", "bold");
      doc.text("THE RESULT", 20, 75);
      doc.setFont("helvetica", "normal");
      doc.text(current.result, 20, 80);
      
      doc.setFont("helvetica", "bold");
      doc.text("KEY METRICS", 20, 100);
      doc.setFont("helvetica", "normal");
      current.metrics.forEach((m, i) => {
        doc.text(`${m.label}: ${m.before} -> ${m.after} (${m.improvement})`, 20, 110 + (i * 7));
      });
      
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Verified by NuruGrowth Lab Data Science Team.", 105, 280, { align: "center" });
      
      doc.save(`NuruGrowth_CaseStudy_${current.id}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section id="case-studies" className="py-32 px-6 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-black mb-6 tracking-tight text-slate-900">Performance Evidence.</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Our case studies aren't just ads; they are the result of deep-dive market intelligence. 
              We prove that research is the ultimate catalyst for scale.
            </p>
          </div>
          <div className="flex gap-4">
            {studies.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveStudy(i)}
                className={`w-12 h-12 rounded-full border transition-all font-black text-xs ${
                  activeStudy === i ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'border-slate-200 text-slate-400 hover:border-slate-400'
                }`}
              >
                0{i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="glass-card rounded-[4rem] overflow-hidden border-slate-100 shadow-2xl bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              <div className="lg:col-span-5 relative min-h-[400px]">
                <img src={current.img} alt={current.client} className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12 space-y-6">
                  <div className="inline-block px-4 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                    Executive Summary
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{current.client}</h3>
                    <div className="text-blue-600 font-black text-sm uppercase tracking-widest mb-4">{current.industry}</div>
                    <p className="text-slate-600 text-sm leading-relaxed font-semibold">{current.problem}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-900/10">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">The Result</div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">{current.result}</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 p-12 lg:p-20 space-y-16 bg-slate-50/50">
                
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 text-sm">P1</div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Phase 1: The Diagnostic</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Intelligence</div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">{current.diagnostic.intel}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audience Segmentation</div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">{current.diagnostic.segment}</p>
                    </div>
                  </div>
                  <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-3xl shadow-sm">
                    <div className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3">The "Aha!" Moment</div>
                    <p className="text-slate-900 text-lg font-black leading-relaxed">"{current.diagnostic.aha}"</p>
                  </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-sm">P2</div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Phase 2: The Strategic Pivot</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-6 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium"><span className="text-slate-900 font-black">The Theory:</span> {current.pivot.theory}</p>
                    </div>
                    <div className="flex gap-6 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium"><span className="text-slate-900 font-black">The Action:</span> {current.pivot.action}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-600 text-sm">P3</div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">Phase 3: The Proof</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-[0.4em] font-black">Verified Data</span>
                  </div>
                  
                  <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Before Research</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">After Research</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Improvement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {current.metrics.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-6 text-sm font-black text-slate-900">{m.label}</td>
                            <td className="p-6 text-sm font-mono text-slate-400 font-bold">{m.before}</td>
                            <td className="p-6 text-sm font-mono text-slate-900 font-black">{m.after}</td>
                            <td className="p-6 text-sm font-mono text-emerald-600 font-black">{m.improvement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-12 bg-slate-900 rounded-[3rem] p-10 md:p-14 space-y-12 shadow-2xl">
                  <div className="relative">
                    <p className="text-xl md:text-2xl italic text-slate-300 font-medium leading-relaxed mb-10 max-w-2xl">
                      "{current.quote.text}"
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center font-black text-slate-900 text-xl shadow-lg shadow-orange-500/20">{current.quote.author[0]}</div>
                      <div>
                        <div className="text-white font-black text-lg tracking-tight">{current.quote.author}</div>
                        <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{current.quote.role}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-10">
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-2xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
                    >
                      {isDownloading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-slate-900" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Processing...
                        </>
                      ) : (
                        'DOWNLOAD FULL REPORT (PDF)'
                      )}
                    </button>
                    <a 
                      href="https://calendly.com/mosemirano6538/30min" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#f59e0b] font-black uppercase text-[11px] tracking-[0.2em] hover:text-[#d97706] transition-colors whitespace-nowrap"
                    >
                      BOOK YOUR DATA DEEP DIVE
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
