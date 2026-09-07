import { User, Meeting } from '../types/meeting';

const API_BASE = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api');

export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/users/me`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

export async function getUpcomingMeetings(): Promise<Meeting[]> {
  const res = await fetch(`${API_BASE}/meetings/upcoming`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch upcoming meetings');
  return res.json();
}

export async function getRecentMeetings(): Promise<Meeting[]> {
  const res = await fetch(`${API_BASE}/meetings/recent`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch recent meetings');
  return res.json();
}

export async function createInstantMeeting(payload: { title?: string; use_pmi?: boolean } = {}): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/meetings/instant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create instant meeting');
  }
  return res.json();
}

export async function scheduleMeeting(payload: {
  title: string;
  description?: string;
  scheduled_start: string;
  duration_minutes: number;
  passcode?: string;
  enable_waiting_room?: boolean;
  use_pmi?: boolean;
}): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/meetings/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to schedule meeting');
  }
  return res.json();
}

export async function validateMeetingCode(code: string): Promise<{ exists: boolean; meeting?: Meeting; message?: string }> {
  const cleanCode = encodeURIComponent(code.trim());
  const res = await fetch(`${API_BASE}/meetings/validate/${cleanCode}`, { cache: 'no-store' });
  if (!res.ok) return { exists: false, message: 'Server error during validation' };
  return res.json();
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/meetings/${id}`, { method: 'DELETE' });
  return res.ok;
}
