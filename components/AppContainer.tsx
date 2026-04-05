'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import BottomNav from './BottomNav';
import Feed from './Feed';
import MarketPage from './MarketPage';
import PulsePage from './PulsePage';
import ProfilePage from './ProfilePage';
import CenterModal from './CenterModal';
import CreateMarketModal from './CreateMarketModal';

export type TabType = 'home' | 'market' | 'pulse' | 'profile';
export type ThemeType = 'theme-light' | 'theme-dark' | 'theme-green' | 'theme-orange';

export default function AppContainer() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [isCreateMarketModalOpen, setIsCreateMarketModalOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeType>('theme-light');

  // Apply theme to body for global background color
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div className={`relative w-full h-full max-w-md mx-auto overflow-hidden shadow-2xl sm:rounded-3xl sm:h-[850px] sm:my-8 sm:border border-border-color bg-bg-base text-text-primary ${theme}`}>
      {/* Main Content Area */}
      <div className="relative w-full h-full">
        {activeTab === 'home' && <Feed />}
        {activeTab === 'market' && <MarketPage />}
        {activeTab === 'pulse' && <PulsePage />}
        {activeTab === 'profile' && <ProfilePage theme={theme} setTheme={setTheme} />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onCenterClick={() => setIsCreateMarketModalOpen(true)} 
        onCreatorClick={() => setIsCreateMarketModalOpen(true)}
      />

      {/* Modals */}
      <AnimatePresence>
        {isCenterModalOpen && (
          <CenterModal onClose={() => setIsCenterModalOpen(false)} />
        )}
        {isCreateMarketModalOpen && (
          <CreateMarketModal onClose={() => setIsCreateMarketModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
