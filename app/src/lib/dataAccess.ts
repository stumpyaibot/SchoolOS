/**
 * Data Access Layer for SchoolOS
 * 
 * This module provides a unified API for data access that works in two modes:
 * 1. API mode (default): Calls the local Express.js + SQLite backend on port 3001.
 * 2. Mock fallback: If the API is unreachable, falls back to mock data.
 * 
 * Components should import from this file instead of directly from mockData.ts.
 */

import {
  feedItems as mockFeedItems,
  calendarEvents as mockCalendarEvents,
  conversations as mockConversations,
  students as mockStudents,
  classes as mockClasses,
  getUserById as mockGetUserById,
  getStudentById as mockGetStudentById,
  allMessages as mockAllMessages,
  todayDigest as mockDigest,
  userSettings as mockUserSettings,
} from '../data/mockData';
import type { FeedItem, CalendarEvent, Conversation, Student, Class, User, Message, AIDigest, UserSettings } from '../types';

const API_BASE = '/api';

/** Check if the API server is available */
let _apiAvailable: boolean | null = null;
async function isApiAvailable(): Promise<boolean> {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1000) });
    _apiAvailable = res.ok;
  } catch {
    _apiAvailable = false;
  }
  return _apiAvailable;
}

/** Reset the API availability check (useful if server starts after app) */
export function resetApiCheck() {
  _apiAvailable = null;
}

// ===== FEED ITEMS =====

export async function getFeedItems(): Promise<FeedItem[]> {
  if (!(await isApiAvailable())) return mockFeedItems;
  try {
    const res = await fetch(`${API_BASE}/feed`);
    return await res.json();
  } catch {
    return mockFeedItems;
  }
}

export async function getFeedItemById(id: string): Promise<FeedItem | undefined> {
  if (!(await isApiAvailable())) return mockFeedItems.find(i => i.id === id);
  try {
    const res = await fetch(`${API_BASE}/feed/${id}`);
    if (!res.ok) return mockFeedItems.find(i => i.id === id);
    return await res.json();
  } catch {
    return mockFeedItems.find(i => i.id === id);
  }
}

// ===== CALENDAR EVENTS =====

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  if (!(await isApiAvailable())) return mockCalendarEvents;
  try {
    const res = await fetch(`${API_BASE}/events`);
    return await res.json();
  } catch {
    return mockCalendarEvents;
  }
}

// ===== CONVERSATIONS =====

export async function getConversations(): Promise<Conversation[]> {
  if (!(await isApiAvailable())) return mockConversations;
  try {
    const res = await fetch(`${API_BASE}/conversations?userId=u_parent_jack`);
    return await res.json();
  } catch {
    return mockConversations;
  }
}

// ===== MESSAGES =====

export async function getMessages(conversationId: string): Promise<Message[]> {
  if (!(await isApiAvailable())) return mockAllMessages[conversationId] || [];
  try {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`);
    return await res.json();
  } catch {
    return mockAllMessages[conversationId] || [];
  }
}

export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
  if (!(await isApiAvailable())) return null;
  try {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, content }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

// ===== STUDENTS =====

export async function getStudents(): Promise<Student[]> {
  if (!(await isApiAvailable())) return mockStudents;
  try {
    const res = await fetch(`${API_BASE}/students`);
    return await res.json();
  } catch {
    return mockStudents;
  }
}

// ===== CLASSES =====

export async function getClasses(): Promise<Class[]> {
  if (!(await isApiAvailable())) return mockClasses;
  try {
    const res = await fetch(`${API_BASE}/classes`);
    return await res.json();
  } catch {
    return mockClasses;
  }
}

// ===== REACTIONS =====

export async function toggleReaction(feedItemId: string, userId: string, reactionType: string): Promise<boolean> {
  if (!(await isApiAvailable())) return true;
  try {
    const res = await fetch(`${API_BASE}/feed/${feedItemId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type: reactionType }),
    });
    const data = await res.json();
    return data.toggled;
  } catch {
    return true;
  }
}

// ===== READ RECEIPTS =====

export async function markAsRead(feedItemId: string, userId: string): Promise<void> {
  if (!(await isApiAvailable())) return;
  try {
    await fetch(`${API_BASE}/feed/${feedItemId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  } catch { /* silent */ }
}

// ===== BOOKING =====

export async function bookSlot(_slotId: string, _userId: string): Promise<boolean> {
  // TODO: Implement booking via API
  return true;
}

// ===== USER SETTINGS =====

export async function getUserSettings(userId: string): Promise<UserSettings> {
  if (!(await isApiAvailable())) return mockUserSettings;
  try {
    const res = await fetch(`${API_BASE}/settings/${userId}`);
    if (!res.ok) return mockUserSettings;
    return await res.json();
  } catch {
    return mockUserSettings;
  }
}

// ===== AI DIGEST =====

export function getTodayDigest(): AIDigest {
  return mockDigest; // Will be generated by AI in Phase 4
}

// ===== RE-EXPORTS for backward compatibility =====
export function getUserById(id: string): User | undefined {
  return mockGetUserById(id);
}

export function getStudentById(id: string): Student | undefined {
  return mockGetStudentById(id);
}

// Direct re-exports for components that import these directly
export {
  feedItems,
  calendarEvents,
  conversations,
  students,
  classes,
} from '../data/mockData';
