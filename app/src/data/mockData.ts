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
  u_teacher_murtough: {
    id: 'u_teacher_murtough',
    role: 'teacher',
    firstName: 'Oliver',
    lastName: 'Murtough',
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

const staffNg: User = {
  id: 'u_staff_ng',
  role: 'admin',
  firstName: 'Mei Ling',
  lastName: 'Ng',
  languagePreference: 'en',
};

const staffVivien: User = {
  id: 'u_staff_vivien',
  role: 'teacher',
  firstName: 'Vivien',
  lastName: 'Gao Ya',
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
    { icon: 'logistics', summary: 'No school today — Hari Raya PH in lieu.' },
    { childId: 'stu_emma', icon: 'warning', summary: 'Y6 Camp starts Tuesday at Bintan — Emma not attending. Keep her home Tue–Thu.', sourcePostId: 'post_camp' },
    { childId: 'stu_emma', icon: 'info', summary: 'PYP Exhibition: hold mini-conference with Emma to finalise inquiry topic.', sourcePostId: 'post_y6_exhibition' },
    { childId: 'stu_george', icon: 'logistics', summary: 'Swimming next Thursday — goggles, swim cap, and towel.', sourcePostId: 'post_swim' },
    { icon: 'info', summary: 'Holiday camp sign-up open — 30 Mar to 10 Apr.', sourcePostId: 'post_holiday_camp' },
  ],
};

/* ===== Feed Items — from real Bloomz screenshots ===== */
export const feedItems: FeedItem[] = [
  // 1. Hari Raya Dress-Up Day
  {
    id: 'post_raya',
    type: 'ingested_email',
    authorId: 'u_admin',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(1),
    title: 'Hari Raya Dress-Up Day — 19 March',
    summary: 'No Assembly • Traditional attire or vibrant outfits • No school Friday (PH in lieu)',
    content: 'Dear parents,\n\nJust a quick reminder that there will be no assembly this week but students are able to don their traditional Hari Raya attire or vibrant outfits on Thursday!\n\nLooking forward to seeing the children in their different attires!\n\nIf you have missed out on our reminder previously, kindly refer to the attached photo.\n\n— EtonHouse Broadrick',
    mediaUrls: ['/uploads/1773806602783_cdxf.png'],
    priority: 'important',
    reactions: [{type: '👍', count: 18, userReacted: true}],
    readCount: 48,
    totalAudience: 55,
  },
  // 2. Early Pick Up
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
  // 3. Withdrawal Notice
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
  // 4. Principal's Newsletter
  {
    id: 'post_newsletter',
    type: 'ingested_email',
    authorId: 'u_admin',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(5),
    title: "Broadrick Principal's e.Newsletter — Term 3 Week 9",
    bulletSummary: [
      'Principal\'s Message for AY 2025/2026, Term 3 Week 9.',
      'ICT Updates — latest technology integration news.',
      'Music Updates — upcoming performances and rehearsals.',
      'Lower-Primary Updates — activities and learning highlights.',
    ],
    content: 'The latest eNewsletter from EtonHouse Broadrick International School for AY 2025/2026, Term 3 Week 9 (13 March 2026).',
    fullContent: `The latest eNewsletter from EtonHouse Broadrick International School for AY 2025/2026, Term 3 Week 9 (13 March 2026).

Highlights include:
• Principal's Message
• ICT Updates
• Music Updates
• Lower-Primary Updates

View the full newsletter via the original email link for complete details.`,
    priority: 'normal',
    readCount: 35,
    totalAudience: 55,
  },
  // 5. Y6 Camp
  {
    id: 'post_camp',
    type: 'admin_announcement',
    authorId: 'u_teacher_tsoi',
    targetAudiences: { classIds: ['cls_y6_jaguars'] },
    timestamp: daysAgo(3),
    title: 'Y6 Camp — Next Week (Tuesday–Thursday)',
    summary: 'Check camp checklist is packed • No classes Tuesday if not attending',
    content: 'Reminder: Y6 Camp is next week at Bintan (24–27 March). The class travels from Tuesday. Please ensure your child has packed everything on the camp checklist. If your child is not attending, please keep them home on Tuesday as no classes will run.',
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
  // 6. Swimming Reminder
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
  // 7. Dress Up Days — full Term 3 schedule
  {
    id: 'post_dressup_term3',
    type: 'ingested_email',
    authorId: 'u_admin',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(7),
    title: 'Dress Up Days Reminder — AY25/26 Semester 2',
    bulletSummary: [
      '13 March — Book Week Assembly: Dress as favourite book character.',
      '19 March — Hari Raya Dress-Up Day: Traditional attire or vibrant outfits.',
      '24 April — Japanese Festival: Traditional Japanese attire (kimonos/yukatas).',
    ],
    content: 'Dear parents, save the dates! Please be reminded of our upcoming dress up days for Term 3.\n\n• 13 March 2026 — Book Week Assembly: Dress as your favourite book character.\n• 19 March 2026 — Hari Raya Dress-Up Day: Traditional attire or vibrant outfits. Note: No school on 20 March (Hari Raya PH).\n• 24 April 2026 — Japanese Festival Celebration: Traditional Japanese attire like kimonos or yukatas.\n\nLooking forward to seeing the children in their different attires!\n\nKind regards,\nEtonHouse Broadrick',
    priority: 'normal',
    readCount: 42,
    totalAudience: 55,
  },
  // 8. Holiday Camp Sign Up
  {
    id: 'post_holiday_camp',
    type: 'ingested_email',
    authorId: 'u_admin',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(7),
    title: 'March–April Holiday Camp Sign Up (AY 2025–2026)',
    content: 'EtonHouse Broadrick is offering holiday camp programmes during the March–April school break (30 March – 10 April 2026). Sign up now to secure your child\'s place.\n\nPlease visit the school website or contact the office for registration details and programme options.',
    priority: 'normal',
    readCount: 30,
    totalAudience: 55,
    actionItem: {
      type: 'rsvp',
      dueDate: '2026-03-25',
      isCompleted: false,
      buttonLabel: 'Sign Up',
    },
  },
  // 9. Y6 Exhibition — Info for Parents
  {
    id: 'post_y6_exhibition',
    type: 'teacher_post',
    authorId: 'u_teacher_tsoi',
    targetAudiences: { classIds: ['cls_y6_jaguars'] },
    timestamp: daysAgo(9),
    title: 'Y6 Exhibition — Info for Parents',
    content: 'Dear Y6 parents, as we prepare for the PYP Exhibition, please note the following:\n\nRequirements:\n• Students need headphones daily for research and digital reflection.\n• Laptop Maintenance: Please help your child clear unnecessary tools, extensions, and files from their laptops.\n\nAction Item:\n• Please hold a mini-conference with your child to narrow down their inquiry topics.\n• Return the completed topic sheet by tomorrow.\n\nThank you for your support!\n— Andrea Tsoi',
    priority: 'important',
    readCount: 9,
    totalAudience: 12,
    actionItem: {
      type: 'acknowledgement',
      dueDate: daysAgo(8),
      isCompleted: false,
      buttonLabel: 'Noted',
    },
  },
  // 10. Y4 Penguins Weekly Update
  {
    id: 'post_y4_weekly',
    type: 'teacher_post',
    authorId: 'u_teacher_murtough',
    targetAudiences: { classIds: ['cls_y4_penguins'] },
    timestamp: daysAgo(9),
    title: 'Y4 Penguins — Semester 3 Week 8 Update',
    content: 'Weekly update for Year 4 students:\n\nUnit of Inquiry (UOI):\nStudents are focusing on health and the human body. This week they activated their prior knowledge about major organs and their functions, making connections between body systems and how they maintain our health.\n\nMaths:\nWe have been working on decimals — understanding place value to tenths and hundredths, and comparing decimal numbers.\n\nEnglish:\nStudents are learning about explanation texts — understanding their structure and purpose, and beginning to plan their own explanation writing.\n\nBook Week:\nIt\'s Book Week! The children have been enjoying a range of reading activities and author spotlights throughout the week.',
    priority: 'normal',
    readCount: 10,
    totalAudience: 12,
  },
  // 11. Mandarin Immersion Pathway EOI
  {
    id: 'post_mandarin_eoi',
    type: 'ingested_email',
    authorId: 'u_admin',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(13),
    title: 'Expression of Interest — Y5 Mandarin Immersion Pathway 2026/27',
    content: 'Dear parents of currently enrolled Mandarin Language students,\n\nWe are pleased to invite expressions of interest for the Mandarin Immersion Pathway (MIP) for the 2026/27 school year (Year 5).\n\nIf your child is interested in joining the MIP, please send your expression of interest to Ms Lou Min or Ms Bei Yan by 23 March 2026.\n\nKind regards,\nParent Liaison Team\nEtonHouse International School Broadrick',
    priority: 'normal',
    readCount: 20,
    totalAudience: 55,
    actionItem: {
      type: 'rsvp',
      dueDate: '2026-03-23',
      isCompleted: false,
      buttonLabel: 'Express Interest',
    },
  },
  // 12. Y6 Visit to OWIS
  {
    id: 'post_owis_visit',
    type: 'ingested_email',
    authorId: 'u_admin',
    targetAudiences: { classIds: ['cls_y6_jaguars'] },
    timestamp: daysAgo(14),
    title: 'Letter to Parents — Year 6 Visit to OWIS (4 March)',
    content: 'Dear Y6 parents,\n\nPlease find attached the letter regarding the Year 6 student visit to One World International School (OWIS). This visit is part of the transition programme for students moving on from EtonHouse Broadrick.\n\nPlease review the details and contact the school office if you have any questions.\n\n— EtonHouse International School',
    priority: 'normal',
    readCount: 8,
    totalAudience: 12,
  },
  // 13. YCT Registration
  {
    id: 'post_yct',
    type: 'ingested_email',
    authorId: 'u_staff_vivien',
    targetAudiences: { schoolWide: true },
    timestamp: daysAgo(15),
    title: '2026 YCT (Youth Chinese Test) Registration',
    content: 'Dear parents,\n\nThe 2026 Youth Chinese Test (YCT) will be held between 25 May and 29 May 2026.\n\nPlease note:\n• Registration fee has increased to $25.\n• Registration deadline: Thursday, 19 March 2026.\n\nPlease contact Ms Vivien or Ms Gao Ya if you have any questions about the test levels or registration process.',
    priority: 'normal',
    readCount: 25,
    totalAudience: 55,
    actionItem: {
      type: 'rsvp',
      dueDate: '2026-03-19',
      isCompleted: false,
      buttonLabel: 'Register',
    },
  },
  // 14. Consent Pass — Emma
  {
    id: 'post_consent_pass',
    type: 'ingested_email',
    authorId: 'u_staff_ng',
    targetAudiences: { studentIds: ['stu_emma'] },
    timestamp: daysAgo(19),
    title: 'Consent Pass — Emma Turner (Y6 Jaguars)',
    content: 'Dear Mr Turner,\n\nThank you for submitting the Consent Form for Emma Turner to leave school unaccompanied. We have confirmed that a Consent Pass was already issued on 18 August 2025 and remains valid until the end of the current academic year.\n\nNo further action is needed.\n\nBest regards,\nMei Ling Ng\nAdmin Executive, EtonHouse International School',
    priority: 'normal',
    readCount: 1,
    totalAudience: 1,
  },
  // 15. WhatsApp Y6 — Book Week & Camp Reminders
  {
    id: 'post_wa_y6_bookweek',
    type: 'ingested_whatsapp',
    authorId: 'u_teacher_tsoi',
    targetAudiences: { classIds: ['cls_y6_jaguars'] },
    timestamp: daysAgo(19),
    title: 'Y6 Jaguars — Book Week & Camp Reminders',
    bulletSummary: [
      'Fill out Y6 Camp Google form if not done.',
      'Book Week dress-up on 13 March — entire Y6 dressing as Minions!',
      'PE kits needed for Interhouse Sports (alternate Fridays).',
      'Photo Day coming up — regular uniform.',
    ],
    content: 'From the Y6 Jaguars class WhatsApp group (Bonnie, class rep):\n\n• Please fill out the Y6 Camp Google form if you haven\'t already.\n• Book Week dress-up is on 13 March — the entire Year 6 cohort plans to dress up as Minions! Please support your child with their outfit.\n• Reminder: PE kits needed for Interhouse Sports on alternate Fridays.\n• Photo Day coming up — regular uniform required.',
    priority: 'normal',
    readCount: 10,
    totalAudience: 12,
  },
  // 16. WhatsApp Y4 — Important Dates
  {
    id: 'post_wa_y4_dates',
    type: 'ingested_whatsapp',
    authorId: 'u_teacher_lim',
    targetAudiences: { classIds: ['cls_y4_penguins'] },
    timestamp: daysAgo(19),
    title: 'Y4 Penguins — Important Dates for Term 3',
    bulletSummary: [
      '9–13 March: Book Week.',
      '13 March: Dress-Up Day (favourite book character).',
      '19 March: Hari Raya Dress-Up Day.',
      '20 March: Hari Raya PH — No school.',
      '30 Mar – 10 Apr: School Term 3 Break.',
      '15 April: Sports Day.',
      '24 April: Japanese Assembly + Festival.',
    ],
    content: 'From the Y4 Penguins class WhatsApp group:\n\nKey dates for March–April 2026:\n• 9–13 March: Book Week\n• 13 March: Dress-Up Day (favourite book character)\n• 19 March: Hari Raya Dress-Up Day (traditional or vibrant attire)\n• 20 March: Hari Raya PH — No school\n• 24–27 March: Y6 Adventure Camp Bintan\n• 25–27 March: Y5 Adventure Camp Bintan\n• 30 March – 10 April: School Term 3 Break\n• 15 April: Sports Day\n• 24 April: Japanese Assembly + Festival (kimonos/yukatas)',
    priority: 'normal',
    readCount: 9,
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
    title: 'Y6 Adventure Camp — Bintan',
    description: 'Year 6 camp at Bintan (24–27 March). Class travels from Tuesday. Check camp checklist.',
    location: 'Bintan, Indonesia',
    startTime: daysFromNow(4),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(15); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { classIds: ['cls_y6_jaguars'] },
  },
  {
    id: 'evt_y5_camp',
    title: 'Y5 Adventure Camp — Bintan',
    description: 'Year 5 camp at Bintan (25–27 March).',
    location: 'Bintan, Indonesia',
    startTime: daysFromNow(5),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(15); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { schoolWide: true },
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
    id: 'evt_term_break',
    title: 'School Term 3 Break',
    description: 'No school — Term 3 break. Classes resume 13 April.',
    startTime: daysFromNow(10),
    endTime: daysFromNow(21),
    isAllDay: true,
    targetAudiences: { schoolWide: true },
  },
  {
    id: 'evt_sports_day',
    title: 'Sports Day',
    description: 'Whole-school Sports Day. Details to follow.',
    location: 'EtonHouse Broadrick',
    startTime: daysFromNow(26),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 26); d.setHours(15); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { schoolWide: true },
  },
  {
    id: 'evt_japanese_fest',
    title: 'Japanese Festival + Assembly',
    description: 'Japanese Festival Celebration. Wear traditional Japanese attire (kimonos, yukatas) or school uniform.',
    location: 'EtonHouse Broadrick',
    startTime: daysFromNow(35),
    endTime: (() => { const d = new Date(); d.setDate(d.getDate() + 35); d.setHours(15); return d.toISOString(); })(),
    isAllDay: false,
    targetAudiences: { schoolWide: true },
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
  if (id === staffNg.id) return staffNg;
  if (id === staffVivien.id) return staffVivien;
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
