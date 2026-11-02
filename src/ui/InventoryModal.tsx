import React, { useState } from 'react';
import { X, Key, FileText, Battery, Radio, ShieldAlert } from 'lucide-react';
import { InventoryItem } from '../types/game';

interface InventoryModalProps {
  items: InventoryItem[];
  onClose: () => void;
  onUseItem?: (itemId: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  items,
  onClose,
  onUseItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(
    items.length > 0 ? items[0] : null
  );

  const getIcon = (category: string) => {
    switch (category) {
      case 'key':
        return <Key className="w-5 h-5 text-amber-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-amber-200" />;
      case 'battery':
        return <Battery className="w-5 h-5 text-blue-400" />;
      case 'tape':
        return <Radio className="w-5 h-5 text-red-400" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-2xl w-full h-[80vh] max-h-[580px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div>
            <h2 className="text-lg font-bold font-cinzel text-neutral-100 tracking-wider">
              INVESTIGATOR DOSSIER
            </h2>
            <p className="text-xs text-neutral-400">Inventory & Collected Evidence</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 overflow-hidden">
          {/* Item Grid List */}
          <div className="p-4 overflow-y-auto space-y-2.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <ShieldAlert className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-medium">No items in your possession.</p>
                <p className="text-xs mt-1">Search the ward rooms, desks, and shelves.</p>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                    selectedItem?.id === item.id
                      ? 'bg-amber-950/40 border-amber-600/70 text-white shadow-lg'
                      : 'bg-neutral-950/50 border-neutral-800 text-neutral-300 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    {getIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate">{item.name}</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                      {item.category}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Details / Document Reader */}
          <div className="p-6 overflow-y-auto flex flex-col justify-between bg-neutral-950/20">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    {getIcon(selectedItem.category)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-100 font-cinzel">
                      {selectedItem.name}
                    </h3>
                    <span className="text-xs font-mono text-amber-500 uppercase">
                      {selectedItem.category}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-3">
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {selectedItem.description}
                  </p>
                </div>

                {/* If document/note, display full handwritten letter format */}
                {selectedItem.content && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-100/90 font-mono text-xs leading-relaxed shadow-inner">
                    <p className="whitespace-pre-line">{selectedItem.content}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
                Select an item to inspect details.
              </div>
            )}

            {selectedItem && selectedItem.category === 'battery' && onUseItem && (
              <button
                onClick={() => onUseItem(selectedItem.id)}
                className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-colors"
              >
                Insert into Flashlight (+50%)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
