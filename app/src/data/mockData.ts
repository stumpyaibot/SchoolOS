import type { User, Student, Class, FeedItem, CalendarEvent, Conversation, Message, AIDigest, UserSettings } from '../types';

/* ===== Date Helpers — All dates relative to today ===== */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}
function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/* ===== Users ===== */
export const currentUser: User = {
  id: 'u_parent_jack',
  role: 'parent',
  firstName: 'Jack',
  lastName: 'Smith',
  languagePreference: 'en',
  childrenIds: ['stu_leo_1', 'stu_maya_2'],
};

export const teachers: Record<string, User> = {
  u_teacher_tan: {
    id: 'u_teacher_tan',
    role: 'teacher',
    firstName: 'Mr.',
    lastName: 'Tan',
    languagePreference: 'en',
    classIds: ['cls_4b'],
  },
  u_teacher_chen: {
    id: 'u_teacher_chen',
    role: 'teacher',
    firstName: 'Ms.',
    lastName: 'Chen',
    languagePreference: 'en',
    classIds: ['cls_1a'],
  },
};

const adminUser: User = {
  id: 'u_admin',
  role: 'admin',
  firstName: 'School',
  lastName: 'Office',
  languagePreference: 'en',
};

/* ===== Students ===== */
export const students: Student[] = [
  { id: 'stu_leo_1', firstName: 'Leo', lastName: 'Smith', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_jack'] },
  { id: 'stu_maya_2', firstName: 'Maya', lastName: 'Smith', gradeStr: 'Grade 1', classId: 'cls_1a', parentIds: ['u_parent_jack'] },
];

/* ===== Classes ===== */
export const classes: Class[] = [
  { id: 'cls_4b', name: '4B — Jaguars', teacherId: 'u_teacher_tan', studentIds: ['stu_leo_1'] },
  { id: 'cls_1a', name: '1A — Butterflies', teacherId: 'u_teacher_chen', studentIds: ['stu_maya_2'] },
];

/* ===== AI Digest ===== */
export const todayDigest: AIDigest = {
  id: 'digest_today',
  date: new Date().toISOString().slice(0, 10),
  generatedAt: todayAt(6, 30),
  items: [
    { childId: 'stu_leo_1', icon: 'warning', summary: 'Science Museum permission slip due tomorrow.', sourcePostId: 'post_884' },
    { childId: 'stu_leo_1', icon: 'logistics', summary: 'PE kit needed — swimming this Thursday.', sourcePostId: 'post_885' },
    { childId: 'stu_maya_2', icon: 'info', summary: 'Art showcase photos shared by Ms. Chen.', sourcePostId: 'post_886' },
    { childId: 'stu_maya_2', icon: 'logistics', summary: 'Book Week starts Monday — dress as favourite character.', sourcePostId: 'post_887' },
  ],
};

/* ===== Feed Items — timestamps relative to today ===== */
export const feedItems: FeedItem[] = [
  {
    id: 'post_884',
    type: 'admin_announcement',
    authorId: 'u_admin',
    targetAudiences: { classIds: ['cls_4b'] },
    timestamp: daysAgo(1),
    title: 'Science Museum Trip — Permission Required',
    content: 'Grade 4 will be visiting the Science Centre next week. Please review the details and sign the consent form by Wednesday.',
    priority: 'urgent',
    readCount: 9,
    totalAudience: 12,
    actionItem: {
      type: 'signature_required',
      dueDate: daysFromNow(2),
      isCompleted: false,
      buttonLabel: 'Review & Sign',
    },
  },
  {
    id: 'post_885',
    type: 'ingested_whatsapp',
    authorId: 'u_teacher_tan',
    targetAudiences: { classIds: ['cls_4b'] },
    timestamp: daysAgo(0),
    title: 'PE Reminder — Swimming Kit',
    content: 'Hi parents! Just a quick reminder that Thursday is swimming. Please ensure your child brings goggles, swim cap, and a towel. Thanks!',
    priority: 'normal',
    reactions: [{type: '👍', count: 8, userReacted: true}],
    readCount: 11,
    totalAudience: 12,
  },
  {
    id: 'post_886',
    type: 'student_work',
    authorId: 'u_teacher_chen',
    targetAudiences: { studentIds: ['stu_maya_2'] },
    timestamp: todayAt(10, 15),
    title: 'Maya\'s Watercolour Masterpiece ✨',
    content: 'Maya created this beautiful watercolour painting of a rainbow garden today. She was so proud of the colour blending!',
    mediaUrls: ['/images/watercolour.jpg'],
    priority: 'normal',
    reactions: [{type: '❤️', count: 14, userReacted: true}, {type: '🌟', count: 7, userReacted: false}],
    readCount: 1,
    totalAudience: 1,
  },
  {
    id: 'post_887',
    type: 'ingested_email',
    authorId: 'u_admin',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(2),
    title: 'Book Week — Dress Up Day',
    content: 'Dear Parents, Book Week runs next week. On Friday, children are invited to dress as their favourite book character. No scary costumes please!',
    priority: 'important',
    readCount: 42,
    totalAudience: 55,
    actionItem: {
      type: 'acknowledgement',
      dueDate: daysFromNow(7),
      isCompleted: false,
      buttonLabel: 'Noted',
    },
  },
  {
    id: 'post_888',
    type: 'teacher_post',
    authorId: 'u_teacher_tan',
    targetAudiences: { classIds: ['cls_4b'] },
    timestamp: todayAt(14),
    title: 'Creative Writing — Imaginary Planets',
    content: 'Leo\'s class did an amazing job today imagining their own planets. Ask your child about the planet they created! Leo\'s planet has three suns and talking animals 🌍',
    mediaUrls: ['/images/creative_writing.jpg'],
    priority: 'normal',
    reactions: [{type: '❤️', count: 12, userReacted: false}, {type: '👏', count: 5, userReacted: false}, {type: '🌟', count: 3, userReacted: false}],
    readCount: 10,
    totalAudience: 12,
  },
  {
    id: 'post_889',
    type: 'admin_announcement',
    authorId: 'u_admin',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(3),
    title: 'Term 4 Calendar Update',
    content: 'Please note the updated dates for Term 4. School closes on 10 December for the holiday break. The first day of Term 1 (2027) is Monday 11 January.',
    priority: 'normal',
  },
];

/* ===== Calendar Events — relative to today ===== */
export const calendarEvents: CalendarEvent[] = [
  {
    id: 'evt_swim',
    title: 'Swimming — PE',
    description: 'Remember goggles, cap, and towel.',
    location: 'School Pool',
    startTime: daysFromNow(2),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(11); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { classIds: ['cls_4b'] },
  },
  {
    id: 'evt_museum',
    title: 'Science Museum Trip',
    description: 'Grade 4 excursion to the Science Centre Singapore.',
    location: 'Science Centre, Jurong East',
    startTime: daysFromNow(7),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(14); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { classIds: ['cls_4b'] },
  },
  {
    id: 'evt_bookweek',
    title: 'Book Week',
    description: 'A week of reading activities and dress-up day on Friday.',
    startTime: daysFromNow(5),
    endTime: daysFromNow(9),
    isAllDay: true,
    targetAudiences: { schoolWide: true },
  },
  {
    id: 'evt_ptc',
    title: 'Parent-Teacher Conference',
    description: 'Book a 15-minute slot with Mr. Tan to discuss Leo\'s progress.',
    location: 'Room 4B, Main Building',
    startTime: daysFromNow(14),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 14); d.setHours(16); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { classIds: ['cls_4b'] },
    bookingDetails: { isBookable: true, teacherId: 'u_teacher_tan' },
  },
  {
    id: 'evt_sports',
    title: 'Sports Day',
    description: 'Annual inter-house sports competition. Parents welcome to attend!',
    location: 'School Field',
    startTime: daysFromNow(10),
    endTime: daysFromNow(10),
    isAllDay: true,
    targetAudiences: { schoolWide: true },
  },
];

/* ===== Conversations & Messages ===== */
export const conversations: Conversation[] = [
  {
    id: 'conv_1',
    participantIds: ['u_parent_jack', 'u_teacher_tan'],
    studentId: 'stu_leo_1',
    lastMessage: { id: 'msg_3', conversationId: 'conv_1', senderId: 'u_teacher_tan', content: 'Leo did really well in maths today — top of the class!', timestamp: todayAt(15, 30), isRead: false },
    unreadCount: 1,
  },
  {
    id: 'conv_2',
    participantIds: ['u_parent_jack', 'u_teacher_chen'],
    studentId: 'stu_maya_2',
    lastMessage: { id: 'msg_5', conversationId: 'conv_2', senderId: 'u_parent_jack', content: 'Thank you for the lovely photos of Maya\'s artwork!', timestamp: todayAt(11), isRead: true },
    unreadCount: 0,
  },
];

export const allMessages: Record<string, Message[]> = {
  conv_1: [
    { id: 'msg_1', conversationId: 'conv_1', senderId: 'u_parent_jack', content: 'Hi Mr. Tan, how is Leo doing in class this week?', timestamp: todayAt(9), isRead: true },
    { id: 'msg_2', conversationId: 'conv_1', senderId: 'u_teacher_tan', content: 'Hi Jack! He\'s doing great. Very engaged in the creative writing topic.', timestamp: todayAt(12, 15), isRead: true },
    { id: 'msg_3', conversationId: 'conv_1', senderId: 'u_teacher_tan', content: 'Leo did really well in maths today — top of the class!', timestamp: todayAt(15, 30), isRead: false },
  ],
  conv_2: [
    { id: 'msg_4', conversationId: 'conv_2', senderId: 'u_teacher_chen', content: 'Hi Jack! Just wanted to share that Maya had a wonderful day. She\'s really coming out of her shell in class.', timestamp: daysAgo(1), isRead: true },
    { id: 'msg_5', conversationId: 'conv_2', senderId: 'u_parent_jack', content: 'Thank you for the lovely photos of Maya\'s artwork!', timestamp: todayAt(11), isRead: true },
  ],
};

/* ===== User Settings ===== */
export const userSettings: UserSettings = {
  userId: 'u_parent_jack',
  notifications: {
    pushEnabled: true,
    emailSummary: true,
    whatsappDelivery: false,
  },
  quietHours: {
    enabled: true,
    startTime: '21:00',
    endTime: '07:00',
  },
  languagePreference: 'en',
};

/* ===== Helper Lookups ===== */
export function getUserById(id: string): User | undefined {
  if (id === currentUser.id) return currentUser;
  if (id === adminUser.id) return adminUser;
  return teachers[id];
}

export function getStudentById(id: string): Student | undefined {
  return students.find(s => s.id === id);
}

export function getClassById(id: string): Class | undefined {
  return classes.find(c => c.id === id);
}

/* ===== Unread count for Messages tab badge ===== */
export function getTotalUnreadCount(): number {
  return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
}
