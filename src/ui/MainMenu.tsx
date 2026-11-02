import React, { useState } from 'react';
import { Play, RotateCcw, BookOpen, Settings, Info, Skull, Volume2, Shield } from 'lucide-react';
import { ChapterInfo } from '../types/game';

interface MainMenuProps {
  hasSaveGame: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onOpenSettings: () => void;
  onOpenChapters: () => void;
  onOpenControls: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSaveGame,
  onNewGame,
  onContinue,
  onOpenSettings,
  onOpenChapters,
  onOpenControls,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-6 md:p-12 select-none overflow-hidden bg-neutral-950/80">
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 horror-vignette pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none opacity-40" />

      {/* Top Header / Studio Brand */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono tracking-widest uppercase">
          <Skull className="w-4 h-4 text-red-600" />
          <span>SAINT JUDE SANATORIUM ARCHIVE • 1987</span>
        </div>
        <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
          v1.2.0 • ANDROID & PC
        </div>
      </div>

      {/* Title & Core Menu */}
      <div className="max-w-xl z-10 space-y-8 my-auto">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-7xl font-extrabold font-cinzel tracking-tight text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] glitch-text">
            THE LAST NIGHT
          </h1>
          <p className="text-sm sm:text-base text-red-500/90 font-mono tracking-widest uppercase font-semibold">
            First-Person Psychological Horror & Survival
          </p>
          <p className="text-xs text-neutral-400 max-w-md font-sans leading-relaxed">
            Trapped inside the locked Ward 4 of Saint Jude Sanatorium during a blackout storm.
            Something is stalking you in the dark. Silence is your only weapon.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 max-w-xs">
          {hasSaveGame && (
            <button
              onClick={onContinue}
              className="py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm tracking-wider uppercase flex items-center space-x-3 shadow-lg shadow-amber-950/50 transition-all active:scale-95"
            >
              <RotateCcw className="w-5 h-5 text-amber-200" />
              <span>CONTINUE</span>
            </button>
          )}

          <button
            onClick={onNewGame}
            className="py-3.5 px-6 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-sm tracking-wider uppercase flex items-center space-x-3 shadow-xl transition-all active:scale-95"
          >
            <Play className="w-5 h-5 text-neutral-900 fill-neutral-900" />
            <span>NEW GAME</span>
          </button>

          <button
            onClick={onOpenChapters}
            className="py-3 px-6 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/70 text-neutral-200 font-semibold text-xs tracking-wider uppercase flex items-center space-x-3 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-neutral-400" />
            <span>CHAPTERS</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="py-3 px-6 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/70 text-neutral-200 font-semibold text-xs tracking-wider uppercase flex items-center space-x-3 transition-all active:scale-95"
          >
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={onOpenControls}
            className="py-3 px-6 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/70 text-neutral-200 font-semibold text-xs tracking-wider uppercase flex items-center space-x-3 transition-all active:scale-95"
          >
            <Info className="w-4 h-4 text-neutral-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>

      {/* Footer Instructions / Audio prompt */}
      <div className="z-10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 font-mono pt-4 border-t border-neutral-800/80">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-amber-500" />
          <span>Headphones recommended for spatial 3D audio binaural horror.</span>
        </div>
        <div className="mt-2 sm:mt-0 text-neutral-600">
          Touch Joystick on Mobile • WASD & Mouse on Desktop
        </div>
      </div>
    </div>
  );
};
