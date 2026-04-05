import React from 'react';
import { MispricingSignal } from '@/lib/mispricing-detection';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface MispricingPanelProps {
  signal: MispricingSignal | null;
}

export default function MispricingPanel({ signal }: MispricingPanelProps) {
  if (!signal || signal.mispricing_score === 0) {
    return (
      <div className="p-4 rounded-xl border bg-bg-surface border-border-color mb-6 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-border-color rounded w-1/3"></div>
          <div className="h-6 bg-border-color rounded w-1/6"></div>
        </div>
        <div className="h-4 bg-border-color rounded w-full mb-2"></div>
        <div className="h-4 bg-border-color rounded w-2/3"></div>
      </div>
    );
  }

  const isYes = signal.direction === 'YES';
  const colorClass = isYes ? 'text-emerald-400' : 'text-red-400';
  const bgClass = isYes ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30';
  const Icon = isYes ? TrendingUp : TrendingDown;

  return (
    <div className={`p-4 rounded-xl border ${bgClass} mb-6`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-5 h-5 ${colorClass}`} />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Mispricing Detected</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-black ${colorClass}`}>
            {signal.mispricing_score}
          </span>
          <span className="text-xs text-text-secondary font-medium">Score</span>
        </div>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${colorClass}`} />
        {signal.explanation}
      </p>
    </div>
  );
}
