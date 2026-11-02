import React from 'react';
import { Trophy, CheckCircle2, RotateCcw, Home, ArrowRight, ShieldCheck } from 'lucide-react';

interface EndingModalProps {
  timeSurvivedSeconds: number;
  itemsFoundCount: number;
  sanityRemaining: number;
  onReplay: () => void;
  onMainMenu: () => void;
}

export const EndingModal: React.FC<EndingModalProps> = ({
  timeSurvivedSeconds,
  itemsFoundCount,
  sanityRemaining,
  onReplay,
  onMainMenu,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}m ${rem < 10 ? '0' : ''}${rem}s`;
  };

  return (
    <div className="absolute inset-0 z-50 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden animate-fade-in">
      <div className="absolute inset-0 horror-vignette opacity-90 pointer-events-none" />

      <div className="relative z-10 max-w-xl space-y-6">
        <div className="inline-flex p-4 rounded-full bg-emerald-950/60 border border-emerald-600/60 mb-1">
          <Trophy className="w-10 h-10 text-emerald-400" />
        </div>

        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold block mb-1">
            NIGHTMARE SURVIVED • CHAPTER 1 COMPLETE
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-cinzel text-white tracking-wide">
            ESCAPE INTO THE RAIN
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed max-w-lg mx-auto">
          The ambulance engine roared to life. You slammed through the padlocked perimeter gates,
          swerving into the rain-drenched mountain pass. In your rearview mirror,
          the gaunt silhouette of Subject 99 stood atop the sanatorium fire escape, silently watching you escape.
        </p>

        {/* Survival Stats Card */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-left">
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-[10px] uppercase font-mono text-neutral-400">ESCAPE TIME</span>
            <p className="text-lg font-mono font-bold text-neutral-100 mt-0.5">
              {formatTime(timeSurvivedSeconds)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-[10px] uppercase font-mono text-neutral-400">EVIDENCE</span>
            <p className="text-lg font-mono font-bold text-amber-400 mt-0.5">
              {itemsFoundCount} / 6
            </p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-[10px] uppercase font-mono text-neutral-400">SANITY</span>
            <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
              {Math.round(sanityRemaining)}%
            </p>
          </div>
        </div>

        {/* Chapter 2 teaser */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-left flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">NEXT CHAPTER UNLOCKED</span>
            <h3 className="text-sm font-bold text-neutral-100">Chapter 2: The Blackwood Cabin & Forests</h3>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onReplay}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-amber-950/50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
