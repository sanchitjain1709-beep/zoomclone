'use client';

import React from 'react';

interface EndModalProps {
  isOpen: boolean;
  isHost: boolean;
  onClose: () => void;
  onLeave: () => void;
  onEndAll: () => void;
}

export default function EndModal({
  isOpen,
  isHost,
  onClose,
  onLeave,
  onEndAll,
}: EndModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 bg-black/30 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#1F2228] border border-gray-700/80 rounded-2xl p-4 shadow-2xl w-64 space-y-2 mb-16 text-center select-none animate-in slide-in-from-bottom-5">
        {isHost && (
          <button
            onClick={onEndAll}
            className="w-full py-2.5 bg-[#E02828] hover:bg-[#C52222] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            End meeting for all
          </button>
        )}

        <button
          onClick={onLeave}
          className="w-full py-2.5 bg-[#2E323B] hover:bg-[#3D424E] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Leave meeting
        </button>

        <button
          onClick={onClose}
          className="w-full py-1 text-xs text-gray-400 hover:text-white font-medium transition-colors cursor-pointer pt-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
