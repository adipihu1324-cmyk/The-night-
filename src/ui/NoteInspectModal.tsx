import React from 'react';
import { X, FileText, Check } from 'lucide-react';

interface NoteInspectModalProps {
  noteData: {
    title: string;
    text: string;
  };
  onClose: () => void;
}

export const NoteInspectModal: React.FC<NoteInspectModalProps> = ({ noteData, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-amber-100/90 text-neutral-900 border-2 border-amber-950/60 rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative flex flex-col space-y-4 font-mono">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/10 hover:bg-neutral-900/20 text-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 border-b border-amber-950/30 pb-2">
          <FileText className="w-5 h-5 text-amber-900" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-amber-950">
            {noteData.title}
          </h2>
        </div>

        <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-neutral-800 italic font-serif py-2">
          "{noteData.text}"
        </div>

        <div className="pt-3 border-t border-amber-950/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs uppercase font-bold tracking-wider flex items-center space-x-2 shadow transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Store in Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
