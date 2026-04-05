import React from 'react';
import { EdgeSignal } from '@/lib/edge-detection';
import { Zap, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface EdgePanelProps {
  signal: EdgeSignal | null;
}

export default function EdgePanel({ signal }: EdgePanelProps) {
  if (!signal || signal.edge_score === 0) {
    return (
      <div className="p-4 rounded-xl border bg-bg-surface border-border-color mb-6 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-border-color rounded w-1/3"></div>
          <div className="h-6 bg-border-color rounded w-1/6"></div>
        </div>
        <div className="h-4 bg-border-color rounded w-full mb-2"></div>
        <div className="h-4 bg-border-color rounded w-2/3"></div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-text-secondary/60';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-white/5 border-white/10';
  };

  return (
    <div className={`p-4 rounded-xl border ${getScoreBg(signal.edge_score)} mb-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${getScoreColor(signal.edge_score)}`} />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Edge Detection</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-black ${getScoreColor(signal.edge_score)}`}>
            {signal.edge_score}
          </span>
          <span className="text-xs text-text-secondary font-medium">/ 100</span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-text-secondary leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-text-secondary/50" />
          {signal.reasoning}
        </p>
      </div>

      {signal.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {signal.badges.map((badge, idx) => {
            let BadgeIcon = Zap;
            let badgeColor = 'text-text-secondary bg-bg-surface border-border-color';
            
            if (badge === 'High Edge') {
              badgeColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
            } else if (badge === 'Whale Active') {
              BadgeIcon = AlertTriangle;
              badgeColor = 'text-theme-primary bg-theme-primary/20 border-theme-primary/30';
            } else if (badge === 'Mispriced') {
              BadgeIcon = TrendingUp;
              badgeColor = 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            }

            return (
              <div key={idx} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${badgeColor}`}>
                <BadgeIcon className="w-3 h-3" />
                {badge}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
