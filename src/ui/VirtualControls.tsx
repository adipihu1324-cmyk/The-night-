import React, { useRef, useEffect } from 'react';
import { Flashlight, ShieldAlert, Zap, Hand, Package, Pause, ArrowDown } from 'lucide-react';
import { ControlSettings, InteractiveTarget, PlayerStats } from '../types/game';

interface VirtualControlsProps {
  playerStats: PlayerStats;
  activeInteractive: InteractiveTarget | null;
  settings: ControlSettings;
  onMoveInput: (x: number, y: number) => void;
  onLookInput: (deltaYaw: number, deltaPitch: number) => void;
  onFlashlightToggle: () => void;
  onCrouchToggle: () => void;
  onSprintToggle: (sprint: boolean) => void;
  onInteract: () => void;
  onOpenInventory: () => void;
  onPause: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  playerStats,
  activeInteractive,
  settings,
  onMoveInput,
  onLookInput,
  onFlashlightToggle,
  onCrouchToggle,
  onSprintToggle,
  onInteract,
  onOpenInventory,
  onPause,
}) => {
  // Joystick refs
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickStickRef = useRef<HTMLDivElement>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera look drag refs
  const lookTouchIdRef = useRef<number | null>(null);
  const lookLastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Right-side touch drag for camera rotation
  const handleTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const screenWidth = window.innerWidth;

      // Left 45% of screen reserved for joystick if not already active
      if (touch.clientX < screenWidth * 0.45 && joystickTouchIdRef.current === null) {
        joystickTouchIdRef.current = touch.identifier;
        if (joystickBaseRef.current) {
          const rect = joystickBaseRef.current.getBoundingClientRect();
          joystickCenterRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
          updateJoystick(touch.clientX, touch.clientY);
        }
      }
      // Right 55% of screen for camera look rotation
      else if (touch.clientX >= screenWidth * 0.45 && lookTouchIdRef.current === null) {
        lookTouchIdRef.current = touch.identifier;
        lookLastPosRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Handle Joystick Move
      if (touch.identifier === joystickTouchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
      }

      // Handle Camera Look Move
      if (touch.identifier === lookTouchIdRef.current) {
        const deltaX = (touch.clientX - lookLastPosRef.current.x) * 0.003 * settings.touchSensitivity;
        const deltaY = (touch.clientY - lookLastPosRef.current.y) * 0.003 * settings.touchSensitivity;

        onLookInput(deltaX, deltaY);
        lookLastPosRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        onMoveInput(0, 0);
        if (joystickStickRef.current) {
          joystickStickRef.current.style.transform = `translate(0px, 0px)`;
        }
      }

      if (touch.identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    const center = joystickCenterRef.current;
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    const maxRadius = 45;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;

    if (joystickStickRef.current) {
      joystickStickRef.current.style.transform = `translate(${stickX}px, ${stickY}px)`;
    }

    // Normalized input (-1 to 1)
    const normX = stickX / maxRadius;
    const normY = -(stickY / maxRadius); // Invert Y so up is forward
    onMoveInput(normX, normY);
  };

  return (
    <div
      className="absolute inset-0 pointer-events-auto touch-none select-none z-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Top Bar Quick Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-3 pointer-events-auto z-30">
        <button
          onClick={onOpenInventory}
          className="w-11 h-11 rounded-xl bg-neutral-900/80 border border-neutral-700/60 text-neutral-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Inventory"
        >
          <Package className="w-5 h-5 text-amber-400" />
        </button>

        <button
          onClick={onPause}
          className="w-11 h-11 rounded-xl bg-neutral-900/80 border border-neutral-700/60 text-neutral-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Pause Menu"
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>

      {/* Virtual Joystick (Bottom Left) */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div
          ref={joystickBaseRef}
          className="w-32 h-32 rounded-full border-2 border-neutral-700/50 bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center relative shadow-inner"
        >
          <div
            ref={joystickStickRef}
            className="w-14 h-14 rounded-full bg-gradient-to-b from-neutral-600 to-neutral-800 border border-neutral-500/60 shadow-lg pointer-events-none transition-transform duration-75"
          />
        </div>
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-4 pointer-events-auto">
        {/* Contextual Interact Button (Large when near object) */}
        {activeInteractive && (
          <button
            onClick={onInteract}
            className="px-6 py-3.5 rounded-2xl bg-amber-600/90 border border-amber-400/80 text-white font-bold text-sm tracking-wide shadow-2xl flex items-center space-x-2.5 active:scale-90 transition-transform animate-bounce mb-2"
          >
            <Hand className="w-5 h-5 text-amber-200" />
            <span>{activeInteractive.actionText}</span>
          </button>
        )}

        <div className="flex items-center space-x-3">
          {/* Flashlight Toggle Button */}
          <button
            onClick={onFlashlightToggle}
            className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all ${
              playerStats.flashlightOn
                ? 'bg-amber-500/80 border-amber-300 text-neutral-950'
                : 'bg-neutral-900/80 border-neutral-700 text-neutral-400'
            }`}
            aria-label="Flashlight"
          >
            <Flashlight className="w-6 h-6" />
            <span className="text-[10px] font-mono font-bold mt-0.5">
              {Math.round(playerStats.battery)}%
            </span>
          </button>

          {/* Crouch Button */}
          <button
            onClick={onCrouchToggle}
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-xl active:scale-95 transition-all ${
              playerStats.isCrouching
                ? 'bg-blue-600/80 border-blue-400 text-white'
                : 'bg-neutral-900/80 border-neutral-700 text-neutral-400'
            }`}
            aria-label="Crouch"
          >
            <ArrowDown className="w-6 h-6" />
          </button>

          {/* Sprint Hold Button */}
          <button
            onTouchStart={() => onSprintToggle(true)}
            onTouchEnd={() => onSprintToggle(false)}
            onMouseDown={() => onSprintToggle(true)}
            onMouseUp={() => onSprintToggle(false)}
            className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all ${
              playerStats.isSprinting
                ? 'bg-red-600/90 border-red-400 text-white shadow-red-950/60'
                : 'bg-neutral-900/80 border-neutral-700 text-neutral-300'
            }`}
            aria-label="Sprint"
          >
            <Zap className="w-6 h-6" />
            <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">RUN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
