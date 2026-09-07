'use client';

import React from 'react';
import {
  Home,
  Video,
  Disc,
  Settings,
  PenTool,
  FileText,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'home' | 'meetings' | 'recordings';
  onSelectTab: (tab: 'home' | 'meetings' | 'recordings') => void;
  onOpenTestModal?: () => void;
}

export default function Sidebar({ activeTab, onSelectTab, onOpenTestModal }: SidebarProps) {
  const primaryNav = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'meetings', name: 'Meetings', icon: Video },
    { id: 'recordings', name: 'Recordings', icon: Disc },
  ];

  const secondaryProducts = [
    { id: 'whiteboards', name: 'Whiteboards', icon: PenTool },
    { id: 'notes', name: 'Notes', icon: FileText },
  ];

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200/90 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between text-sm select-none z-10">
      <div className="space-y-6">
        {/* Navigation Group 1: Core Navigation */}
        <div>
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Workplace
          </h3>
          <div className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-[#0B5CFF] shadow-2xs font-bold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#0B5CFF]' : 'text-gray-400'} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Group 2: Collaboration Tools matching Zoom Sidebar */}
        <div>
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            My Products
          </h3>
          <div className="space-y-1">
            {secondaryProducts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => alert(`${item.name} is available in ZoomClone Workplace Suite.`)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={16} className="text-gray-400 group-hover:text-gray-600" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.2 rounded font-medium">New</span>
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
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:text-[#0B5CFF] transition-all cursor-pointer group"
          >
            <Settings size={16} className="text-gray-400 group-hover:text-[#0B5CFF] transition-colors" />
            <span>Audio & Video Test</span>
          </button>
        </div>
      )}
    </aside>
  );
}
