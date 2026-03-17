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

/* ===== Expanded Class Roster for 4B ===== */
export const class4BStudents: Student[] = [
  { id: 'stu_leo_1', firstName: 'Leo', lastName: 'Smith', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_jack'] },
  { id: 'stu_ethan_3', firstName: 'Ethan', lastName: 'Lim', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_lim'] },
  { id: 'stu_chloe_4', firstName: 'Chloe', lastName: 'Tan', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_tan_p'] },
  { id: 'stu_aiden_5', firstName: 'Aiden', lastName: 'Wong', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_wong'] },
  { id: 'stu_sophia_6', firstName: 'Sophia', lastName: 'Chen', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_chen_p'] },
  { id: 'stu_ryan_7', firstName: 'Ryan', lastName: 'Ng', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_ng'] },
  { id: 'stu_emma_8', firstName: 'Emma', lastName: 'Lee', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_lee'] },
  { id: 'stu_jayden_9', firstName: 'Jayden', lastName: 'Ong', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_ong'] },
  { id: 'stu_hana_10', firstName: 'Hana', lastName: 'Sato', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_sato'] },
  { id: 'stu_lucas_11', firstName: 'Lucas', lastName: 'Kumar', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_kumar'] },
  { id: 'stu_olivia_12', firstName: 'Olivia', lastName: 'Goh', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_goh'] },
  { id: 'stu_noah_13', firstName: 'Noah', lastName: 'Teo', gradeStr: 'Grade 4', classId: 'cls_4b', parentIds: ['u_parent_teo'] },
];

/* ===== Current Teacher (Mr. Tan) ===== */
export const currentTeacher: User = {
  id: 'u_teacher_tan',
  role: 'teacher',
  firstName: 'Mr.',
  lastName: 'Tan',
  languagePreference: 'en',
  classIds: ['cls_4b'],
};

/* ===== Teacher Conversations — relative timestamps ===== */
export const teacherConversations: Conversation[] = [
  {
    id: 'conv_1',
    participantIds: ['u_teacher_tan', 'u_parent_jack'],
    studentId: 'stu_leo_1',
    lastMessage: { id: 'msg_3', conversationId: 'conv_1', senderId: 'u_parent_jack', content: 'Thanks for the update on Leo!', timestamp: todayAt(15, 30), isRead: false },
    unreadCount: 1,
  },
  {
    id: 'tconv_2',
    participantIds: ['u_teacher_tan', 'u_parent_lim'],
    studentId: 'stu_ethan_3',
    lastMessage: { id: 'tmsg_1', conversationId: 'tconv_2', senderId: 'u_parent_lim', content: 'Ethan will be absent tomorrow — doctor appointment.', timestamp: todayAt(14), isRead: false },
    unreadCount: 1,
  },
  {
    id: 'tconv_3',
    participantIds: ['u_teacher_tan', 'u_parent_wong'],
    studentId: 'stu_aiden_5',
    lastMessage: { id: 'tmsg_2', conversationId: 'tconv_3', senderId: 'u_teacher_tan', content: 'Aiden did a fantastic presentation today!', timestamp: todayAt(10, 15), isRead: true },
    unreadCount: 0,
  },
];

export const teacherMessages: Record<string, Message[]> = {
  conv_1: [
    { id: 'msg_1', conversationId: 'conv_1', senderId: 'u_parent_jack', content: 'Hi Mr. Tan, how is Leo doing in class this week?', timestamp: todayAt(9), isRead: true },
    { id: 'msg_2', conversationId: 'conv_1', senderId: 'u_teacher_tan', content: 'Hi Jack! He\'s doing great. Very engaged in the creative writing topic.', timestamp: todayAt(12, 15), isRead: true },
    { id: 'msg_3', conversationId: 'conv_1', senderId: 'u_parent_jack', content: 'Thanks for the update on Leo!', timestamp: todayAt(15, 30), isRead: false },
  ],
  tconv_2: [
    { id: 'tmsg_1', conversationId: 'tconv_2', senderId: 'u_parent_lim', content: 'Ethan will be absent tomorrow — doctor appointment.', timestamp: todayAt(14), isRead: false },
  ],
  tconv_3: [
    { id: 'tmsg_2', conversationId: 'tconv_3', senderId: 'u_teacher_tan', content: 'Aiden did a fantastic presentation today!', timestamp: todayAt(10, 15), isRead: true },
    { id: 'tmsg_3', conversationId: 'tconv_3', senderId: 'u_parent_wong', content: 'That\'s wonderful to hear! Thank you.', timestamp: todayAt(11), isRead: true },
  ],
};

/* ===== Teacher Recent Posts — relative timestamps + read tracking ===== */
export const teacherRecentPosts = [
  {
    id: 'tp_1',
    type: 'student_work' as const,
    studentId: 'stu_leo_1',
    title: 'Leo\'s Creative Writing — Imaginary Planets',
    content: 'Leo created an incredible story about a planet with three suns and talking animals! 🌍',
    timestamp: todayAt(14),
    mediaUrl: '/images/creative_writing.jpg',
    readCount: 10,
    totalAudience: 12,
    reactions: 17,
  },
  {
    id: 'tp_2',
    type: 'class_update' as const,
    title: 'Class 4B — Swimming Reminder',
    content: 'Reminder: Swimming is this Thursday. Please bring goggles, swim cap, and towel.',
    timestamp: daysAgo(0),
    readCount: 11,
    totalAudience: 12,
    reactions: 8,
  },
  {
    id: 'tp_3',
    type: 'student_work' as const,
    studentId: 'stu_chloe_4',
    title: 'Chloe\'s Maths Challenge — Perfect Score!',
    content: 'Chloe got full marks on the fractions challenge today. Really impressive work! 🌟',
    timestamp: daysAgo(1),
    readCount: 1,
    totalAudience: 1,
    reactions: 4,
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
  u_parent_jack: 'Jack Smith',
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
  return class4BStudents.find(s => s.id === id);
}
