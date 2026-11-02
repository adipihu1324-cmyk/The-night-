import React from 'react';
import { Play, Settings, RotateCcw, Home, Package } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenInventory,
  onOpenSettings,
  onRestart,
  onQuit,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4">
        <div className="text-center pb-2 border-b border-neutral-800">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold">
            GAME PAUSED
          </span>
          <h2 className="text-2xl font-bold font-cinzel text-neutral-100">THE LAST NIGHT</h2>
        </div>

        <div className="flex flex-col space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME GAME</span>
          </button>

          <button
            onClick={onOpenInventory}
            className="w-full py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>INVENTORY & NOTES</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-neutral-400" />
            <span>RESTART CHAPTER</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full py-3 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>QUIT TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
