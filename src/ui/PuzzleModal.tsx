import React, { useState } from 'react';
import { X, Zap, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { sound } from '../audio/SoundEngine';

interface PuzzleModalProps {
  puzzleType: 'breaker' | 'keypad';
  puzzleData: any;
  onSolve: (type: 'breaker' | 'keypad') => void;
  onClose: () => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzleType,
  puzzleData,
  onSolve,
  onClose,
}) => {
  // Breaker Switch State (4 switches)
  const [switches, setSwitches] = useState<boolean[]>([false, false, false, false]);
  const [breakerSolved, setBreakerSolved] = useState<boolean>(false);

  // Keypad State
  const [code, setCode] = useState<string>('');
  const [keypadError, setKeypadError] = useState<boolean>(false);
  const [keypadSuccess, setKeypadSuccess] = useState<boolean>(false);

  // --- BREAKER LOGIC ---
  const toggleSwitch = (index: number) => {
    if (breakerSolved) return;
    sound.playBreakerSwitch();
    const updated = [...switches];
    updated[index] = !updated[index];
    setSwitches(updated);

    // Target solution: [true, false, true, true]
    if (updated[0] === true && updated[1] === false && updated[2] === true && updated[3] === true) {
      setBreakerSolved(true);
      setTimeout(() => {
        onSolve('breaker');
      }, 1200);
    }
  };

  // --- KEYPAD LOGIC ---
  const handleDigit = (digit: string) => {
    if (code.length < 4 && !keypadSuccess) {
      sound.playFlashlightClick(true);
      setCode((prev) => prev + digit);
      setKeypadError(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setKeypadError(false);
    sound.playFlashlightClick(false);
  };

  const handleEnter = () => {
    if (code === '4812') {
      setKeypadSuccess(true);
      sound.playDoorCreak(true);
      setTimeout(() => {
        onSolve('keypad');
      }, 1200);
    } else {
      setKeypadError(true);
      sound.playDoorLocked();
      if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
      setTimeout(() => {
        setCode('');
      }, 600);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- BREAKER PUZZLE --- */}
        {puzzleType === 'breaker' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-amber-500 mb-1">
                <Zap className="w-5 h-5" />
                <span className="text-xs uppercase font-mono font-bold tracking-widest">
                  HIGH VOLTAGE SUB-PANEL
                </span>
              </div>
              <h2 className="text-lg font-bold font-cinzel text-neutral-100">
                AUXILIARY CIRCUIT REWIRING
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Balance the load to 480V to energize the Sub-Basement Morgue magnetic lock.
              </p>
            </div>

            {/* Voltage Gauge */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-400">
                  SYSTEM VOLTAGE
                </span>
                <p className="text-2xl font-mono font-bold text-neutral-100">
                  {breakerSolved
                    ? '480 VAC'
                    : `${120 + switches.filter(Boolean).length * 90} VAC`}
                </p>
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center space-x-1.5 ${
                  breakerSolved
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 animate-pulse'
                    : 'bg-red-950/60 border-red-700 text-red-400'
                }`}
              >
                {breakerSolved ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{breakerSolved ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
            </div>

            {/* 4 Heavy Industrial Switches */}
            <div className="grid grid-cols-4 gap-3">
              {['BUS 1', 'BUS 2', 'BUS 3', 'BUS 4'].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleSwitch(idx)}
                  className={`py-6 rounded-xl border flex flex-col items-center justify-between transition-all active:scale-95 ${
                    switches[idx]
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/40'
                      : 'bg-neutral-950/80 border-neutral-800 text-neutral-500'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">{label}</span>
                  <div
                    className={`w-4 h-8 rounded-full border transition-all my-2 ${
                      switches[idx]
                        ? 'bg-amber-500 border-amber-300'
                        : 'bg-neutral-800 border-neutral-700'
                    }`}
                  />
                  <span className="text-[9px] font-mono font-bold uppercase">
                    {switches[idx] ? 'CLOSED' : 'OPEN'}
                  </span>
                </button>
              ))}
            </div>

            {breakerSolved && (
              <p className="text-center text-xs font-mono text-emerald-400 animate-bounce">
                Power Restored! Magnetic doors unlocked.
              </p>
            )}
          </div>
        )}

        {/* --- KEYPAD PUZZLE --- */}
        {puzzleType === 'keypad' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                <Lock className="w-5 h-5" />
                <span className="text-xs uppercase font-mono font-bold tracking-widest">
                  SECURITY TERMINAL
                </span>
              </div>
              <h2 className="text-lg font-bold font-cinzel text-neutral-100">
                PHARMACY ACCESS KEYPAD
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter the 4-digit security code from the medical memos.
              </p>
            </div>

            {/* Display screen */}
            <div
              className={`p-4 rounded-xl border font-mono text-center tracking-[0.5em] text-3xl font-bold transition-all ${
                keypadSuccess
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                  : keypadError
                  ? 'bg-red-950/60 border-red-500 text-red-400 animate-shake'
                  : 'bg-neutral-950 border-neutral-800 text-cyan-400'
              }`}
            >
              {keypadSuccess
                ? 'GRANTED'
                : keypadError
                ? 'DENIED'
                : code.padEnd(4, '_')}
            </div>

            {/* Numeric Buttons Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDigit(num)}
                  className="py-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-100 text-lg font-mono font-bold hover:bg-neutral-800 active:scale-95 transition-all shadow"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="py-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 text-xs font-mono font-bold hover:bg-red-900/60 active:scale-95 transition-all"
              >
                CLR
              </button>
              <button
                onClick={() => handleDigit('0')}
                className="py-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-100 text-lg font-mono font-bold hover:bg-neutral-800 active:scale-95 transition-all shadow"
              >
                0
              </button>
              <button
                onClick={handleEnter}
                className="py-3.5 rounded-xl bg-emerald-950/60 border border-emerald-600/70 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-900/60 active:scale-95 transition-all shadow"
              >
                ENT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
