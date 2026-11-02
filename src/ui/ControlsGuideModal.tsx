import React from 'react';
import { X, Smartphone, Keyboard, Eye, Zap, Shield, Volume2 } from 'lucide-react';

interface ControlsGuideModalProps {
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold font-cinzel text-neutral-100">SURVIVAL GUIDE</h2>
            <p className="text-xs text-neutral-400">Controls & Evasion Mechanics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-5 my-4 pr-1">
          {/* Mobile Controls */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs font-bold uppercase mb-3">
              <Smartphone className="w-4 h-4" />
              <span>Android Smartphone Touchscreen Controls</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-neutral-300">
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="font-bold text-neutral-100 block mb-0.5">Left Touch Area</span>
                <p className="text-neutral-400">Virtual analog joystick for walking & strafing</p>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="font-bold text-neutral-100 block mb-0.5">Right Touch Area</span>
                <p className="text-neutral-400">Swipe to look around, pitch and yaw camera</p>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="font-bold text-neutral-100 block mb-0.5">Bottom Right Buttons</span>
                <p className="text-neutral-400">Flashlight, Crouch, Hold to RUN (Sprint)</p>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="font-bold text-neutral-100 block mb-0.5">Contextual Interact</span>
                <p className="text-neutral-400">Pops up when near doors, keys, lockers, notes</p>
              </div>
            </div>
          </div>

          {/* PC Keyboard & Mouse fallback */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-3">
              <Keyboard className="w-4 h-4" />
              <span>Desktop / PC Keyboard & Mouse Controls</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-amber-400 font-bold block">W A S D</span>
                <span className="text-[10px] text-neutral-400">Move</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-amber-400 font-bold block">SHIFT</span>
                <span className="text-[10px] text-neutral-400">Sprint</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-amber-400 font-bold block">C</span>
                <span className="text-[10px] text-neutral-400">Crouch</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-amber-400 font-bold block">F</span>
                <span className="text-[10px] text-neutral-400">Flashlight</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-amber-400 font-bold block">E</span>
                <span className="text-[10px] text-neutral-400">Interact</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-amber-400 font-bold block">TAB</span>
                <span className="text-[10px] text-neutral-400">Inventory</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-amber-400 font-bold block">ESC</span>
                <span className="text-[10px] text-neutral-400">Pause</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-center">
                <span className="text-amber-400 font-bold block">MOUSE</span>
                <span className="text-[10px] text-neutral-400">Look</span>
              </div>
            </div>
          </div>

          {/* Survival Mechanics */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2 text-xs text-neutral-300">
            <h4 className="font-bold text-amber-300 font-cinzel">RULES OF ENGAGEMENT</h4>
            <ul className="list-disc list-inside space-y-1.5 text-neutral-400">
              <li>
                <strong className="text-neutral-200">Noise Alert:</strong> Sprinting makes loud footsteps that attract Patient 99 from down the hall. Crouch to move silently.
              </li>
              <li>
                <strong className="text-neutral-200">Light Sensation:</strong> Shinning the flashlight beam directly into the creature will instantly provoke a terrifying chase.
              </li>
              <li>
                <strong className="text-neutral-200">Hiding Spots:</strong> You cannot outrun the creature forever. Jump inside steel lockers to break line of sight and wait for it to pass.
              </li>
              <li>
                <strong className="text-neutral-200">Battery Preservation:</strong> Search desks and rooms for blue 9V batteries to keep your flashlight alive.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
