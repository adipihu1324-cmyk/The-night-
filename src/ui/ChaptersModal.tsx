import React from 'react';
import { X, Lock, Play, ShieldAlert, MapPin } from 'lucide-react';
import { ChapterInfo } from '../types/game';

interface ChaptersModalProps {
  onSelectChapter: (chapterId: number) => void;
  onClose: () => void;
}

const CHAPTERS: ChapterInfo[] = [
  {
    id: 1,
    title: 'CHAPTER 1: SAINT JUDE SANATORIUM',
    subtitle: 'Ward 4 & The Sub-Basement Morgue',
    description:
      'Explore the abandoned psychiatric hospital during a raging midnight thunderstorm. Evade Patient 99, restore auxiliary electrical power, unlock the morgue, and locate the ambulance ignition keys to escape.',
    status: 'available',
    difficulty: 'Normal',
    location: 'Saint Jude Memorial Hospital, Ward 4',
  },
  {
    id: 2,
    title: 'CHAPTER 2: THE BLACKWOOD FOREST',
    subtitle: 'The Ranger Station & Deep Pines',
    description:
      'Following your ambulance escape, the vehicle runs dry in the misty Blackwood Ridge. Hunted through the towering pines by ancient forest entities. Navigate by acoustic sound beacons.',
    status: 'locked',
    difficulty: 'Hard',
    location: 'Blackwood National Forest, Sector 7',
  },
  {
    id: 3,
    title: 'CHAPTER 3: THE SUBMERGED ASYLUM',
    subtitle: 'Subterranean Research Complex',
    description:
      'Descend beneath the flooded drainage tunnels into the secret Cold War experimental wing where Patient 99 was engineered. The ultimate survival trial.',
    status: 'locked',
    difficulty: 'Nightmare',
    location: 'Sub-Level 5 Deep Isolation Vaults',
  },
];

export const ChaptersModal: React.FC<ChaptersModalProps> = ({ onSelectChapter, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold font-cinzel text-neutral-100">STORY CHAPTERS</h2>
            <p className="text-xs text-neutral-400">Select an unlocked nightmare campaign</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
          {CHAPTERS.map((ch) => (
            <div
              key={ch.id}
              className={`p-5 rounded-2xl border transition-all ${
                ch.status === 'available'
                  ? 'bg-neutral-950/80 border-amber-600/60 shadow-lg'
                  : 'bg-neutral-950/30 border-neutral-800/60 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-500">
                    {ch.status === 'available' ? 'PLAYABLE NOW' : 'COMING SOON'}
                  </span>
                  <h3 className="text-base font-bold font-cinzel text-neutral-100">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">{ch.subtitle}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-[10px] font-mono text-neutral-300 font-bold uppercase">
                    {ch.difficulty}
                  </span>
                  {ch.status === 'available' ? (
                    <button
                      onClick={() => onSelectChapter(ch.id)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow transition-colors"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>START</span>
                    </button>
                  ) : (
                    <div className="p-2 rounded-xl bg-neutral-800 text-neutral-500 flex items-center">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed font-sans">{ch.description}</p>

              <div className="mt-3 pt-3 border-t border-neutral-900 flex items-center space-x-2 text-[11px] font-mono text-neutral-500">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{ch.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
