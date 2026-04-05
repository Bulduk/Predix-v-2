'use client';

import { Home, LineChart, Activity, User, Plus, PenTool } from 'lucide-react';
import { TabType } from './AppContainer';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onCenterClick: () => void;
  onCreatorClick: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onCenterClick, onCreatorClick }: BottomNavProps) {
  const isMarketActive = activeTab === 'market';

  return (
    <div className="absolute bottom-0 left-0 w-full bg-bg-surface/90 backdrop-blur-xl border-t border-border-color pb-[env(safe-area-inset-bottom)] z-40">
      <div className="flex justify-around items-center h-16 px-2">
        <button onClick={() => onTabChange('home')} className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
          <Home size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => onTabChange('market')} className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === 'market' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
          <LineChart size={20} />
          <span className="text-[10px] font-medium">Markets</span>
        </button>
        
        <div className="relative -top-5">
          <button 
            onClick={onCenterClick} 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(var(--color-theme-primary),0.5)] hover:scale-105 transition-transform bg-theme-primary"
          >
            <Plus size={24} />
          </button>
        </div>

        <button onClick={() => onTabChange('pulse')} className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === 'pulse' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
          <Activity size={20} />
          <span className="text-[10px] font-medium">Pulse</span>
        </button>
        <button onClick={() => onTabChange('profile')} className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
          <User size={20} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}
