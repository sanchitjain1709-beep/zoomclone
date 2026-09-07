'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Lock, Shield, Loader2, AlertCircle } from 'lucide-react';
import { scheduleMeeting } from '@/services/api';
import { Meeting } from '@/types/meeting';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: (newMeeting: Meeting) => void;
  pmi?: string;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onScheduled,
  pmi = '948 007 6202',
}: ScheduleModalProps) {
  const [topic, setTopic] = useState('My Meeting');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 3600 * 1000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('17:30');
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(40);
  const [usePmi, setUsePmi] = useState(false);
  const [passcode, setPasscode] = useState('gTfEu4');
  const [waitingRoom, setWaitingRoom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a meeting topic.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scheduledStart = new Date(`${startDate}T${startTime}:00`).toISOString();
      const totalDuration = durationHours * 60 + durationMinutes;

      const meeting = await scheduleMeeting({
        title: topic.trim(),
        description: description.trim() || undefined,
        scheduled_start: scheduledStart,
        duration_minutes: totalDuration || 40,
        passcode: passcode.trim() || undefined,
        enable_waiting_room: waitingRoom,
        use_pmi: usePmi,
      });

      onScheduled(meeting);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule meeting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100 relative my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Heading matching Screenshot 170302.png */}
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Schedule Meeting</h2>
          <p className="text-xs text-gray-500 mt-1">Configure your ZoomClone meeting session parameters</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {/* Topic */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
            <label className="text-xs font-semibold text-gray-700 pt-2">
              <span className="text-red-500 mr-1">*</span>Topic
            </label>
            <div className="md:col-span-3 space-y-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E71EB] focus:border-transparent text-sm outline-hidden"
                placeholder="My Meeting"
              />
              {!showDescription ? (
                <button
                  type="button"
                  onClick={() => setShowDescription(true)}
                  className="text-xs text-[#0E71EB] hover:underline font-medium cursor-pointer"
                >
                  + Add Description
                </button>
              ) : (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter meeting agenda or description"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0E71EB] focus:border-transparent text-xs outline-hidden"
                />
              )}
            </div>
          </div>

          {/* When */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
            <label className="text-xs font-semibold text-gray-700">When</label>
            <div className="md:col-span-3 flex items-center space-x-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-hidden focus:ring-2 focus:ring-[#0E71EB]"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-hidden focus:ring-2 focus:ring-[#0E71EB]"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
            <label className="text-xs font-semibold text-gray-700">Duration</label>
            <div className="md:col-span-3 flex items-center space-x-3">
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-gray-300 text-sm outline-hidden"
              >
                <option value={0}>0 hr</option>
                <option value={1}>1 hr</option>
                <option value={2}>2 hr</option>
              </select>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-gray-300 text-sm outline-hidden"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={40}>40 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>

          {/* Basic Plan Limit Banner from Screenshot 170302.png */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start space-x-2.5">
            <span className="text-amber-600 font-bold">⚠️</span>
            <span>
              You can schedule meetings for up to 40 minutes each with your current Basic plan. Need more time?{' '}
              <span className="text-[#0E71EB] hover:underline cursor-pointer font-medium">Upgrade to ZoomClone Workplace Pro</span>
            </span>
          </div>

          {/* Meeting ID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start pt-2 border-t border-gray-100">
            <label className="text-xs font-semibold text-gray-700 pt-1">Meeting ID</label>
            <div className="md:col-span-3 space-y-2">
              <label className="flex items-center space-x-2 text-xs text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="meetingIdType"
                  checked={!usePmi}
                  onChange={() => setUsePmi(false)}
                  className="text-[#0E71EB] focus:ring-[#0E71EB]"
                />
                <span>Generate Automatically</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="meetingIdType"
                  checked={usePmi}
                  onChange={() => setUsePmi(true)}
                  className="text-[#0E71EB] focus:ring-[#0E71EB]"
                />
                <span>Personal Meeting ID: <strong className="font-mono">{pmi}</strong></span>
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start pt-2 border-t border-gray-100">
            <label className="text-xs font-semibold text-gray-700 pt-1">Security</label>
            <div className="md:col-span-3 space-y-3">
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-xs text-gray-800">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                    className="text-[#0E71EB] rounded-sm focus:ring-[#0E71EB]"
                  />
                  <span>Passcode:</span>
                </label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="px-3 py-1.5 w-32 rounded-lg border border-gray-300 text-xs font-mono outline-hidden focus:ring-1 focus:ring-[#0E71EB]"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Only users who have the invite link or passcode can join the meeting
              </p>

              <label className="flex items-center space-x-2 text-xs text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waitingRoom}
                  onChange={(e) => setWaitingRoom(e.target.checked)}
                  className="text-[#0E71EB] rounded-sm focus:ring-[#0E71EB]"
                />
                <span>Waiting Room (Only users admitted by the host can join)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2 text-sm font-bold text-white bg-[#0E71EB] hover:bg-[#005CE6] disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
