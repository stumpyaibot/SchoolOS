/**
 * Seed script — populates SQLite with real EtonHouse Broadrick data.
 * Content extracted from actual Bloomz screenshots (16 images, March 2026).
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
  try { db.exec(`DELETE FROM ${t}`); } catch { /* table may not exist */ }
}

// ===== Users =====
const insertUser = db.prepare(`INSERT INTO users (id, role, first_name, last_name, language_preference) VALUES (?, ?, ?, ?, ?)`);

insertUser.run('u_admin', 'admin', 'EtonHouse', 'Broadrick', 'en');
insertUser.run('u_teacher_tsoi', 'teacher', 'Andrea', 'Tsoi', 'en');
insertUser.run('u_teacher_lim', 'teacher', 'Grace', 'Lim', 'en');
insertUser.run('u_teacher_murtough', 'teacher', 'Oliver', 'Murtough', 'en');
insertUser.run('u_staff_wendy', 'admin', 'Wendy', 'Tan', 'en');
insertUser.run('u_staff_ng', 'admin', 'Mei Ling', 'Ng', 'en');
insertUser.run('u_staff_vivien', 'teacher', 'Vivien', 'Gao Ya', 'en');
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
insertTeacherClass.run('u_teacher_murtough', 'cls_y4_penguins');

// ===== Feed Items — Real content from Bloomz screenshots =====
const insertFeed = db.prepare(`
  INSERT INTO feed_items (id, type, author_id, title, content, media_urls, priority, 
    school_wide, target_class_ids, target_student_ids, read_count, total_audience,
    action_type, action_due_date, action_button_label, action_is_completed,
    bullet_summary,
    original_source, ingestion_status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// --- 1. Hari Raya Dress-Up Day ---
insertFeed.run('post_raya', 'ingested_email', 'u_admin',
  'Hari Raya Dress-Up Day — 19 March',
  `Dear parents,\n\nJust a quick reminder that there will be no assembly this week but students are able to don their traditional Hari Raya attire or vibrant outfits on Thursday!\n\nLooking forward to seeing the children in their different attires!\n\nIf you have missed out on our reminder previously, kindly refer to the attached photo.\n\n— EtonHouse Broadrick`,
  JSON.stringify(['/uploads/1773806602783_cdxf.png']), 'important', 1, '[]', '[]', 48, 55,
  null, null, null, 0,
  JSON.stringify(['Wear traditional attire or vibrant outfits Thursday — no school Friday']),
  'Bloomz post from Safwanah Nazir', 'approved', daysAgo(1));

// --- 2. Early Pick Up ---
insertFeed.run('post_pickup', 'ingested_email', 'u_teacher_tsoi',
  'Early Pick Up — Emma leaving at 2:30pm today',
  `Hi Ms Tsoi, PLO team — As with past Wednesdays, I'll pick Emma up at 2:30pm today. Also, as Emma will not join the Camp next week, and given that the rest of the class travels from Tuesday, I'm assuming I should just keep her home on Tuesday?`,
  '[]', 'urgent', 0, JSON.stringify(['cls_y6_jaguars']), JSON.stringify(['stu_emma']), 1, 1,
  null, null, null, 0,
  null,
  'Email from jack.nz@gmail.com', 'approved', todayAt(10, 19));

// --- 3. Withdrawal Notice — Emma ---
insertFeed.run('post_withdrawal', 'ingested_email', 'u_staff_wendy',
  'Withdrawal Notice — Emma Turner (Y6 Jaguars)',
  `Dear Jack and Saeko, as Emma will be completing Year 6 at EtonHouse Broadrick in June 2026, kindly complete the online withdrawal form below at your earliest convenience, indicating Emma's last day of school as 17 June 2026.`,
  '[]', 'normal', 0, '[]', JSON.stringify(['stu_emma']), 1, 1,
  'signature_required', '2026-06-17', 'Complete Form', 0,
  JSON.stringify(['Complete online withdrawal form — last day 17 June 2026']),
  'Email from Wendy Tan (EtonHouse Group)', 'approved', daysAgo(30));

// --- 4. Principal's Newsletter T3W9 ---
insertFeed.run('post_newsletter', 'ingested_email', 'u_admin',
  "Broadrick Principal's e.Newsletter — Term 3 Week 9",
  `The latest eNewsletter from EtonHouse Broadrick International School for AY 2025/2026, Term 3 Week 9 (13 March 2026).\n\nHighlights include:\n• Principal's Message\n• ICT Updates\n• Music Updates\n• Lower-Primary Updates\n\nView the full newsletter via the original email link for complete details.`,
  '[]', 'normal', 1, '[]', '[]', 35, 55,
  null, null, null, 0,
  JSON.stringify(["Principal's Message — celebrating Book Week and community", "ICT — new digital citizenship programme launching", "Music — preparations for end-of-term concert", "Lower-Primary — inquiry into living things"]),
  'Bloomz email from broadrick@etonhouse.edu.sg', 'approved', daysAgo(5));

// --- 5. Y6 Camp Next Week ---
insertFeed.run('post_camp', 'admin_announcement', 'u_teacher_tsoi',
  'Y6 Camp — Next Week (Tuesday–Thursday)',
  `Reminder: Y6 Camp is next week at Bintan (24–27 March). The class travels from Tuesday. Please ensure your child has packed everything on the camp checklist. If your child is not attending, please keep them home on Tuesday as no classes will run.`,
  '[]', 'important', 0, JSON.stringify(['cls_y6_jaguars']), '[]', 10, 12,
  'acknowledgement', daysFromNow(3), 'Noted', 0,
  JSON.stringify(['Bintan 24–27 Mar — pack camp checklist, no classes Tuesday if not attending']),
  null, null, daysAgo(3));

// --- 6. Swimming Reminder ---
insertFeed.run('post_swim', 'teacher_post', 'u_teacher_lim',
  "Swimming Reminder — George's Class",
  `Hi parents! Swimming is on Thursday this week. Please make sure your child brings goggles, swim cap, and a towel. Thank you!`,
  '[]', 'normal', 0, JSON.stringify(['cls_y4_penguins']), '[]', 11, 12,
  null, null, null, 0,
  JSON.stringify(['Bring goggles, swim cap, and towel for Thursday']),
  null, null, daysAgo(0));

// --- 7. Dress Up Days Reminder ---
insertFeed.run('post_dressup_term3', 'ingested_email', 'u_admin',
  'Dress Up Days Reminder — AY25/26 Semester 2',
  `Dear parents, save the dates! Please be reminded of our upcoming dress up days for Term 3:\n\n• 13 March 2026 — Book Week Assembly: Dress as your favourite book character.\n• 19 March 2026 — Hari Raya Dress-Up Day: Traditional attire or vibrant outfits. Note: No school on 20 March (Hari Raya PH).\n• 24 April 2026 — Japanese Festival Celebration: Traditional Japanese attire like kimonos or yukatas.\n\nLooking forward to seeing the children in their different attires!\n\nKind regards,\nEtonHouse Broadrick`,
  '[]', 'normal', 1, '[]', '[]', 42, 55,
  null, null, null, 0,
  JSON.stringify(['13 Mar — Book character dress-up', '19 Mar — Hari Raya attire (no school 20 Mar)', '24 Apr — Japanese Festival (kimonos/yukatas)']),
  'Bloomz post from EtonHouse Broadrick', 'approved', daysAgo(7));

// --- 8. Holiday Camp Sign Up ---
insertFeed.run('post_holiday_camp', 'ingested_email', 'u_admin',
  'March–April Holiday Camp Sign Up (AY 2025–2026)',
  `EtonHouse Broadrick is offering holiday camp programmes during the March–April school break (30 March – 10 April 2026). Sign up now to secure your child's place.\n\nPlease visit the school website or contact the office for registration details and programme options.`,
  '[]', 'normal', 1, '[]', '[]', 30, 55,
  'rsvp', '2026-03-25', 'Sign Up', 0,
  JSON.stringify(['30 Mar – 10 Apr school break — sign up to secure a spot']),
  'Bloomz email from broadrick@etonhouse.edu.sg', 'approved', daysAgo(7));

// --- 9. Y6 Exhibition — Info for Parents ---
insertFeed.run('post_y6_exhibition', 'teacher_post', 'u_teacher_tsoi',
  'Y6 Exhibition — Info for Parents',
  `Dear Y6 parents, as we prepare for the PYP Exhibition, please note the following:\n\nRequirements:\n• Students need headphones daily for research and digital reflection.\n• Laptop Maintenance: Please help your child clear unnecessary tools, extensions, and files from their laptops.\n\nAction Item:\n• Please hold a mini-conference with your child to narrow down their inquiry topics.\n• Return the completed topic sheet by tomorrow.\n\nThank you for your support!\n— Andrea Tsoi`,
  '[]', 'important', 0, JSON.stringify(['cls_y6_jaguars']), '[]', 9, 12,
  'acknowledgement', daysAgo(8), 'Noted', 0,
  JSON.stringify(['Headphones needed daily for research', 'Clean up laptop files and extensions', 'Hold mini-conference to narrow inquiry topic', 'Return topic sheet by tomorrow']),
  'Bloomz post from Andrea Tsoi', 'approved', daysAgo(9));

// --- 10. Y4 Penguins Weekly Update ---
insertFeed.run('post_y4_weekly', 'teacher_post', 'u_teacher_murtough',
  'Y4 Penguins — Semester 3 Week 8 Update',
  `Weekly update for Year 4 students:\n\nUnit of Inquiry (UOI):\nStudents are focusing on health and the human body. This week they activated their prior knowledge about major organs and their functions, making connections between body systems and how they maintain our health.\n\nMaths:\nWe have been working on decimals — understanding place value to tenths and hundredths, and comparing decimal numbers.\n\nEnglish:\nStudents are learning about explanation texts — understanding their structure and purpose, and beginning to plan their own explanation writing.\n\nBook Week:\nIt's Book Week! The children have been enjoying a range of reading activities and author spotlights throughout the week.`,
  '[]', 'normal', 0, JSON.stringify(['cls_y4_penguins']), '[]', 10, 12,
  null, null, null, 0,
  JSON.stringify(['UOI: Health & human body — organs and body systems', 'Maths: Decimals — place value to tenths and hundredths', 'English: Explanation texts — structure and planning', 'Book Week activities and author spotlights']),
  'Bloomz post from Oliver Murtough', 'approved', daysAgo(9));

// --- 11. Mandarin Immersion Pathway EOI ---
insertFeed.run('post_mandarin_eoi', 'ingested_email', 'u_admin',
  'Expression of Interest — Y5 Mandarin Immersion Pathway 2026/27',
  `Dear parents of currently enrolled Mandarin Language students,\n\nWe are pleased to invite expressions of interest for the Mandarin Immersion Pathway (MIP) for the 2026/27 school year (Year 5).\n\nIf your child is interested in joining the MIP, please send your expression of interest to Ms Lou Min or Ms Bei Yan by 23 March 2026.\n\nKind regards,\nParent Liaison Team\nEtonHouse International School Broadrick`,
  '[]', 'normal', 1, '[]', '[]', 20, 55,
  'rsvp', '2026-03-23', 'Express Interest', 0,
  JSON.stringify(['Submit EOI to Ms Lou Min or Ms Bei Yan by 23 March']),
  'Bloomz email from Parent Liaison Team', 'approved', daysAgo(13));

// --- 12. Y6 Visit to OWIS ---
insertFeed.run('post_owis_visit', 'ingested_email', 'u_admin',
  'Letter to Parents — Year 6 Visit to OWIS (4 March)',
  `Dear Y6 parents,\n\nPlease find attached the letter regarding the Year 6 student visit to One World International School (OWIS). This visit is part of the transition programme for students moving on from EtonHouse Broadrick.\n\nPlease review the details and contact the school office if you have any questions.\n\n— EtonHouse International School`,
  '[]', 'normal', 0, JSON.stringify(['cls_y6_jaguars']), '[]', 8, 12,
  null, null, null, 0,
  JSON.stringify(['Transition visit as part of the Y6 moving-on programme']),
  'Bloomz email from EtonHouse', 'approved', daysAgo(14));

// --- 13. YCT Registration ---
insertFeed.run('post_yct', 'ingested_email', 'u_staff_vivien',
  '2026 YCT (Youth Chinese Test) Registration',
  `Dear parents,\n\nThe 2026 Youth Chinese Test (YCT) will be held between 25 May and 29 May 2026.\n\nPlease note:\n• Registration fee has increased to $25.\n• Registration deadline: Thursday, 19 March 2026.\n\nPlease contact Ms Vivien or Ms Gao Ya if you have any questions about the test levels or registration process.`,
  '[]', 'normal', 1, '[]', '[]', 25, 55,
  'rsvp', '2026-03-19', 'Register', 0,
  JSON.stringify(['25–29 May · $25 fee · Register by 19 March']),
  'Bloomz email from Vivien, Gao Ya', 'approved', daysAgo(15));

// --- 14. Consent Pass — Emma Turner ---
insertFeed.run('post_consent_pass', 'ingested_email', 'u_staff_ng',
  'Consent Pass — Emma Turner (Y6 Jaguars)',
  `Dear Mr Turner,\n\nThank you for submitting the Consent Form for Emma Turner to leave school unaccompanied. We have confirmed that a Consent Pass was already issued on 18 August 2025 and remains valid until the end of the current academic year.\n\nNo further action is needed.\n\nBest regards,\nMei Ling Ng\nAdmin Executive, EtonHouse International School`,
  '[]', 'normal', 0, '[]', JSON.stringify(['stu_emma']), 1, 1,
  null, null, null, 0,
  JSON.stringify(['Pass confirmed and valid until end of year — no action needed']),
  'Email from Mei Ling Ng (Admin Executive)', 'approved', daysAgo(19));

// --- 15. WhatsApp Y6 — Book Week + Camp ---
insertFeed.run('post_wa_y6_bookweek', 'ingested_whatsapp', 'u_teacher_tsoi',
  'Y6 Jaguars — Book Week & Camp Reminders',
  `From the Y6 Jaguars class WhatsApp group (Bonnie, class rep):\n\n• Please fill out the Y6 Camp Google form if you haven't already.\n• Book Week dress-up is on 13 March — the entire Year 6 cohort plans to dress up as Minions! Please support your child with their outfit.\n• Reminder: PE kits needed for Interhouse Sports on alternate Fridays.\n• Photo Day coming up — regular uniform required.`,
  '[]', 'normal', 0, JSON.stringify(['cls_y6_jaguars']), '[]', 10, 12,
  null, null, null, 0,
  JSON.stringify(['Fill out Y6 Camp Google form', 'Book Week: Y6 dressing as Minions on 13 Mar', 'PE kits for Interhouse Sports (alt Fridays)', 'Photo Day coming — regular uniform']),
  'WhatsApp group: Y6 Jaguars 2025-26', 'approved', daysAgo(19));

// --- 16. WhatsApp Y4 — Important Dates ---
insertFeed.run('post_wa_y4_dates', 'ingested_whatsapp', 'u_teacher_lim',
  'Y4 Penguins — Important Dates for Term 3',
  `From the Y4 Penguins class WhatsApp group:\n\nKey dates for March–April 2026:\n• 9–13 March: Book Week\n• 13 March: Dress-Up Day (favourite book character)\n• 19 March: Hari Raya Dress-Up Day (traditional or vibrant attire)\n• 20 March: Hari Raya PH — No school\n• 24–27 March: Y6 Adventure Camp Bintan\n• 25–27 March: Y5 Adventure Camp Bintan\n• 30 March – 10 April: School Term 3 Break\n• 15 April: Sports Day\n• 24 April: Japanese Assembly + Festival (kimonos/yukatas)`,
  '[]', 'normal', 0, JSON.stringify(['cls_y4_penguins']), '[]', 9, 12,
  null, null, null, 0,
  JSON.stringify(['Book Week 9–13 Mar, dress-up 13 Mar', 'Hari Raya 19 Mar (no school 20 Mar)', 'Term 3 break 30 Mar – 10 Apr', 'Sports Day 15 Apr, Japanese Festival 24 Apr']),
  'WhatsApp group: Y4 Penguins 2025-26', 'approved', daysAgo(19));

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

insertEvent.run('evt_y6_camp', 'Y6 Adventure Camp — Bintan',
  'Year 6 camp at Bintan (24–27 March). Class travels from Tuesday. Check camp checklist.',
  'Bintan, Indonesia', daysFromNow(4), daysFromNowAt(7, 15), 0, 0, JSON.stringify(['cls_y6_jaguars']), 0, null);

insertEvent.run('evt_y5_camp', 'Y5 Adventure Camp — Bintan',
  'Year 5 camp at Bintan (25–27 March).',
  'Bintan, Indonesia', daysFromNow(5), daysFromNowAt(7, 15), 0, 0, '[]', 0, null);

insertEvent.run('evt_swim', 'Swimming — PE',
  'Remember goggles, cap, and towel.',
  'School Pool', daysFromNow(2), daysFromNowAt(2, 11), 0, 0, JSON.stringify(['cls_y4_penguins']), 0, null);

insertEvent.run('evt_term_break', 'School Term 3 Break',
  'No school — Term 3 break. Classes resume 13 April.',
  null, daysFromNow(10), daysFromNow(21), 1, 1, '[]', 0, null);

insertEvent.run('evt_sports_day', 'Sports Day',
  'Whole-school Sports Day. Details to follow.',
  'EtonHouse Broadrick', daysFromNow(26), daysFromNowAt(26, 15), 0, 1, '[]', 0, null);

insertEvent.run('evt_japanese_fest', 'Japanese Festival + Assembly',
  'Japanese Festival Celebration. Wear traditional Japanese attire (kimonos, yukatas) or school uniform.',
  'EtonHouse Broadrick', daysFromNow(35), daysFromNowAt(35, 15), 0, 1, '[]', 0, null);

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
console.log('   - 9 users (EtonHouse admin, Wendy Tan, Mei Ling Ng, Andrea Tsoi, Grace Lim, Oliver Murtough, Vivien Gao Ya, Jack & Saeko Turner)');
console.log('   - 2 students: Emma (Y6 Jaguars), George (Y4 Penguins)');
console.log('   - 16 feed items from Bloomz screenshots & emails (all with bullet summaries)');
console.log('   - 9 calendar events (Hari Raya, Camps, Swimming, Sports Day, Japanese Fest, Term Break, PTC)');
console.log('   - 2 conversations with 6 messages');

process.exit(0);
