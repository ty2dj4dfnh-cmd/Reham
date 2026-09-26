import React, { useEffect } from 'react';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';

interface CelebrationToastProps {
  message: string | null;
  onDismiss: () => void;
}

export const CelebrationToast: React.FC<CelebrationToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3800);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-xl border border-slate-700/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300">
        <Sparkles className="w-4 h-4 animate-spin animate-float-slow" />
      </div>
      <div className="text-xs font-semibold max-w-xs">{message}</div>
      <button
        onClick={onDismiss}
        className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss message"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
