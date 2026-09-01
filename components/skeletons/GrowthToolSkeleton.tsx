import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Layers, BarChart3, Database } from 'lucide-react';

interface GrowthAnalysisProcessingSkeletonProps {
  currentStage: string;
  stageProgress: number;
  stages: string[];
}

export const GrowthAnalysisProcessingSkeleton: React.FC<GrowthAnalysisProcessingSkeletonProps> = ({
  currentStage,
  stageProgress,
  stages
}) => {
  return (
    <div className="py-8 md:py-12 space-y-10">
      {/* Top Spinner & Live Status */}
      <div className="text-center space-y-4 max-w-lg mx-auto">
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto">
          {/* Glowing pulse rings */}
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-60"></div>
          <div className="relative w-full h-full bg-blue-50 border-2 border-blue-200 rounded-3xl flex items-center justify-center shadow-inner">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 md:w-12 md:h-12 text-blue-600 flex items-center justify-center"
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/60 text-blue-800 text-[10px] font-black uppercase tracking-widest mb-2">
            <Activity className="w-3 h-3 animate-spin" />
            Solar Intelligence Engine
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Synthesizing Growth Matrix...
          </h3>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Correlating your project parameters against 45 regional solar EPC operators.
          </p>
        </div>

        {/* Dynamic Stage Tracker */}
        <div className="pt-2 space-y-2">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500"
              initial={{ width: '0%' }}
              animate={{ width: `${stageProgress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 font-mono">
            <span>{currentStage}</span>
            <span>{Math.round(stageProgress)}%</span>
          </div>
        </div>
      </div>

      {/* Skeleton Matrix Preview Cards (Simulating incoming dashboard blocks) */}
      <div className="space-y-6 animate-pulse pt-2">
        {/* Metric Header Skeleton */}
        <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>

        {/* Table skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
          <div className="grid grid-cols-3 gap-4 pb-3 border-b border-slate-100">
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div>
          </div>
          {[1, 2, 3].map((row) => (
            <div key={row} className="grid grid-cols-3 gap-4 py-2">
              <div className="h-4 bg-slate-200/80 rounded w-28"></div>
              <div className="h-4 bg-slate-100 rounded w-20 mx-auto"></div>
              <div className="h-4 bg-blue-100 rounded w-24 ml-auto"></div>
            </div>
          ))}
        </div>

        {/* 2-Card Value Gap Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-slate-100 rounded-2xl space-y-3">
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
            <div className="h-8 w-44 bg-slate-300 rounded-lg"></div>
            <div className="h-3 w-32 bg-slate-200 rounded"></div>
          </div>
          <div className="p-6 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3">
            <div className="h-3 w-28 bg-blue-200 rounded"></div>
            <div className="h-8 w-32 bg-blue-300 rounded-lg"></div>
            <div className="h-3 w-36 bg-blue-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BenchmarkMetricShimmer: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 w-40 bg-slate-200 rounded-md"></div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-14 bg-slate-100 rounded-xl"></div>
        <div className="h-14 bg-slate-100 rounded-xl"></div>
        <div className="h-14 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );
};
