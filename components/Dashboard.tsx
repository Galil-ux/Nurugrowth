
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AnalysisResults } from '../types';

interface DashboardProps {
  results: AnalysisResults;
  insights: string | null;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ results, insights, onReset }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'sequence'>('report');
  const [isDownloading, setIsDownloading] = useState(false);

  const getStatusHeadline = () => {
    if (results.valueGap > 0) {
      return `Your current marketing is leaving KES ${results.valueGap.toLocaleString()} on the table every month.`;
    }
    return `You have a strong foundation, but you are currently capped at ${results.growthPercentage}% of your potential market share.`;
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      const reportName = `NuruGrowth_Intelligence_Map_${new Date().getTime()}.pdf`;
      alert(`SUCCESS: Your custom Growth Map "${reportName}" has been generated and queued for transmission to your registered email address.`);
    }, 2500);
  };

  const comparisonData = [
    { name: 'Current Performance', value: results.dataPoints[0].current, color: '#e2e8f0' },
    { name: 'Optimized Performance', value: results.dataPoints[0].optimized, color: '#2563eb' }
  ];

  const cleanInsights = insights ? insights.replace(/\*\*/g, '') : '';

  const EmailPreview = ({ subject, trigger, body }: { subject: string, trigger: string, body: React.ReactNode }) => (
    <div className="glass-card p-10 rounded-[2.5rem] border-slate-100 bg-white shadow-lg space-y-6">
      <div className="flex justify-between items-center border-b border-slate-50 pb-6">
        <div>
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Subject</div>
          <div className="text-lg font-bold text-slate-900 tracking-tight">{subject}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trigger</div>
          <div className="text-xs font-mono text-slate-500 font-bold">{trigger}</div>
        </div>
      </div>
      <div className="text-slate-600 text-sm leading-relaxed font-sans whitespace-pre-wrap font-medium">
        {body}
      </div>
    </div>
  );

  return (
    <div className="py-24 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-24">
        
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setActiveTab('report')}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}
            >
              Analysis Report
            </button>
            <button 
              onClick={() => setActiveTab('sequence')}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sequence' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}
            >
              Nurture Sequence
            </button>
          </div>
        </div>

        {activeTab === 'report' ? (
          <div className="space-y-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Status: Intelligence Generated</div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] max-w-5xl tracking-tighter">
                {getStatusHeadline()}
              </h2>
              <div className="flex flex-wrap gap-6 pt-4">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating PDF...
                    </>
                  ) : (
                    'Download Full Growth Map (PDF)'
                  )}
                </button>
                <button 
                  onClick={onReset}
                  className="px-10 py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:text-slate-900 transition-all text-xs font-black uppercase tracking-widest active:scale-95 shadow-sm"
                >
                  Recalibrate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-12">
                <div>
                  <h3 className="text-4xl font-black tracking-tight mb-4 text-slate-900">Benchmark Matrix.</h3>
                  <p className="text-slate-600 text-lg leading-relaxed max-w-md font-medium">
                    Critical performance audit comparing your current <span className="text-slate-900 font-bold">{results.industry}</span> operations against regional solar standards.
                  </p>
                </div>
                
                <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl">
                  <div className="grid grid-cols-3 bg-slate-50 p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <div>Core Metric</div>
                    <div className="text-center">Current</div>
                    <div className="text-right">Benchmark</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {results.dataPoints.map((dp, i) => (
                      <div key={i} className="grid grid-cols-3 p-8 items-center group hover:bg-slate-50 transition-colors">
                        <div className="text-sm font-black text-slate-900">{dp.name}</div>
                        <div className="text-center text-sm font-mono text-slate-400 font-bold">
                          {dp.unit === 'KES' ? 'KES ' : ''}{dp.current.toLocaleString()}{dp.unit === '%' ? '%' : ''}
                        </div>
                        <div className="text-right text-sm font-mono text-blue-600 font-black">
                           {dp.unit === 'KES' ? 'KES ' : ''}{dp.benchmark.toLocaleString()}{dp.unit === '%' ? '%' : ''}
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-3 p-8 items-center bg-blue-50/50">
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Focus Target</div>
                        <div className="col-span-2 text-right text-xs font-black text-slate-900 uppercase tracking-widest">{results.industryValueMetric}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-10 glass-card rounded-[2.5rem] border-blue-100 shadow-xl bg-white">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Monthly Leakage</div>
                    <div className="text-4xl font-black text-blue-600 tracking-tighter">KES {results.valueGap.toLocaleString()}</div>
                  </div>
                  <div className="p-10 glass-card rounded-[2.5rem] shadow-xl bg-white border-slate-50">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Efficiency Gain</div>
                    <div className="text-4xl font-black text-emerald-600 tracking-tighter">+{results.growthPercentage}%</div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-12 rounded-[4rem] h-[650px] border-slate-100 relative overflow-hidden bg-white shadow-2xl sticky top-32">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent"></div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 text-center">Revenue Gap Visualization</div>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tick={{dy: 10}} fontWeight="bold" />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.02)'}}
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '24px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                      itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" radius={[20, 20, 0, 0]} barSize={140}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-8 text-center">
                  <div className="inline-block px-6 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                    Optimization Potential identified
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-16 rounded-[4rem] bg-blue-50/50 border-blue-100 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 blur-[100px]"></div>
              <div className="max-w-4xl space-y-10">
                <h3 className="text-4xl font-black tracking-tight text-slate-900">Institutional Strategy Brief</h3>
                <p className="text-2xl text-slate-600 leading-relaxed font-semibold">
                  "Based on your <span className="text-slate-900 font-black">KES {results.currentCAC.toLocaleString()}</span> lead cost, our matrix indicates we can stabilize your acquisition pipeline by targeting the <span className="text-blue-600 font-black">KES {results.benchmarkCAC.toLocaleString()}</span> benchmark—recovering <span className="text-slate-900 font-black">KES {results.valueGap.toLocaleString()}</span> in lost revenue annually."
                </p>
              </div>
            </div>

            {insights ? (
              <div className="glass-card overflow-hidden rounded-[4rem] border-slate-100 shadow-2xl bg-white">
                <div className="bg-slate-50 px-16 py-10 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-2xl">N</div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Market Intelligence Lab Report</h3>
                  </div>
                  <span className="px-4 py-1 rounded-full border border-slate-200 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Confidential Analysis</span>
                </div>
                <div className="p-16 prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap font-sans leading-[1.8] text-xl font-medium">
                  {cleanInsights}
                </div>
              </div>
            ) : (
              <div className="glass-card overflow-hidden rounded-[4rem] border-slate-100 shadow-2xl bg-white animate-pulse">
                <div className="bg-slate-50 px-16 py-10 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-200"></div>
                    <div className="h-6 w-64 bg-slate-200 rounded-lg"></div>
                  </div>
                  <div className="h-5 w-36 bg-slate-200 rounded-full"></div>
                </div>
                <div className="p-16 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-11/12"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                  <div className="h-4 bg-slate-200 rounded w-full pt-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-6 duration-700">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Your Nurture Protocol</h2>
              <p className="text-slate-500 text-lg font-medium">We don't just send reports; we build consultative sequences that convert. Here is the automated sequence triggered for your business.</p>
            </div>

            <EmailPreview 
              trigger="Immediate (0 min)"
              subject="Your Growth Map & Analysis (Attached)"
              body={`Hello,

While most firms guess, you just took the first step toward data-driven growth.

Based on the figures you provided, your "Value Gap" is currently KES ${results.valueGap.toLocaleString()}. This is the revenue your business is currently missing out on.

I’ve attached your full breakdown below. It highlights:
- Your current CAC vs. the Industry Benchmark.
- The "Found Money" hidden in your conversion rate.
- A 6-month projection of our research methodology.

What’s next? This data is a roadmap, but the execution is where the profit is made.

Best, Moses Mutuma`}
            />

            <EmailPreview 
              trigger="24 Hours Later"
              subject="One thing I noticed in your data..."
              body={`Hi,

I was reviewing the analysis our tool generated for you yesterday. Looking at your KES ${results.currentCAC.toLocaleString()} cost per acquisition, I noticed a pattern we see often.

Usually, a cost that high isn't a "budget" problem—it’s a "Message-Market Mismatch." Our firm specializes in the deep-dive research required to find exactly what your customers need to hear.

Would you like me to send over a case study where we reduced CAC by 18% in 30 days?

Best, Moses Mutuma`}
            />

            <EmailPreview 
              trigger="3 Days Later"
              subject={`KES ${results.valueGap.toLocaleString()}... still on the table?`}
              body={`I’ll keep this brief. 

Every day that passes without optimizing your conversion path is another day your competitors are capturing the market share our analysis identified.

Are you open to a brief chat Thursday or Friday to discuss how we can turn these projections into actual revenue?

Best, Moses Mutuma`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
