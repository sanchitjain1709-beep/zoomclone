'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { ChatMessage } from '@/types/meeting';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  localName: string;
}

export default function ChatDrawer({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  localName,
}: ChatDrawerProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <aside className="w-80 h-full bg-[#181A20] border-l border-gray-800 text-white flex flex-col justify-between shrink-0 z-20 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-bold">Meeting Chat</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-1">
            <p className="font-medium">No messages yet</p>
            <p className="text-[11px] text-gray-600">Messages sent here are visible to everyone.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_name === localName;
            return (
              <div key={m.id} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-bold ${
                      isMe ? 'text-[#0E71EB]' : 'text-gray-300'
                    }`}
                  >
                    {m.sender_name} {isMe && '(me)'}
                  </span>
                  <span className="text-[10px] text-gray-500">{m.timestamp}</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl text-gray-200 break-words border border-white/5">
                  {m.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-800 space-y-2">
        <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
          <span>To:</span>
          <span className="bg-[#2E323B] px-2 py-0.5 rounded-md text-white font-medium">
            Everyone
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message here..."
            className="w-full bg-[#1F2228] border border-gray-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-gray-500 focus:border-[#0E71EB] focus:ring-1 focus:ring-[#0E71EB] outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0E71EB] disabled:text-gray-600 hover:text-[#005CE6] transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </aside>
  );
}
