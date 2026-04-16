'use client';

interface LoadingSkeletonProps {
  /** Number of skeleton rows to show */
  rows?: number;
  /** Whether to show as card grid or table rows */
  variant?: 'cards' | 'table' | 'stat-cards';
}

export default function LoadingSkeleton({ rows = 4, variant = 'cards' }: LoadingSkeletonProps) {
  if (variant === 'stat-cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/40 border-[0.5px] border-slate-700/50 rounded-2xl p-5 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-700/50" />
              <div className="w-14 h-6 rounded-full bg-slate-700/50" />
            </div>
            <div className="h-3 w-20 bg-slate-700/50 rounded mb-2" />
            <div className="h-7 w-24 bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="glass-panel bg-slate-800/40 border-[0.5px] border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-700/50">
          <div className="h-5 w-32 bg-slate-700/50 rounded animate-pulse" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-white/5 animate-pulse"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-700/50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-slate-700/50 rounded" />
              <div className="h-3 w-24 bg-slate-700/50 rounded" />
            </div>
            <div className="h-4 w-20 bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Cards variant (default)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/40 border-[0.5px] border-slate-700/50 rounded-2xl p-5 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-700/50" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-28 bg-slate-700/50 rounded" />
              <div className="h-3 w-16 bg-slate-700/50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
