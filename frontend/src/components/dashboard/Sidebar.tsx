'use client';

import React from 'react';
import { Home, Video, Disc, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: 'home' | 'meetings' | 'recordings';
  onSelectTab: (tab: 'home' | 'meetings' | 'recordings') => void;
  onOpenTestModal?: () => void;
}

export default function Sidebar({ activeTab, onSelectTab, onOpenTestModal }: SidebarProps) {
  const navItems = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'meetings', name: 'Meetings', icon: Video },
    { id: 'recordings', name: 'Recordings', icon: Disc },
  ];

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between text-sm select-none">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Workplace
          </h3>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-[#0B5CFF] shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#0B5CFF]' : 'text-gray-500'} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hardware Diagnostic Settings */}
      {onOpenTestModal && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={onOpenTestModal}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <Settings size={16} className="text-gray-400" />
            <span>Audio & Video Test</span>
          </button>
        </div>
      )}
    </aside>
  );
}
