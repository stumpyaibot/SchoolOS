import type { Student, User, Conversation, Message } from '../types';

/* ===== Date helpers (same pattern as mockData) ===== */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}
function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/* ===== Expanded Class Roster for Y6 Jaguars ===== */
export const classY6Students: Student[] = [
  { id: 'stu_emma', firstName: 'Emma', lastName: 'Turner', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_jack', 'u_parent_saeko'] },
  { id: 'stu_ethan_3', firstName: 'Ethan', lastName: 'Lim', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_lim'] },
  { id: 'stu_chloe_4', firstName: 'Chloe', lastName: 'Tan', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_tan_p'] },
  { id: 'stu_aiden_5', firstName: 'Aiden', lastName: 'Wong', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_wong'] },
  { id: 'stu_sophia_6', firstName: 'Sophia', lastName: 'Chen', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_chen_p'] },
  { id: 'stu_ryan_7', firstName: 'Ryan', lastName: 'Ng', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_ng'] },
  { id: 'stu_lily_8', firstName: 'Lily', lastName: 'Lee', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_lee'] },
  { id: 'stu_jayden_9', firstName: 'Jayden', lastName: 'Ong', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_ong'] },
  { id: 'stu_hana_10', firstName: 'Hana', lastName: 'Sato', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_sato'] },
  { id: 'stu_lucas_11', firstName: 'Lucas', lastName: 'Kumar', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_kumar'] },
  { id: 'stu_olivia_12', firstName: 'Olivia', lastName: 'Goh', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_goh'] },
  { id: 'stu_noah_13', firstName: 'Noah', lastName: 'Teo', gradeStr: 'Year 6', classId: 'cls_y6_jaguars', parentIds: ['u_parent_teo'] },
];

/* ===== Current Teacher (Ms. Tsoi) ===== */
export const currentTeacher: User = {
  id: 'u_teacher_tsoi',
  role: 'teacher',
  firstName: 'Andrea',
  lastName: 'Tsoi',
  languagePreference: 'en',
  classIds: ['cls_y6_jaguars'],
};

/* ===== Teacher Conversations — relative timestamps ===== */
export const teacherConversations: Conversation[] = [
  {
    id: 'conv_emma',
    participantIds: ['u_teacher_tsoi', 'u_parent_jack'],
    studentId: 'stu_emma',
    lastMessage: { id: 'msg_3', conversationId: 'conv_emma', senderId: 'u_parent_jack', content: 'Also, as Emma won\'t be joining Camp next week — should I keep her home on Tuesday?', timestamp: todayAt(10, 50), isRead: false },
    unreadCount: 1,
  },
  {
    id: 'tconv_2',
    participantIds: ['u_teacher_tsoi', 'u_parent_lim'],
    studentId: 'stu_ethan_3',
    lastMessage: { id: 'tmsg_1', conversationId: 'tconv_2', senderId: 'u_parent_lim', content: 'Ethan will be absent tomorrow — doctor appointment.', timestamp: todayAt(14), isRead: false },
    unreadCount: 1,
  },
  {
    id: 'tconv_3',
    participantIds: ['u_teacher_tsoi', 'u_parent_wong'],
    studentId: 'stu_aiden_5',
    lastMessage: { id: 'tmsg_2', conversationId: 'tconv_3', senderId: 'u_teacher_tsoi', content: 'Aiden did a fantastic presentation today!', timestamp: todayAt(10, 15), isRead: true },
    unreadCount: 0,
  },
];

export const teacherMessages: Record<string, Message[]> = {
  conv_emma: [
    { id: 'msg_1', conversationId: 'conv_emma', senderId: 'u_parent_jack', content: 'Hi Ms Tsoi, as with past Wednesdays, I\'ll pick Emma up at 2:30pm today.', timestamp: todayAt(10, 19), isRead: true },
    { id: 'msg_2', conversationId: 'conv_emma', senderId: 'u_teacher_tsoi', content: 'Hi Jack, thanks for letting us know. Noted that Emma will leave at 2:30. Have a great day!', timestamp: todayAt(10, 45), isRead: true },
    { id: 'msg_3', conversationId: 'conv_emma', senderId: 'u_parent_jack', content: 'Also, as Emma won\'t be joining Camp next week — should I keep her home on Tuesday?', timestamp: todayAt(10, 50), isRead: false },
  ],
  tconv_2: [
    { id: 'tmsg_1', conversationId: 'tconv_2', senderId: 'u_parent_lim', content: 'Ethan will be absent tomorrow — doctor appointment.', timestamp: todayAt(14), isRead: false },
  ],
  tconv_3: [
    { id: 'tmsg_2', conversationId: 'tconv_3', senderId: 'u_teacher_tsoi', content: 'Aiden did a fantastic presentation today!', timestamp: todayAt(10, 15), isRead: true },
    { id: 'tmsg_3', conversationId: 'tconv_3', senderId: 'u_parent_wong', content: 'That\'s wonderful to hear! Thank you.', timestamp: todayAt(11), isRead: true },
  ],
};

/* ===== Teacher Recent Posts — relative timestamps + read tracking ===== */
export const teacherRecentPosts = [
  {
    id: 'tp_1',
    type: 'admin_announcement' as const,
    title: 'Y6 Camp — Next Week (Tuesday-Thursday)',
    content: 'Reminder: Y6 Camp is next week. Class travels from Tuesday. Please ensure camp checklists are complete.',
    timestamp: daysAgo(3),
    readCount: 10,
    totalAudience: 12,
    reactions: 8,
  },
  {
    id: 'tp_2',
    type: 'student_work' as const,
    studentId: 'stu_sophia_6',
    title: 'Sophia\'s Science Presentation — Outstanding!',
    content: 'Sophia gave an excellent presentation on climate change today. Really impressive research! 🌟',
    timestamp: daysAgo(1),
    readCount: 1,
    totalAudience: 1,
    reactions: 4,
  },
  {
    id: 'tp_3',
    type: 'class_update' as const,
    title: 'Early Pickup — Emma Turner',
    content: 'Emma will be picked up at 2:30pm today. Noted by parent.',
    timestamp: todayAt(10, 19),
    readCount: 1,
    totalAudience: 1,
    reactions: 0,
  },
];

/* ===== Pending Actions for Teacher ===== */
export const teacherPendingActions = {
  unreadMessages: 2,
  unsignedPermissionSlips: 8,
  totalStudents: 12,
  signedPermissionSlips: 4,
};

/* ===== Helper: Get parent name for student ===== */
const parentNames: Record<string, string> = {
  u_parent_jack: 'Jack Turner',
  u_parent_saeko: 'Saeko Turner',
  u_parent_lim: 'Sarah Lim',
  u_parent_tan_p: 'David Tan',
  u_parent_wong: 'Michelle Wong',
  u_parent_chen_p: 'Wei Chen',
  u_parent_ng: 'Amanda Ng',
  u_parent_lee: 'James Lee',
  u_parent_ong: 'Rachel Ong',
  u_parent_sato: 'Yuki Sato',
  u_parent_kumar: 'Raj Kumar',
  u_parent_goh: 'Linda Goh',
  u_parent_teo: 'Daniel Teo',
};

export function getParentName(parentId: string): string {
  return parentNames[parentId] || 'Parent';
}

export function getStudentById(id: string): Student | undefined {
  return classY6Students.find(s => s.id === id);
}
