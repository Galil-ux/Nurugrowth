import React from 'react';
import { motion } from 'framer-motion';

export const BlogPostSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between animate-pulse">
      <div>
        {/* Image & Badge Skeleton */}
        <div className="relative aspect-[16/9] rounded-2xl md:rounded-3xl bg-slate-200/80 overflow-hidden mb-6">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          <div className="absolute top-4 left-4 w-20 h-6 bg-slate-300 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-5 bg-slate-300 rounded-lg"></div>
        </div>

        {/* Date & Author bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-3.5 w-24 bg-slate-200 rounded"></div>
          <div className="h-3.5 w-32 bg-slate-200 rounded"></div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-6 w-full bg-slate-200 rounded-lg"></div>
          <div className="h-6 w-4/5 bg-slate-200 rounded-lg"></div>
        </div>

        {/* Summary skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-slate-100 rounded"></div>
          <div className="h-4 w-11/12 bg-slate-100 rounded"></div>
          <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="h-5 w-28 bg-slate-200 rounded-lg"></div>
        <div className="h-8 w-36 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
};

export const BlogGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
      {Array.from({ length: count }).map((_, i) => (
        <BlogPostSkeleton key={i} />
      ))}
    </div>
  );
};

export const CommentSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 animate-pulse space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0"></div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 bg-slate-200 rounded"></div>
            <div className="h-3.5 w-20 bg-slate-100 rounded"></div>
          </div>
          <div className="h-3 w-16 bg-slate-100 rounded"></div>
        </div>
      </div>
      <div className="pl-12 space-y-1.5">
        <div className="h-3.5 w-full bg-slate-200/70 rounded"></div>
        <div className="h-3.5 w-5/6 bg-slate-200/70 rounded"></div>
      </div>
    </div>
  );
};
