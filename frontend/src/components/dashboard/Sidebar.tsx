'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Video,
  Disc,
  FileText,
  LayoutGrid,
  PenTool,
  Paperclip,
  Calendar,
  Layers,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'home' | 'meetings' | 'recordings';
  onSelectTab: (tab: 'home' | 'meetings' | 'recordings') => void;
}

export default function Sidebar({ activeTab, onSelectTab }: SidebarProps) {
  const products = [
    { id: 'meetings', name: 'Meetings', icon: Video },
    { id: 'recordings', name: 'Recordings', icon: Disc },
    { id: 'summaries', name: 'Summaries', icon: FileText },
    { id: 'whiteboards', name: 'Whiteboards', icon: PenTool, external: true },
    { id: 'notes', name: 'Notes', icon: FileText },
    { id: 'clips', name: 'Clips', icon: Paperclip, external: true },
    { id: 'scheduler', name: 'Scheduler', icon: Calendar, external: true },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-5.5rem)] p-4 flex flex-col justify-between text-sm">
      <div className="space-y-6">
        {/* Home Tab */}
        <div>
          <button
            onClick={() => onSelectTab('home')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-blue-50 text-[#0B5CFF]'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home size={18} />
            <span>Home</span>
          </button>
        </div>

        {/* My Products Section */}
        <div>
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            My Products
          </h3>
          <div className="space-y-1">
            {products.map((p) => {
              const Icon = p.icon;
              const isActive = activeTab === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectTab(p.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-[#0B5CFF] font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={16} />
                    <span>{p.name}</span>
                  </div>
                  {p.external && <ExternalLink size={13} className="text-gray-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Accordion Links */}
      <div className="border-t border-gray-200 pt-4 space-y-2 text-xs text-gray-500 font-medium">
        <button className="w-full flex items-center justify-between px-3 py-1.5 hover:text-gray-900 cursor-pointer">
          <span>My Account</span>
          <ChevronDown size={14} />
        </button>
        <button className="w-full flex items-center justify-between px-3 py-1.5 hover:text-gray-900 cursor-pointer">
          <span>Admin</span>
          <ChevronDown size={14} />
        </button>
        <button className="w-full flex items-center justify-between px-3 py-1.5 hover:text-gray-900 cursor-pointer">
          <span>Support</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </aside>
  );
}
