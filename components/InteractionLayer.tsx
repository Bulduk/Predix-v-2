'use client';

import { Heart, MessageCircle, Bookmark, Share2, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';

interface InteractionLayerProps {
  isLiked: boolean;
  setIsLiked: (val: boolean) => void;
  isSaved: boolean;
  setIsSaved: (val: boolean) => void;
  volume: string;
}

export default function InteractionLayer({ isLiked, setIsLiked, isSaved, setIsSaved, volume }: InteractionLayerProps) {
  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
        className="flex flex-col items-center gap-1 group"
      >
        <motion.div 
          whileTap={{ scale: 0.8 }}
          className={`p-3 rounded-full backdrop-blur-md border transition-colors ${isLiked ? 'bg-trade-down/20 border-trade-down/50' : 'bg-bg-surface border-border-color group-hover:bg-bg-surface-hover'}`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-trade-down text-trade-down' : 'text-text-primary'}`} strokeWidth={1.5} />
        </motion.div>
        <span className="text-xs font-medium text-text-secondary drop-shadow-md">12.4K</span>
      </button>

      <button 
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-1 group"
      >
        <motion.div 
          whileTap={{ scale: 0.8 }}
          className="p-3 rounded-full bg-bg-surface backdrop-blur-md border border-border-color group-hover:bg-bg-surface-hover transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
        </motion.div>
        <span className="text-xs font-medium text-text-secondary drop-shadow-md">342</span>
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }}
        className="flex flex-col items-center gap-1 group"
      >
        <motion.div 
          whileTap={{ scale: 0.8 }}
          className={`p-3 rounded-full backdrop-blur-md border transition-colors ${isSaved ? 'bg-theme-primary/20 border-theme-primary/50' : 'bg-bg-surface border-border-color group-hover:bg-bg-surface-hover'}`}
        >
          <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-theme-primary text-theme-primary' : 'text-text-primary'}`} strokeWidth={1.5} />
        </motion.div>
        <span className="text-xs font-medium text-text-secondary drop-shadow-md">Save</span>
      </button>

      <button 
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-1 group"
      >
        <motion.div 
          whileTap={{ scale: 0.8 }}
          className="p-3 rounded-full bg-bg-surface backdrop-blur-md border border-border-color group-hover:bg-bg-surface-hover transition-colors"
        >
          <Share2 className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
        </motion.div>
        <span className="text-xs font-medium text-text-secondary drop-shadow-md">Share</span>
      </button>

      <div className="flex flex-col items-center gap-1 mt-2">
        <div className="p-2 rounded-full bg-bg-surface backdrop-blur-md border border-border-color">
          <BarChart2 className="w-5 h-5 text-theme-accent" strokeWidth={1.5} />
        </div>
        <span className="text-[10px] font-semibold text-theme-accent drop-shadow-md">{volume}</span>
      </div>
    </>
  );
}
