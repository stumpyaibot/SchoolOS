/* ===== SchoolOS Type Definitions ===== */

export type Role = 'parent' | 'teacher' | 'admin';

export interface User {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  languagePreference: 'en' | 'zh' | 'ja';
  childrenIds?: string[];
  classIds?: string[];
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gradeStr: string;
  classId: string;
  parentIds: string[];
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
}

export type FeedItemType = 'teacher_post' | 'admin_announcement' | 'ingested_whatsapp' | 'ingested_email' | 'student_work';
export type Priority = 'normal' | 'important' | 'urgent';

export interface Reaction {
  type: string;
  count: number;
  userReacted: boolean;
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  authorId: string;
  targetAudiences: {
    classIds?: string[];
    studentIds?: string[];
    schoolWide?: boolean;
  };
  timestamp: string;
  title: string;
  content: string;
  mediaUrls?: string[];
  priority: Priority;
  reactions?: Reaction[];
  readCount?: number;
  totalAudience?: number;
  actionItem?: {
    type: 'signature_required' | 'rsvp' | 'checklist' | 'acknowledgement';
    dueDate: string;
    isCompleted: boolean;
    buttonLabel: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  targetAudiences: {
    classIds?: string[];
    schoolWide?: boolean;
  };
  bookingDetails?: {
    isBookable: boolean;
    bookedByParentId?: string;
    teacherId: string;
  };
}

export interface Conversation {
  id: string;
  participantIds: string[];
  studentId: string;
  lastMessage: Message;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface AIDigest {
  id: string;
  date: string;
  items: DigestItem[];
  generatedAt: string;
}

export interface DigestItem {
  childId: string;
  icon: 'info' | 'warning' | 'logistics';
  summary: string;
  sourcePostId?: string;
}

export interface AppNotification {
  id: string;
  type: 'action_due' | 'new_message' | 'new_post' | 'digest_ready';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  deepLink: string;
}

export interface UserSettings {
  userId: string;
  notifications: {
    pushEnabled: boolean;
    emailSummary: boolean;
    whatsappDelivery: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  languagePreference: 'en' | 'zh' | 'ja';
}
