import React from 'react';
import { Heart, Battery, Zap, EyeOff } from 'lucide-react';
import { GraphicsSettings, Objective, PlayerStats } from '../types/game';

interface HUDProps {
  playerStats: PlayerStats;
  currentObjective: Objective;
  monsterDistance: number;
  toastMessage: string | null;
  graphicsSettings: GraphicsSettings;
}

export const HUD: React.FC<HUDProps> = ({
  playerStats,
  currentObjective,
  monsterDistance,
  toastMessage,
  graphicsSettings,
}) => {
  // Panic level 0 to 1 based on sanity & monster proximity
  const proximityFactor = Math.max(0, 1 - monsterDistance / 16);
  const panicLevel = Math.max((100 - playerStats.sanity) / 100, proximityFactor);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden">
      {/* 1. Horror Screen Vignette */}
      {graphicsSettings.vignette && <div className="absolute inset-0 horror-vignette" />}

      {/* 2. Panic Blood Vignette (Intensifies as monster nears) */}
      <div
        className="absolute inset-0 horror-panic-vignette transition-opacity duration-300"
        style={{ opacity: panicLevel * 0.85 }}
      />

      {/* 3. Film Grain Overlay */}
      {graphicsSettings.filmGrain && <div className="absolute inset-0 noise-overlay" />}

      {/* 4. Top-Left: Sanity & Health Bars */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2">
        {/* Sanity Heart */}
        <div className="flex items-center space-x-2 bg-neutral-950/70 border border-neutral-800/80 px-3 py-1.5 rounded-xl shadow-lg">
          <Heart
            className={`w-4 h-4 ${
              panicLevel > 0.4 ? 'text-red-500 fill-red-500' : 'text-neutral-400'
            }`}
          />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
              SANITY
            </span>
            <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all duration-300 ${
                  playerStats.sanity > 50
                    ? 'bg-emerald-500'
                    : playerStats.sanity > 25
                    ? 'bg-amber-500'
                    : 'bg-red-600'
                }`}
                style={{ width: `${playerStats.sanity}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hiding Indicator */}
        {playerStats.isHiding && (
          <div className="flex items-center space-x-2 bg-blue-950/90 border border-blue-500/80 px-3 py-1.5 rounded-xl text-blue-200 text-xs font-bold animate-pulse">
            <EyeOff className="w-4 h-4 text-blue-400" />
            <span>CONCEALED (IN LOCKER)</span>
          </div>
        )}
      </div>

      {/* 5. Top-Right: Stamina & Flashlight Gauges */}
      <div className="absolute top-16 right-4 flex flex-col items-end space-y-2">
        {/* Flashlight Battery */}
        <div className="flex items-center space-x-2 bg-neutral-950/70 border border-neutral-800/80 px-3 py-1.5 rounded-xl shadow-lg">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
              BATTERY
            </span>
            <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all duration-300 ${
                  playerStats.battery > 40
                    ? 'bg-amber-400'
                    : playerStats.battery > 15
                    ? 'bg-amber-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${playerStats.battery}%` }}
              />
            </div>
          </div>
          <Battery className="w-4 h-4 text-amber-400" />
        </div>

        {/* Stamina Meter */}
        <div className="flex items-center space-x-2 bg-neutral-950/70 border border-neutral-800/80 px-3 py-1.5 rounded-xl shadow-lg">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
              STAMINA
            </span>
            <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-cyan-500 transition-all duration-150"
                style={{ width: `${playerStats.stamina}%` }}
              />
            </div>
          </div>
          <Zap className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      {/* 6. Top-Center: Current Objective Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center max-w-sm w-full px-4 text-center">
        <div className="bg-neutral-950/85 border border-neutral-800 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-sm">
          <span className="text-[9px] uppercase tracking-widest text-amber-500 font-bold">
            CURRENT OBJECTIVE
          </span>
          <p className="text-xs text-neutral-200 font-medium tracking-wide mt-0.5">
            {currentObjective.title}
          </p>
        </div>
      </div>

      {/* 7. Subtle Center Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />

      {/* 8. Bottom Narrative/Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-md w-full px-4 text-center animate-fade-in pointer-events-none">
          <div className="bg-neutral-900/90 border border-amber-600/60 px-5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md">
            <p className="text-sm font-medium text-amber-200">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
