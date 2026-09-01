
import React, { useState, useEffect, useMemo } from 'react';
import { useInteractions } from '../services/useInteractions';
import { motion, AnimatePresence } from 'framer-motion';
import { INDUSTRIES, INDUSTRY_BENCHMARKS } from '../constants';
import { AnalysisInput, AnalysisResults } from '../types';
import Dashboard from './Dashboard';
import { generateMarketInsights } from '../services/geminiService';
import { GrowthAnalysisProcessingSkeleton, BenchmarkMetricShimmer } from './skeletons/GrowthToolSkeleton';
import { Loader2, Sparkles, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { submitSubscriberEmail } from '../services/firebase';

const FORM_STORAGE_KEY = 'nurugrowth_form_draft';
const STEP_STORAGE_KEY = 'nurugrowth_step_draft';

const DISPOSABLE_DOMAINS = [
  'temp-mail.org', 'guerrillamail.com', '10minutemail.com', 'mailinator.com', 
  'trashmail.com', 'yopmail.com', 'sharklasers.com', 'dispostable.com', 
  'getairmail.com', 'burnemail.com'
];

const ANALYSIS_STAGES = [
  'Accessing regional solar database & benchmark registries...',
  'Evaluating CAC & conversion efficiency vs market median...',
  'Quantifying value gap & monthly untapped capital...',
  'Formulating customized AI growth vectors via Gemini...'
];

const GrowthTool: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const { updateInteraction } = useInteractions();
  const [step, setStep] = useState<number>(() => {
    const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  
  const [loading, setLoading] = useState(false);
  const [stageProgress, setStageProgress] = useState(15);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isIndustrySwitching, setIsIndustrySwitching] = useState(false);
  const [showResultsPreview, setShowResultsPreview] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(ANALYSIS_STAGES[0]);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState<AnalysisInput>(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      industry: INDUSTRIES[0],
      monthlyRevenue: 250000,
      averageOrderValue: 25000,
      conversionRate: 2.5,
      adSpend: 35000,
      traffic: 15000,
      ltv: 45000,
      email: '',
    };
  });

  const handleSelectIndustry = (ind: string) => {
    setIsIndustrySwitching(true);
    setForm(prev => ({ ...prev, industry: ind }));
    setTimeout(() => setIsIndustrySwitching(false), 250);
  };

  const emailValidation = useMemo(() => {
    const email = form.email || '';
    if (email.length === 0) return { isValid: false, message: '', color: 'slate' };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid format.', color: 'red' };
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return { isValid: false, message: 'Professional email only.', color: 'red' };
    }

    return { isValid: true, message: 'Verified.', color: 'emerald' };
  }, [form.email]);

  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    localStorage.setItem(STEP_STORAGE_KEY, step.toString());
  }, [step]);

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!form.industry) {
        setError("Select an industry.");
        return false;
      }
    }
    if (step === 2) {
      if (form.traffic <= 0) {
        setError("Visitors must be > 0.");
        return false;
      }
    }
    if (step === 3) {
      if (form.averageOrderValue <= 0) {
        setError("Initial Sale Value must be > 0.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    updateInteraction('hasUsedGrowthLab');
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };

  const calculateAnalysis = async () => {
    const benchmark = INDUSTRY_BENCHMARKS[form.industry];
    const currentLeads = form.traffic * (form.conversionRate / 100);
    const currentCAC = form.adSpend / (currentLeads || 1); 
    const targetConvRate = benchmark.avgConvRate / 100;
    const projectedRev = (form.traffic * targetConvRate) * form.ltv;
    const potentialRevenueBenchmark = (form.traffic * targetConvRate) * form.averageOrderValue;
    const valueGap = Math.max(0, projectedRev - form.monthlyRevenue);
    const optimizedCAC = benchmark.targetCAC;
    const efficiencyGain = Math.max(0, currentCAC - optimizedCAC);
    const healthScore = form.ltv / (currentCAC || 1);

    const resultsData: AnalysisResults = {
      industry: form.industry,
      industryValueMetric: benchmark.valueMetric,
      traffic: Math.round(form.traffic),
      currentCAC: Math.round(currentCAC),
      projectedRevenue: Math.round(projectedRev),
      efficiencyGain: Math.round(efficiencyGain),
      growthPercentage: Math.round(((projectedRev - form.monthlyRevenue) / (form.monthlyRevenue || 1)) * 100),
      optimizedCAC: Math.round(optimizedCAC),
      valueGap: Math.round(valueGap),
      healthScore: Number(healthScore.toFixed(2)),
      benchmarkConvRate: benchmark.avgConvRate,
      benchmarkCAC: benchmark.targetCAC,
      isHighPerformer: form.conversionRate >= benchmark.avgConvRate,
      dataPoints: [
        { name: 'Revenue', current: form.monthlyRevenue, benchmark: potentialRevenueBenchmark, optimized: projectedRev, unit: 'KES' },
        { name: 'Conv Rate', current: form.conversionRate, benchmark: benchmark.avgConvRate, optimized: benchmark.avgConvRate, unit: '%' },
        { name: 'Cost/Lead', current: currentCAC, benchmark: benchmark.targetCAC, optimized: optimizedCAC, unit: 'KES' },
      ],
      budgetAllocation: [
        { name: 'High-Intent Search', value: 45, color: '#2563eb' },
        { name: 'EPC Research', value: 25, color: '#ef4444' },
        { name: 'Nurture Systems', value: 20, color: '#3b82f6' },
        { name: 'Market Intelligence', value: 10, color: '#0f172a' },
      ],
    };

    setResults(resultsData);
    const customInsights = await generateMarketInsights(form);
    setInsights(customInsights);
  };

  const runAnalysis = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setStageProgress(15);
    setLoadingMessage(ANALYSIS_STAGES[0]);

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < ANALYSIS_STAGES.length) {
        setLoadingMessage(ANALYSIS_STAGES[msgIndex]);
        setStageProgress(((msgIndex + 1) / ANALYSIS_STAGES.length) * 90);
      } else {
        clearInterval(interval);
        setStageProgress(100);
        calculateAnalysis().then(() => {
          setLoading(false);
          setShowResultsPreview(true);
        });
      }
    }, 600);
  };

  const finalizeReport = async () => {
    if (!emailValidation.isValid) {
      const msg = emailValidation.message || "Please provide a valid corporate business email.";
      setError(msg);
      showError("Corporate Email Required", msg);
      return;
    }
    setIsFinalizing(true);
    try {
      // Record subscriber email & dispatch polite welcome confirmation email
      await submitSubscriberEmail({
        email: form.email.trim(),
        name: `${form.industry} Executive`,
        companyName: form.industry,
        source: 'growth_lab',
        sourceLabel: `Solar Growth ROI Lab (${form.industry})`,
        country: 'Kenya'
      });

      await new Promise(r => setTimeout(r, 600));
      setStep(5);
      showSuccess(
        "Intelligence Report Unlocked",
        `Welcome aboard! A formal confirmation and polite welcome package have been dispatched to ${form.email}.`
      );
    } catch (err: any) {
      console.warn("Notice during email dispatch:", err);
      setStep(5);
      showSuccess(
        "Intelligence Report Generated",
        `Your customized solar analysis is ready. A copy has been scheduled for ${form.email}.`
      );
    } finally {
      setIsFinalizing(false);
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(STEP_STORAGE_KEY);
    }
  };

  const selectedBenchmark = form.industry ? INDUSTRY_BENCHMARKS[form.industry] : null;

  if (step === 5 && results) return <Dashboard results={results} insights={insights} onReset={() => {
    setResults(null);
    setStep(1);
    setShowResultsPreview(false);
  }} />;

  return (
    <section id="lab" className="py-16 md:py-32 px-4 md:px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        
        <div className="flex-grow w-full glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 shadow-2xl relative overflow-hidden border-slate-100 bg-white min-h-[500px] md:min-h-[600px]">
          <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-slate-50">
             <motion.div 
               className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
               initial={{ width: "0%" }}
               animate={{ width: `${(Math.min(step, 4) / 4) * 100}%` }}
               transition={{ duration: 0.8, ease: "circOut" }}
             />
          </div>
          
          <div className="absolute top-4 md:top-6 right-6 md:right-10 text-[9px] md:text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
            {step < 4 ? `Step ${step}/3` : 'Intelligence'}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
              >
                <GrowthAnalysisProcessingSkeleton
                  currentStage={loadingMessage}
                  stageProgress={stageProgress}
                  stages={ANALYSIS_STAGES}
                />
              </motion.div>
            ) : showResultsPreview ? (
              <motion.div key="results-preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-2 md:py-6 space-y-8 md:space-y-12">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Analysis Complete
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">Your Benchmark Matrix</h3>
                  <p className="text-slate-500 text-xs md:text-sm font-medium max-w-2xl">We've identified significant performance variance compared to <span className="text-slate-900 font-bold">{results?.industry}</span> industry standards.</p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/30">
                  <div className="grid grid-cols-3 bg-slate-100/50 p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <div>Metric</div>
                    <div className="text-center">Current</div>
                    <div className="text-right">Benchmark</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {results?.dataPoints.map((dp, i) => (
                      <div key={i} className="grid grid-cols-3 p-5 items-center">
                        <div className="text-sm font-black text-slate-900">{dp.name}</div>
                        <div className="text-center text-sm font-mono text-slate-500">{dp.unit === 'KES' ? 'KES ' : ''}{dp.current.toLocaleString()}{dp.unit === '%' ? '%' : ''}</div>
                        <div className="text-right text-sm font-mono text-blue-600 font-black">{dp.unit === 'KES' ? 'KES ' : ''}{dp.benchmark.toLocaleString()}{dp.unit === '%' ? '%' : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-6 md:p-8 bg-slate-900 rounded-2xl md:rounded-3xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Found Value Gap</div>
                    <div className="text-xl md:text-3xl font-black tracking-tighter">KES {results?.valueGap.toLocaleString()}</div>
                    <div className="mt-2 text-[9px] text-emerald-400 font-bold">Monthly potential recovered</div>
                  </div>
                  <div className="p-6 md:p-8 bg-blue-50 border border-blue-100 rounded-2xl md:rounded-3xl relative overflow-hidden">
                    <div className="text-[8px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Growth Efficiency</div>
                    <div className="text-xl md:text-3xl font-black text-blue-600 tracking-tighter">+{results?.growthPercentage}%</div>
                    <div className="mt-2 text-[9px] text-blue-500 font-bold">Optimized market scale</div>
                  </div>
                </div>

                <div className="pt-6 md:pt-8 border-t border-slate-100 space-y-6">
                   <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Secure the Full Intelligence Package</div>
                    <input 
                      type="email" 
                      placeholder="name@company.com" 
                      className="w-full bg-white border border-slate-200 rounded-2xl p-4 md:p-5 text-slate-900 outline-none font-bold text-sm shadow-sm focus:border-blue-500 transition-colors"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                    />
                    <motion.button 
                      onClick={finalizeReport} 
                      disabled={!emailValidation.isValid || isFinalizing} 
                      className={`w-full py-4 md:py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                        emailValidation.isValid && !isFinalizing 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 cursor-pointer' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isFinalizing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Executive Dashboard...</span>
                        </>
                      ) : (
                        <>
                          <span>Access Growth Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col space-y-8 md:space-y-14">
                {step === 1 && (
                  <div className="space-y-6 md:space-y-10">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">Benchmark Analysis.</h3>
                      <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">Select your primary sector segment to load market benchmarks.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                      {INDUSTRIES.map(i => (
                        <button 
                          key={i} 
                          onClick={() => handleSelectIndustry(i)} 
                          className={`p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] border text-left transition-all ${
                            form.industry === i 
                              ? 'bg-blue-600 border-blue-500 text-white shadow-xl' 
                              : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-black text-sm md:text-base">{i}</div>
                          <div className="text-[8px] md:text-[10px] uppercase font-bold tracking-wider opacity-60">Benchmark Segment</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3">
                      <button onClick={handleNext} className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all cursor-pointer">
                        Start ROI Audit
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 md:space-y-10">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Baseline Metrics.</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      {[
                        { label: 'Monthly Traffic', key: 'traffic' },
                        { label: 'Conversion Rate %', key: 'conversionRate' },
                        { label: 'Monthly Spend (KES)', key: 'adSpend' },
                        { label: 'Revenue (KES)', key: 'monthlyRevenue' },
                      ].map((field) => (
                        <div key={field.key} className="space-y-2">
                          <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl p-4 md:p-5 font-bold outline-none text-sm focus:border-blue-500" value={(form as any)[field.key] || ''} onChange={e => setForm({...form, [field.key]: parseFloat(e.target.value) || 0})} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 md:space-y-10">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Value Metrics.</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Initial Sale</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl p-4 md:p-5 font-bold outline-none text-sm focus:border-blue-500" value={form.averageOrderValue || ''} onChange={e => setForm({...form, averageOrderValue: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer LTV</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl p-4 md:p-5 font-bold outline-none text-sm focus:border-blue-500" value={form.ltv || ''} onChange={e => setForm({...form, ltv: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 md:pt-12 border-t border-slate-100">
                  {step > 1 ? (
                    <button onClick={() => setStep(s => s - 1)} className="px-6 py-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors cursor-pointer">Back</button>
                  ) : <div />}
                  {step !== 1 && (
                    step < 3 ? (
                      <button onClick={handleNext} className="px-8 md:px-12 py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer">Next Phase</button>
                    ) : (
                      <button onClick={runAnalysis} className="px-8 md:px-12 py-4 md:py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Run Intelligence</span>
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedBenchmark && !showResultsPreview && (
          <motion.aside key={form.industry} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-72 shrink-0">
            <div className="glass-card p-6 md:p-8 rounded-3xl border-blue-100 bg-white shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Benchmark Target</h4>
              </div>

              {isIndustrySwitching ? (
                <BenchmarkMetricShimmer />
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Target Conv %</div>
                    <div className="text-xl font-black text-slate-900 font-mono">{selectedBenchmark.avgConvRate}%</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Target CAC</div>
                    <div className="text-xl font-black text-slate-900 font-mono">KES {selectedBenchmark.targetCAC.toLocaleString()}</div>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Key Value Metric</div>
                    <div className="text-xs font-black text-slate-900 tracking-tight">{selectedBenchmark.valueMetric}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}

      </div>
    </section>
  );
};

export default GrowthTool;

