import React from 'react';
import { RotateCcw, Home, Skull } from 'lucide-react';

interface GameOverModalProps {
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRetry, onMainMenu }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden animate-fade-in">
      <div className="absolute inset-0 horror-panic-vignette opacity-80 pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      <div className="relative z-10 max-w-lg space-y-6">
        <div className="inline-flex p-4 rounded-full bg-red-950/60 border border-red-800/80 mb-2">
          <Skull className="w-12 h-12 text-red-600 animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-cinzel text-red-600 tracking-wider glitch-text">
          YOU DID NOT SURVIVE
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
          Subject 99 overwhelmed you in the darkness. Your screams faded into the storm raging outside Saint Jude.
        </p>

        <div className="p-4 rounded-xl bg-neutral-950/80 border border-red-950 text-xs font-mono text-neutral-400 italic">
          "Survivor Tip: Crouch behind beds or enter lockers to completely break line of sight. Never sprint unless fleeing directly toward an exit."
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-red-950/80 flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>RETRY CHECKPOINT</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
