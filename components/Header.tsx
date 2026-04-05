'use client';

import { Search, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex items-center justify-between pointer-events-auto">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-theme-primary),0.5)]">
          <span className="text-white font-bold text-lg leading-none tracking-tighter">P</span>
        </div>
        <span className="text-text-primary font-bold text-xl tracking-tight drop-shadow-md">Predix</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full bg-bg-surface border border-border-color backdrop-blur-md flex items-center justify-center hover:bg-bg-surface-hover transition-colors">
          <Search className="w-5 h-5 text-text-secondary" />
        </button>
        <button className="w-10 h-10 rounded-full bg-bg-surface border border-border-color backdrop-blur-md flex items-center justify-center hover:bg-bg-surface-hover transition-colors overflow-hidden">
          <User className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </header>
  );
}
