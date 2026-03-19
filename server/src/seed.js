/**
 * Seed script — populates SQLite with real EtonHouse Broadrick data.
 * Run: node src/seed.js
 */
import db from './db.js';

// ===== Date Helpers =====
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}
function todayAt(hour, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
function daysFromNowAt(n, hour) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

// ===== Reset and Seed =====
console.log('🌱 Seeding SchoolOS database (EtonHouse Broadrick)...');

// Clear all tables
const tables = [
  'messages', 'conversation_participants', 'conversations',
  'booking_slots', 'calendar_events',
  'reactions', 'action_responses', 'read_receipts', 'feed_items',
  'user_settings', 'teacher_classes', 'class_students', 'student_parents',
  'students', 'classes', 'users', 'ingested_emails'
];
for (const t of tables) {
  db.exec(`DELETE FROM ${t}`);
}

// ===== Users =====
const insertUser = db.prepare(`INSERT INTO users (id, role, first_name, last_name, language_preference) VALUES (?, ?, ?, ?, ?)`);

insertUser.run('u_admin', 'admin', 'EtonHouse', 'Broadrick', 'en');
insertUser.run('u_teacher_tsoi', 'teacher', 'Andrea', 'Tsoi', 'en');
insertUser.run('u_teacher_lim', 'teacher', 'Grace', 'Lim', 'en');
insertUser.run('u_staff_wendy', 'admin', 'Wendy', 'Tan', 'en');
insertUser.run('u_parent_jack', 'parent', 'Jack', 'Turner', 'en');
insertUser.run('u_parent_saeko', 'parent', 'Saeko', 'Turner', 'en');

// ===== Classes =====
const insertClass = db.prepare(`INSERT INTO classes (id, name, teacher_id, school_year) VALUES (?, ?, ?, ?)`);
insertClass.run('cls_y6_jaguars', 'Y6 — Jaguars', 'u_teacher_tsoi', '2025-2026');
insertClass.run('cls_y4_penguins', 'Y4 — Penguins', 'u_teacher_lim', '2025-2026');

// ===== Students =====
const insertStudent = db.prepare(`INSERT INTO students (id, first_name, last_name, grade_str, class_id) VALUES (?, ?, ?, ?, ?)`);
insertStudent.run('stu_emma', 'Emma', 'Turner', 'Year 6', 'cls_y6_jaguars');
insertStudent.run('stu_george', 'George', 'Turner', 'Year 4', 'cls_y4_penguins');

// ===== Relationships =====
const insertStudentParent = db.prepare(`INSERT INTO student_parents (student_id, parent_id) VALUES (?, ?)`);
insertStudentParent.run('stu_emma', 'u_parent_jack');
insertStudentParent.run('stu_emma', 'u_parent_saeko');
insertStudentParent.run('stu_george', 'u_parent_jack');
insertStudentParent.run('stu_george', 'u_parent_saeko');

const insertClassStudent = db.prepare(`INSERT INTO class_students (class_id, student_id) VALUES (?, ?)`);
insertClassStudent.run('cls_y6_jaguars', 'stu_emma');
insertClassStudent.run('cls_y4_penguins', 'stu_george');

const insertTeacherClass = db.prepare(`INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)`);
insertTeacherClass.run('u_teacher_tsoi', 'cls_y6_jaguars');
insertTeacherClass.run('u_teacher_lim', 'cls_y4_penguins');

// ===== Feed Items — Real emails from ingestion =====
const insertFeed = db.prepare(`
  INSERT INTO feed_items (id, type, author_id, title, content, media_urls, priority, 
    school_wide, target_class_ids, target_student_ids, read_count, total_audience,
    action_type, action_due_date, action_button_label, action_is_completed,
    original_source, ingestion_status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// 1. Hari Raya Dress-Up Day (from real email + image)
insertFeed.run('post_raya', 'ingested_email', 'u_admin',
  'Hari Raya Dress-Up Day — Tomorrow 19 March',
  'On this special day, there will be no Assembly, but we invite all students to don their traditional Hari Raya attire or vibrant outfits! Our school\'s Hari Raya PH in lieu is on 20th March (Friday) — there will be NO school that day.',
  JSON.stringify(['/uploads/1773806602783_cdxf.png']), 'important', 1, '[]', '[]', 0, 0,
  null, null, null, 0,
  'Email from EtonHouse Broadrick', 'approved', daysAgo(1));

// 2. Early pick up (from real email)
insertFeed.run('post_pickup', 'ingested_email', 'u_teacher_tsoi',
  'Early Pick Up — Emma leaving at 2:30pm today',
  'Hi Ms Tsoi, PLO team — As with past Wednesdays, I\'ll pick Emma up at 2:30pm today. Also, as Emma will not join the Camp next week, and given that the rest of the class travels from Tuesday, I\'m assuming I should just keep her home on Tuesday?',
  '[]', 'urgent', 0, JSON.stringify(['cls_y6_jaguars']), JSON.stringify(['stu_emma']), 1, 1,
  null, null, null, 0,
  'Email from jack.nz@gmail.com', 'approved', todayAt(10, 19));

// 3. Withdrawal Notice - Emma (from real email)
insertFeed.run('post_withdrawal', 'ingested_email', 'u_staff_wendy',
  'Withdrawal Notice — Emma Turner (Y6 Jaguars)',
  'Dear Jack and Saeko, as Emma will be completing Year 6 at EtonHouse Broadrick in June 2026, kindly complete the online withdrawal form below at your earliest convenience, indicating Emma\'s last day of school as 17 June 2026.',
  '[]', 'normal', 0, '[]', JSON.stringify(['stu_emma']), 1, 1,
  'signature_required', '2026-06-17', 'Complete Form', 0,
  'Email from Wendy Tan (EtonHouse Group)', 'approved', daysAgo(30));

// 4. Principal's Newsletter (from real email)
insertFeed.run('post_newsletter', 'ingested_email', 'u_admin',
  'Broadrick Principal\'s Newsletter — Term 3 Week 9',
  'The latest eNewsletter from EtonHouse Broadrick International School covering school highlights, upcoming events, and important updates for AY 2025/2026.',
  '[]', 'normal', 1, '[]', '[]', 0, 0,
  null, null, null, 0,
  'Email from broadrick@etonhouse.edu.sg', 'approved', daysAgo(5));

// 5. Y6 Camp Next Week (derived from early pickup email context)
insertFeed.run('post_camp', 'admin_announcement', 'u_teacher_tsoi',
  'Y6 Camp — Next Week (Tuesday-Thursday)',
  'Reminder: Y6 Camp is next week. The class travels from Tuesday. Please ensure your child has packed everything on the camp checklist. If your child is not attending, please keep them home on Tuesday as no classes will run.',
  '[]', 'important', 0, JSON.stringify(['cls_y6_jaguars']), '[]', 0, 0,
  'acknowledgement', daysFromNow(3), 'Noted', 0,
  null, null, daysAgo(3));

// 6. Swimming reminder (practical ongoing item)
insertFeed.run('post_swim', 'teacher_post', 'u_teacher_lim',
  'Swimming Reminder — George\'s Class',
  'Hi parents! Swimming is on Thursday this week. Please make sure your child brings goggles, swim cap, and a towel. Thank you!',
  '[]', 'normal', 0, JSON.stringify(['cls_y4_penguins']), '[]', 0, 0,
  null, null, null, 0,
  null, null, daysAgo(0));

// ===== Reactions =====
const insertReaction = db.prepare(`INSERT INTO reactions (id, feed_item_id, user_id, type) VALUES (?, ?, ?, ?)`);
insertReaction.run('r1', 'post_raya', 'u_parent_jack', '👍');
insertReaction.run('r2', 'post_swim', 'u_parent_jack', '👍');

// ===== Calendar Events =====
const insertEvent = db.prepare(`
  INSERT INTO calendar_events (id, title, description, location, start_time, end_time, is_all_day, school_wide, target_class_ids, is_bookable, booking_teacher_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertEvent.run('evt_raya_dress', 'Hari Raya Dress-Up Day',
  'All students invited to wear traditional Hari Raya attire or vibrant outfits. No assembly today.',
  'EtonHouse Broadrick', daysFromNow(1), daysFromNowAt(1, 15), 0, 1, '[]', 0, null);

insertEvent.run('evt_raya_ph', 'Hari Raya PH in Lieu — NO SCHOOL',
  'School closed for Hari Raya public holiday in lieu.',
  null, daysFromNow(2), daysFromNow(2), 1, 1, '[]', 0, null);

insertEvent.run('evt_y6_camp', 'Y6 Camp',
  'Year 6 camp. Class travels from Tuesday. Check camp checklist.',
  'Outward Bound', daysFromNow(4), daysFromNowAt(6, 15), 0, 0, JSON.stringify(['cls_y6_jaguars']), 0, null);

insertEvent.run('evt_swim', 'Swimming — PE',
  'Remember goggles, cap, and towel.',
  'School Pool', daysFromNow(2), daysFromNowAt(2, 11), 0, 0, JSON.stringify(['cls_y4_penguins']), 0, null);

insertEvent.run('evt_ptc', 'Parent-Teacher Conference',
  "Book a 15-minute slot with Ms. Tsoi to discuss Emma's progress.",
  'Room Y6, Main Building', daysFromNow(14), daysFromNowAt(14, 16), 0, 0,
  JSON.stringify(['cls_y6_jaguars']), 1, 'u_teacher_tsoi');

// ===== Conversations & Messages =====
const insertConv = db.prepare(`INSERT INTO conversations (id, student_id, updated_at) VALUES (?, ?, ?)`);
const insertParticipant = db.prepare(`INSERT INTO conversation_participants (conversation_id, user_id, unread_count) VALUES (?, ?, ?)`);
const insertMsg = db.prepare(`INSERT INTO messages (id, conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)`);

// Conversation 1: Jack + Ms. Tsoi about Emma (early pickup)
insertConv.run('conv_emma', 'stu_emma', todayAt(10, 19));
insertParticipant.run('conv_emma', 'u_parent_jack', 0);
insertParticipant.run('conv_emma', 'u_teacher_tsoi', 0);
insertMsg.run('msg_1', 'conv_emma', 'u_parent_jack',
  'Hi Ms Tsoi, as with past Wednesdays, I\'ll pick Emma up at 2:30pm today.',
  1, todayAt(10, 19));
insertMsg.run('msg_2', 'conv_emma', 'u_teacher_tsoi',
  'Hi Jack, thanks for letting us know. Noted that Emma will leave at 2:30. Have a great day!',
  1, todayAt(10, 45));
insertMsg.run('msg_3', 'conv_emma', 'u_parent_jack',
  'Also, as Emma won\'t be joining Camp next week — should I keep her home on Tuesday?',
  0, todayAt(10, 50));

// Conversation 2: Jack + Ms. Lim about George
insertConv.run('conv_george', 'stu_george', daysAgo(1));
insertParticipant.run('conv_george', 'u_parent_jack', 1);
insertParticipant.run('conv_george', 'u_teacher_lim', 0);
insertMsg.run('msg_4', 'conv_george', 'u_teacher_lim',
  'Hi Jack! George did really well in swimming today — his backstroke is improving a lot!',
  1, daysAgo(1));
insertMsg.run('msg_5', 'conv_george', 'u_parent_jack',
  'That\'s great to hear! He\'s been practising on weekends too.',
  1, daysAgo(1));
insertMsg.run('msg_6', 'conv_george', 'u_teacher_lim',
  'It shows! He\'s one of the strongest swimmers in the class now. 🏊',
  0, todayAt(8, 30));

// ===== User Settings =====
db.prepare(`INSERT INTO user_settings (user_id, push_enabled, email_summary, whatsapp_delivery, quiet_hours_enabled, quiet_hours_start, quiet_hours_end) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  .run('u_parent_jack', 1, 1, 0, 1, '21:00', '07:00');

console.log('✅ Database seeded with real EtonHouse Broadrick data!');
console.log('   - 6 users (EtonHouse admin, Wendy Tan, Andrea Tsoi, Grace Lim, Jack & Saeko Turner)');
console.log('   - 2 students: Emma (Y6 Jaguars), George (Y4 Penguins)');
console.log('   - 6 feed items from real emails');
console.log('   - 5 calendar events (Hari Raya, Camp, Swimming, PTC)');
console.log('   - 2 conversations with 6 messages');

process.exit(0);
