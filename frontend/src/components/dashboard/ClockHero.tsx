'use client';

import React, { useState, useEffect } from 'react';

export default function ClockHero() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center select-none">
      <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
        {timeStr || '5:00 PM'}
      </h1>
      <p className="text-sm font-medium text-gray-500 mt-1.5">
        {dateStr || 'Monday, September 7'}
      </p>
    </div>
  );
}
