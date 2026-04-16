'use client';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="bg-white/70 dark:bg-rose-950/20 backdrop-blur-[40px] border border-rose-200 dark:border-rose-500/30 rounded-[1.5rem] p-6 flex items-center gap-5 animate-fade-in-up shadow-xl shadow-rose-500/5">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-inner">
        <AlertTriangle className="w-7 h-7 text-rose-500 dark:text-rose-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-900 dark:text-rose-200 uppercase tracking-tight">System Notice</p>
        <p className="text-xs text-slate-500 dark:text-rose-400/80 mt-1 leading-relaxed">
          {typeof message === 'object' && message !== null
            ? (message as { message?: string }).message || JSON.stringify(message)
            : message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-600 dark:text-rose-300 text-xs font-black uppercase tracking-widest transition-all border border-rose-500/20 shrink-0 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
