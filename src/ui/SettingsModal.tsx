import React, { useState } from 'react';
import { X, Sliders, Monitor, Volume2, Gamepad2 } from 'lucide-react';
import { AudioSettings, ControlSettings, GraphicsPreset, GraphicsSettings } from '../types/game';

interface SettingsModalProps {
  graphics: GraphicsSettings;
  controls: ControlSettings;
  audio: AudioSettings;
  onUpdateGraphics: (settings: GraphicsSettings) => void;
  onUpdateControls: (settings: ControlSettings) => void;
  onUpdateAudio: (settings: AudioSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  graphics,
  controls,
  audio,
  onUpdateGraphics,
  onUpdateControls,
  onUpdateAudio,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'graphics' | 'controls' | 'audio'>('graphics');

  const setPreset = (preset: GraphicsPreset) => {
    switch (preset) {
      case 'low':
        onUpdateGraphics({
          preset: 'low',
          fpsCap: 30,
          shadows: false,
          renderScale: 0.8,
          filmGrain: false,
          vignette: true,
          particles: false,
        });
        break;
      case 'medium':
        onUpdateGraphics({
          preset: 'medium',
          fpsCap: 60,
          shadows: false,
          renderScale: 1.0,
          filmGrain: true,
          vignette: true,
          particles: true,
        });
        break;
      case 'high':
        onUpdateGraphics({
          preset: 'high',
          fpsCap: 60,
          shadows: true,
          renderScale: 1.0,
          filmGrain: true,
          vignette: true,
          particles: true,
        });
        break;
      case 'ultra':
        onUpdateGraphics({
          preset: 'ultra',
          fpsCap: 60,
          shadows: true,
          renderScale: 1.25,
          filmGrain: true,
          vignette: true,
          particles: true,
        });
        break;
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold font-cinzel text-neutral-100">SYSTEM SETTINGS</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 my-4 space-x-2">
          <button
            onClick={() => setActiveTab('graphics')}
            className={`pb-2.5 px-4 text-xs font-bold font-mono uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'graphics'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Graphics</span>
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`pb-2.5 px-4 text-xs font-bold font-mono uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'controls'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Controls</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-2.5 px-4 text-xs font-bold font-mono uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'audio'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Audio</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* GRAPHICS TAB */}
          {activeTab === 'graphics' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs uppercase font-mono text-neutral-400 block mb-2 font-bold">
                  Graphics Quality Preset
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'ultra'] as GraphicsPreset[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPreset(p)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono uppercase border transition-all ${
                        graphics.preset === p
                          ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-mono text-neutral-400 block mb-2 font-bold">
                  Target Frame Rate (FPS)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[30, 60].map((fps) => (
                    <button
                      key={fps}
                      onClick={() => onUpdateGraphics({ ...graphics, fpsCap: fps as 30 | 60 })}
                      className={`py-2 rounded-xl text-xs font-bold font-mono border transition-all ${
                        graphics.fpsCap === fps
                          ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {fps} FPS {fps === 30 ? '(Battery Saver)' : '(Maximum Smoothness)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="text-xs font-mono text-neutral-300">Dynamic Shadows</span>
                  <input
                    type="checkbox"
                    checked={graphics.shadows}
                    onChange={(e) =>
                      onUpdateGraphics({ ...graphics, shadows: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="text-xs font-mono text-neutral-300">Horror Film Grain</span>
                  <input
                    type="checkbox"
                    checked={graphics.filmGrain}
                    onChange={(e) =>
                      onUpdateGraphics({ ...graphics, filmGrain: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="text-xs font-mono text-neutral-300">Rain Particles</span>
                  <input
                    type="checkbox"
                    checked={graphics.particles}
                    onChange={(e) =>
                      onUpdateGraphics({ ...graphics, particles: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CONTROLS TAB */}
          {activeTab === 'controls' && (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400 font-bold">
                    Touch Look Sensitivity
                  </label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {controls.touchSensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={controls.touchSensitivity}
                  onChange={(e) =>
                    onUpdateControls({
                      ...controls,
                      touchSensitivity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="text-xs font-mono text-neutral-300">Invert Camera Y-Axis</span>
                  <input
                    type="checkbox"
                    checked={controls.invertY}
                    onChange={(e) =>
                      onUpdateControls({ ...controls, invertY: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <div>
                    <span className="text-xs font-mono text-neutral-300 block">
                      Haptic Vibration
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Vibrates on phone when creature lurks nearby or stalks you
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={controls.hapticsEnabled}
                    onChange={(e) =>
                      onUpdateControls({ ...controls, hapticsEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400 font-bold">
                    Master Volume
                  </label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {Math.round(audio.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audio.masterVolume}
                  onChange={(e) =>
                    onUpdateAudio({ ...audio, masterVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400 font-bold">
                    Sound Effects & Horror Stingers
                  </label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {Math.round(audio.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audio.sfxVolume}
                  onChange={(e) =>
                    onUpdateAudio({ ...audio, sfxVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400 font-bold">
                    Dark Ambience & Synthesizer Drones
                  </label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {Math.round(audio.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audio.musicVolume}
                  onChange={(e) =>
                    onUpdateAudio({ ...audio, musicVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer save/done */}
        <div className="pt-4 mt-2 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
