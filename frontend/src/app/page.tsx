'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, RefreshCw } from 'lucide-react';
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
import JoinModal from '@/components/modals/JoinModal';
import ScheduleModal from '@/components/modals/ScheduleModal';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'meetings' | 'recordings'>('home');
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
      console.error('Error loading dashboard data', e);
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
      {/* 1. Zoom Portal Header */}
      <PortalHeader
        user={user}
        onOpenJoin={() => setIsJoinOpen(true)}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onStartInstant={handleStartInstant}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={(t) => setActiveTab(t)} />

        {/* Center Main Dashboard Canvas */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Top Clock & Date Hero Banner */}
          <ClockHero />

          {/* Dual Column Layout matching Screenshot 165109.png & 170818.png */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Profile & Upcoming Meetings */}
            <div className="lg:col-span-2 space-y-6">
              <ProfileCard user={user} />
              <UpcomingMeetings
                meetings={upcoming}
                onRefresh={loadData}
                onOpenSchedule={() => setIsScheduleOpen(true)}
              />
            </div>

            {/* Right 1 Column: Action Tiles & Recent History */}
            <div className="space-y-6">
              <ActionTiles
                user={user}
                onOpenSchedule={() => setIsScheduleOpen(true)}
                onOpenJoin={() => setIsJoinOpen(true)}
                onStartHost={handleStartInstant}
              />
              <RecentMeetings meetings={recent} />
            </div>
          </div>
        </main>
      </div>

      {/* 3. Floating Action Bubble for Chat/Support matching screenshot */}
      <button
        onClick={() => alert('Zoom Help Center: Live support assistant is available 24/7.')}
        className="fixed bottom-6 right-6 w-13 h-13 rounded-full bg-[#0E71EB] hover:bg-[#005CE6] text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 z-40 cursor-pointer"
        title="Zoom Support"
      >
        <MessageSquare size={22} />
      </button>

      {/* 4. Modals */}
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
    </div>
  );
}
