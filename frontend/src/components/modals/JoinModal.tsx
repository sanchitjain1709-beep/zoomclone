'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { validateMeetingCode } from '@/services/api';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
}

export default function JoinModal({ isOpen, onClose, defaultName = 'Sanchit Jain' }: JoinModalProps) {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState('');
  const [displayName, setDisplayName] = useState(defaultName);
  const [alwaysBrowser, setAlwaysBrowser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingInput.trim()) {
      setError('Please enter a valid Meeting ID or link.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await validateMeetingCode(meetingInput);
      if (!res.exists || !res.meeting) {
        setError(res.message || 'Meeting ID not found. Please verify and try again.');
        setLoading(false);
        return;
      }

      // Extract clean code without spaces
      const cleanCode = res.meeting.meeting_code.replace(/\s+/g, '');
      const encodedName = encodeURIComponent(displayName.trim() || 'Guest');
      router.push(`/lobby/${cleanCode}?name=${encodedName}`);
      onClose();
    } catch (err: any) {
      setError('Could not connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Heading matching Screenshot 165132.png */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Join Meeting</h2>
          <p className="text-xs text-gray-500 mt-1">
            Enter the 10-digit Meeting ID or invite URL
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Meeting ID or Personal Link Name
            </label>
            <input
              type="text"
              value={meetingInput}
              onChange={(e) => {
                setMeetingInput(e.target.value);
                setError(null);
              }}
              placeholder="e.g. 842 4910 2931 or full invite link"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E71EB] focus:border-transparent text-sm transition-all outline-hidden font-mono"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Your Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E71EB] focus:border-transparent text-sm transition-all outline-hidden"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="alwaysJoin"
              checked={alwaysBrowser}
              onChange={(e) => setAlwaysBrowser(e.target.checked)}
              className="w-4 h-4 text-[#0E71EB] rounded-sm border-gray-300 focus:ring-[#0E71EB]"
            />
            <label htmlFor="alwaysJoin" className="text-xs text-gray-600 select-none cursor-pointer">
              Always join from browser
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !meetingInput.trim()}
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#0E71EB] hover:bg-[#005CE6] disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Join</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
