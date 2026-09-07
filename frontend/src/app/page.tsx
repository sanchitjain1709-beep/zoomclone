'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Meeting } from '@/types/meeting';
import {
  getCurrentUser,
  getUpcomingMeetings,
  getRecentMeetings,
  createInstantMeeting,
} from '@/services/api';

import PortalHeader from '@/components/dashboard/PortalHeader';
import Sidebar from '@/components/dashboard/Sidebar';
import ProfileCard from '@/components/dashboard/ProfileCard';
import ActionTiles from '@/components/dashboard/ActionTiles';
import ClockHero from '@/components/dashboard/ClockHero';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings';
import RecentMeetings from '@/components/dashboard/RecentMeetings';
import MeetingsView from '@/components/dashboard/MeetingsView';
import JoinModal from '@/components/modals/JoinModal';
import ScheduleModal from '@/components/modals/ScheduleModal';
import AudioVideoTestModal from '@/components/modals/AudioVideoTestModal';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'meetings' | 'recordings'>('home');
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Home - Zoom Workplace';
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [u, up, rec] = await Promise.all([
        getCurrentUser().catch(() => null),
        getUpcomingMeetings().catch(() => []),
        getRecentMeetings().catch(() => []),
      ]);
      if (u) setUser(u);
      setUpcoming(up);
      setRecent(rec);
    } catch (e) {
      console.error('Error loading home data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartInstant = async () => {
    try {
      const meeting = await createInstantMeeting({
        title: `${user?.display_name || 'Sanchit Jain'}'s Zoom Meeting`,
        use_pmi: false,
      });
      const cleanCode = meeting.meeting_code.replace(/\s+/g, '');
      const encodedName = encodeURIComponent(user?.display_name || 'Sanchit Jain');
      router.push(`/room/${cleanCode}?host=true&name=${encodedName}`);
    } catch (err: any) {
      alert(err.message || 'Failed to start instant meeting');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      {/* 1. Zoom Portal Top Header (All Mocked Buttons Removed) */}
      <PortalHeader
        user={user}
        onOpenJoin={() => setIsJoinOpen(true)}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onStartInstant={handleStartInstant}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(t) => setActiveTab(t)}
          onOpenTestModal={() => setIsTestModalOpen(true)}
        />

        {/* Main Canvas with Symmetrical Proportions */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col items-center">
          {activeTab === 'home' && (
            <div className="max-w-5xl w-full space-y-6 animate-in fade-in duration-150">
              {/* Symmetrical Time & Date Header */}
              <ClockHero />

              {/* Symmetrical 2x2 Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Row 1: Profile (Left) & Quick Action Tiles (Right) */}
                <ProfileCard user={user} />
                <ActionTiles
                  onOpenSchedule={() => setIsScheduleOpen(true)}
                  onOpenJoin={() => setIsJoinOpen(true)}
                  onStartHost={handleStartInstant}
                />

                {/* Row 2: Recent Activity (Left) & Upcoming Meetings (Right) */}
                <RecentMeetings meetings={recent} />
                <UpcomingMeetings
                  meetings={upcoming}
                  onRefresh={loadData}
                  onOpenSchedule={() => setIsScheduleOpen(true)}
                  onTestAudioVideo={() => setIsTestModalOpen(true)}
                />
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="max-w-5xl w-full animate-in fade-in duration-150">
              <MeetingsView
                user={user}
                upcoming={upcoming}
                recent={recent}
                onRefresh={loadData}
                onOpenSchedule={() => setIsScheduleOpen(true)}
                onStartInstant={handleStartInstant}
              />
            </div>
          )}

          {activeTab === 'recordings' && (
            <div className="max-w-5xl w-full animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-xs space-y-3">
                <h2 className="text-xl font-bold text-gray-900">Cloud Recordings</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  There are no cloud recordings stored in your account. Recorded meetings will automatically appear here once finalized.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. Fully Functional Modals */}
      <JoinModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        defaultName={user?.display_name || 'Sanchit Jain'}
      />

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onScheduled={() => {
          loadData();
          setIsScheduleOpen(false);
        }}
        pmi={user?.pmi}
      />

      <AudioVideoTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
