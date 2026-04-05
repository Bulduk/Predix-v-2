'use client';

import { motion } from 'motion/react';

interface ThemeSelectorProps {
  currentTheme: string;
  onSelect: (theme: string) => void;
}

const THEMES = [
  { id: 'theme-light', color: 'bg-slate-200' },
  { id: 'theme-dark', color: 'bg-slate-900' },
  { id: 'theme-green', color: 'bg-emerald-500' },
  { id: 'theme-orange', color: 'bg-orange-500' },
];

export default function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
  return (
    <div className="absolute top-12 right-4 flex flex-col gap-3 z-50">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={`w-6 h-6 rounded-full ${theme.color} border-2 transition-transform ${currentTheme === theme.id ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
          aria-label={`Select ${theme.id}`}
        />
      ))}
    </div>
  );
}
