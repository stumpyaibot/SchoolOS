/**
 * Data Access Layer for SchoolOS
 * 
 * This module provides a unified API for data access that works in two modes:
 * 1. Mock mode (default): Returns data from mockData.ts — no backend needed.
 * 2. Supabase mode: Queries live PostgreSQL via Supabase — enabled when env vars are set.
 * 
 * Components should import from this file instead of directly from mockData.ts.
 * This makes the transition to a live backend seamless.
 */

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  feedItems,
  calendarEvents,
  conversations,
  students,
  classes,
  getUserById,
  getStudentById,
} from '../data/mockData';
import type { FeedItem, CalendarEvent, Conversation, Student, User } from '../types';

// ===== FEED ITEMS =====

export async function getFeedItems(): Promise<FeedItem[]> {
  if (!isSupabaseConfigured()) return feedItems;

  const { data, error } = await supabase
    .from('feed_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feed items:', error);
    return feedItems; // Fallback to mock data
  }

  return (data || []).map(mapDbFeedItem);
}

export async function getFeedItemById(id: string): Promise<FeedItem | undefined> {
  if (!isSupabaseConfigured()) return feedItems.find(i => i.id === id);

  const { data, error } = await supabase
    .from('feed_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return feedItems.find(i => i.id === id);
  return mapDbFeedItem(data);
}

// ===== CALENDAR EVENTS =====

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  if (!isSupabaseConfigured()) return calendarEvents;

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching calendar events:', error);
    return calendarEvents;
  }

  return (data || []).map(mapDbCalendarEvent);
}

// ===== CONVERSATIONS =====

export async function getConversations(): Promise<Conversation[]> {
  if (!isSupabaseConfigured()) return conversations;

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants(*),
      messages(*, sender:users(*))
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return conversations;
  }

  return data || conversations;
}

// ===== STUDENTS =====

export async function getStudents(): Promise<Student[]> {
  if (!isSupabaseConfigured()) return students;

  const { data, error } = await supabase
    .from('students')
    .select('*, class:classes(*)');

  if (error) return students;
  return data || students;
}

// ===== REACTIONS =====

export async function toggleReaction(feedItemId: string, userId: string, reactionType: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true; // Mock: always succeed

  // Check if reaction exists
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('feed_item_id', feedItemId)
    .eq('user_id', userId)
    .eq('type', reactionType)
    .single();

  if (existing) {
    // Remove reaction
    await supabase.from('reactions').delete().eq('id', existing.id);
    return false;
  } else {
    // Add reaction
    await supabase.from('reactions').insert({
      feed_item_id: feedItemId,
      user_id: userId,
      type: reactionType,
    });
    return true;
  }
}

// ===== READ RECEIPTS =====

export async function markAsRead(feedItemId: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await supabase.from('read_receipts').upsert({
    feed_item_id: feedItemId,
    user_id: userId,
  });
}

// ===== BOOKING =====

export async function bookSlot(slotId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  const { error } = await supabase
    .from('booking_slots')
    .update({ booked_by: userId, booked_at: new Date().toISOString() })
    .eq('id', slotId)
    .is('booked_by', null);

  return !error;
}

// ===== RE-EXPORTS for backward compatibility =====
export { getUserById, getStudentById, feedItems, calendarEvents, conversations, students, classes };

// ===== MAPPERS =====
function mapDbFeedItem(row: any): FeedItem {
  return {
    id: row.id,
    type: row.type,
    authorId: row.author_id,
    title: row.title,
    content: row.content,
    mediaUrls: row.media_urls || [],
    timestamp: row.created_at,
    priority: row.priority,
    targetAudiences: {
      classIds: row.target_class_ids || [],
      studentIds: row.target_student_ids || [],
    },
    readCount: row.read_count,
    totalAudience: row.total_audience,
    reactions: [],
    actionItem: row.action_type ? {
      type: row.action_type,
      dueDate: row.action_due_date,
      buttonLabel: row.action_button_label || 'View',
      status: 'pending',
    } : undefined,
  };
}

function mapDbCalendarEvent(row: any): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    startTime: row.start_time,
    endTime: row.end_time,
    isAllDay: row.is_all_day,
    targetAudiences: {
      classIds: row.target_class_ids || [],
      studentIds: [],
    },
    bookingDetails: row.is_bookable ? {
      isBookable: true,
      teacherId: row.booking_teacher_id,
    } : undefined,
  };
}
