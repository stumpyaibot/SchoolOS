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
  lastName: 'Turner',
  languagePreference: 'en',
  childrenIds: ['stu_emma', 'stu_george'],
};

export const teachers: Record<string, User> = {
  u_teacher_tsoi: {
    id: 'u_teacher_tsoi',
    role: 'teacher',
    firstName: 'Andrea',
    lastName: 'Tsoi',
    languagePreference: 'en',
    classIds: ['cls_y6_jaguars'],
  },
  u_teacher_lim: {
    id: 'u_teacher_lim',
    role: 'teacher',
    firstName: 'Grace',
    lastName: 'Lim',
    languagePreference: 'en',
    classIds: ['cls_y4_penguins'],
  },
};

const adminUser: User = {
  id: 'u_admin',
  role: 'admin',
  firstName: 'EtonHouse',
  lastName: 'Broadrick',
  languagePreference: 'en',
};

const staffWendy: User = {
  id: 'u_staff_wendy',
  role: 'admin',
  firstName: 'Wendy',
  lastName: 'Tan',
  languagePreference: 'en',
};

/* ===== Students ===== */
export const students: Student[] = [
  { id: 'stu_emma', firstName: 'Emma', lastName: 'Turner', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_jack', 'u_parent_saeko'] },
  { id: 'stu_george', firstName: 'George', lastName: 'Turner', gradeStr: 'Year 4', classId: 'cls_y4_penguins', parentIds: ['u_parent_jack', 'u_parent_saeko'] },
];

/* ===== Classes ===== */
export const classes: Class[] = [
  { id: 'cls_y6_jaguars', name: 'Y6 — Jaguars', teacherId: 'u_teacher_tsoi', studentIds: ['stu_emma'] },
  { id: 'cls_y4_penguins', name: 'Y4 — Penguins', teacherId: 'u_teacher_lim', studentIds: ['stu_george'] },
];

/* ===== AI Digest ===== */
export const todayDigest: AIDigest = {
  id: 'digest_today',
  date: new Date().toISOString().slice(0, 10),
  generatedAt: todayAt(6, 30),
  items: [
    { icon: 'warning', summary: 'Hari Raya Dress-Up Day tomorrow — traditional or vibrant attire.', sourcePostId: 'post_raya' },
    { icon: 'info', summary: 'No school on Friday (Hari Raya PH in lieu).', sourcePostId: 'post_raya' },
    { childId: 'stu_emma', icon: 'logistics', summary: 'Y6 Camp next week — Emma not attending. Keep home Tuesday.', sourcePostId: 'post_camp' },
    { childId: 'stu_george', icon: 'logistics', summary: 'Swimming on Thursday — goggles, cap, and towel needed.', sourcePostId: 'post_swim' },
  ],
};

/* ===== Feed Items — from real emails ===== */
export const feedItems: FeedItem[] = [
  {
    id: 'post_raya',
    type: 'ingested_email',
    authorId: 'u_admin',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(1),
    title: 'Hari Raya Dress-Up Day — Tomorrow 19 March',
    summary: 'No Assembly • Traditional attire or vibrant outfits • No school Friday (PH in lieu)',
    content: 'On this special day, there will be no Assembly, but we invite all students to don their traditional Hari Raya attire or vibrant outfits! Our school\'s Hari Raya PH in lieu is on 20th March (Friday) — there will be NO school that day.',
    mediaUrls: ['/uploads/1773806602783_cdxf.png'],
    priority: 'important',
    reactions: [{type: '👍', count: 18, userReacted: true}],
    readCount: 48,
    totalAudience: 55,
  },
  {
    id: 'post_pickup',
    type: 'ingested_email',
    authorId: 'u_teacher_tsoi',
    targetAudiences: { classIds: ['cls_y6_jaguars'], studentIds: ['stu_emma'] },
    timestamp: todayAt(10, 19),
    title: 'Early Pick Up — Emma leaving at 2:30pm today',
    content: 'Hi Ms Tsoi, PLO team — As with past Wednesdays, I\'ll pick Emma up at 2:30pm today. Also, as Emma will not join the Camp next week, and given that the rest of the class travels from Tuesday, I\'m assuming I should just keep her home on Tuesday?',
    priority: 'urgent',
    readCount: 1,
    totalAudience: 1,
  },
  {
    id: 'post_withdrawal',
    type: 'ingested_email',
    authorId: 'u_staff_wendy',
    targetAudiences: { studentIds: ['stu_emma'] },
    timestamp: daysAgo(30),
    title: 'Withdrawal Notice — Emma Turner (Y6 Jaguars)',
    summary: 'Online form required — last day of school 17 June 2026',
    content: 'Dear Jack and Saeko, as Emma will be completing Year 6 at EtonHouse Broadrick in June 2026, kindly complete the online withdrawal form below at your earliest convenience, indicating Emma\'s last day of school as 17 June 2026.',
    priority: 'normal',
    readCount: 1,
    totalAudience: 1,
    actionItem: {
      type: 'signature_required',
      dueDate: '2026-06-17',
      isCompleted: false,
      buttonLabel: 'Complete Form',
    },
  },
  {
    id: 'post_newsletter',
    type: 'ingested_email',
    authorId: 'u_admin',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(5),
    title: 'Broadrick Principal\'s Newsletter — Term 3 Week 9',
    content: 'Key highlights from the latest eNewsletter covering school events and important updates for AY 2025/2026.',
    bulletSummary: [
      'School Art Exhibition on 28 March — parents welcome from 2–4 pm.',
      'Term 3 reports distributed to parents on 4 April.',
      'Updated drop-off procedures start next Monday — use Gate B only.',
      'Y5-Y6 inter-school sports day on 2 April at Kallang.',
      'Canteen menu refresh: new healthy options from next week.',
    ],
    fullContent: `Dear Parents and Guardians,

Welcome to the Term 3 Week 9 edition of the Broadrick Principal's Newsletter.

School Art Exhibition
We are delighted to invite you to our annual School Art Exhibition on Friday 28 March, from 2:00 pm to 4:00 pm. Students from all year groups have been working hard on their pieces, and we look forward to showcasing their creativity. Light refreshments will be provided.

Term 3 Reports
Term 3 academic reports will be distributed to parents on Friday 4 April. Please look out for these in your child's school bag. If you have any questions about the report, do reach out to your child's form teacher to arrange a conversation.

Updated Drop-Off Procedures
Starting Monday 24 March, all morning drop-offs should use Gate B (the side gate along Broadrick Road). Gate A will be reserved for bus arrivals only. This change is to improve pedestrian safety during peak hours. A map is attached for reference.

Inter-School Sports Day
Our Year 5 and Year 6 students will represent Broadrick at the inter-school sports day on Wednesday 2 April at the Kallang Sports Hub. Permission forms were sent home last week — please return them by 26 March if you haven't already. Go Broadrick!

Canteen Menu Refresh
We are excited to share that the school canteen will introduce a new range of healthy meal options from next week. The updated menu focuses on balanced nutrition while keeping the favourites your children love.

Thank you for your continued support.

Warm regards,
Ms Rachel Tan
Principal, EtonHouse Broadrick International School`,
    priority: 'normal',
    readCount: 35,
    totalAudience: 55,
  },
  {
    id: 'post_camp',
    type: 'admin_announcement',
    authorId: 'u_teacher_tsoi',
    targetAudiences: { classIds: ['cls_y6_jaguars'] },
    timestamp: daysAgo(3),
    title: 'Y6 Camp — Next Week (Tuesday-Thursday)',
    summary: 'Check camp checklist is packed • No classes Tuesday if not attending',
    content: 'Reminder: Y6 Camp is next week. The class travels from Tuesday. Please ensure your child has packed everything on the camp checklist. If your child is not attending, please keep them home on Tuesday as no classes will run.',
    priority: 'important',
    readCount: 10,
    totalAudience: 12,
    actionItem: {
      type: 'acknowledgement',
      dueDate: daysFromNow(3),
      isCompleted: false,
      buttonLabel: 'Noted',
    },
  },
  {
    id: 'post_swim',
    type: 'teacher_post',
    authorId: 'u_teacher_lim',
    targetAudiences: { classIds: ['cls_y4_penguins'] },
    timestamp: daysAgo(0),
    title: 'Swimming Reminder — George\'s Class',
    summary: 'Thursday — bring goggles, swim cap, and towel',
    content: 'Hi parents! Swimming is on Thursday this week. Please make sure your child brings goggles, swim cap, and a towel. Thank you!',
    priority: 'normal',
    reactions: [{type: '👍', count: 8, userReacted: true}],
    readCount: 11,
    totalAudience: 12,
  },
];

/* ===== Calendar Events ===== */
export const calendarEvents: CalendarEvent[] = [
  {
    id: 'evt_raya_dress',
    title: 'Hari Raya Dress-Up Day',
    description: 'All students invited to wear traditional Hari Raya attire or vibrant outfits. No assembly today.',
    location: 'EtonHouse Broadrick',
    startTime: daysFromNow(1),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(15); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { schoolWide: true },
  },
  {
    id: 'evt_raya_ph',
    title: 'Hari Raya PH in Lieu — NO SCHOOL',
    description: 'School closed for Hari Raya public holiday in lieu.',
    startTime: daysFromNow(2),
    endTime: daysFromNow(2),
    isAllDay: true,
    targetAudiences: { schoolWide: true },
  },
  {
    id: 'evt_y6_camp',
    title: 'Y6 Camp',
    description: 'Year 6 camp. Class travels from Tuesday. Check camp checklist.',
    location: 'Outward Bound',
    startTime: daysFromNow(4),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 6); d.setHours(15); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { classIds: ['cls_y6_jaguars'] },
  },
  {
    id: 'evt_swim',
    title: 'Swimming — PE',
    description: 'Remember goggles, cap, and towel.',
    location: 'School Pool',
    startTime: daysFromNow(2),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(11); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { classIds: ['cls_y4_penguins'] },
  },
  {
    id: 'evt_ptc',
    title: 'Parent-Teacher Conference',
    description: 'Book a 15-minute slot with Ms. Tsoi to discuss Emma\'s progress.',
    location: 'Room Y6, Main Building',
    startTime: daysFromNow(14),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 14); d.setHours(16); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { classIds: ['cls_y6_jaguars'] },
    bookingDetails: { isBookable: true, teacherId: 'u_teacher_tsoi' },
  },
];

/* ===== Conversations & Messages ===== */
export const conversations: Conversation[] = [
  {
    id: 'conv_emma',
    participantIds: ['u_parent_jack', 'u_teacher_tsoi'],
    studentId: 'stu_emma',
    lastMessage: { id: 'msg_3', conversationId: 'conv_emma', senderId: 'u_parent_jack', content: 'Also, as Emma won\'t be joining Camp next week — should I keep her home on Tuesday?', timestamp: todayAt(10, 50), isRead: false },
    unreadCount: 0,
  },
  {
    id: 'conv_george',
    participantIds: ['u_parent_jack', 'u_teacher_lim'],
    studentId: 'stu_george',
    lastMessage: { id: 'msg_6', conversationId: 'conv_george', senderId: 'u_teacher_lim', content: 'It shows! He\'s one of the strongest swimmers in the class now. 🏊', timestamp: todayAt(8, 30), isRead: false },
    unreadCount: 0,
  },
];

export const allMessages: Record<string, Message[]> = {
  conv_emma: [
    { id: 'msg_1', conversationId: 'conv_emma', senderId: 'u_parent_jack', content: 'Hi Ms Tsoi, as with past Wednesdays, I\'ll pick Emma up at 2:30pm today.', timestamp: todayAt(10, 19), isRead: true },
    { id: 'msg_2', conversationId: 'conv_emma', senderId: 'u_teacher_tsoi', content: 'Hi Jack, thanks for letting us know. Noted that Emma will leave at 2:30. Have a great day!', timestamp: todayAt(10, 45), isRead: true },
    { id: 'msg_3', conversationId: 'conv_emma', senderId: 'u_parent_jack', content: 'Also, as Emma won\'t be joining Camp next week — should I keep her home on Tuesday?', timestamp: todayAt(10, 50), isRead: false },
  ],
  conv_george: [
    { id: 'msg_4', conversationId: 'conv_george', senderId: 'u_teacher_lim', content: 'Hi Jack! George did really well in swimming today — his backstroke is improving a lot!', timestamp: daysAgo(1), isRead: true },
    { id: 'msg_5', conversationId: 'conv_george', senderId: 'u_parent_jack', content: 'That\'s great to hear! He\'s been practising on weekends too.', timestamp: daysAgo(1), isRead: true },
    { id: 'msg_6', conversationId: 'conv_george', senderId: 'u_teacher_lim', content: 'It shows! He\'s one of the strongest swimmers in the class now. 🏊', timestamp: todayAt(8, 30), isRead: false },
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
  if (id === staffWendy.id) return staffWendy;
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
