# SchoolOS — Lessons Learned

## Content Ingestion Principles (2026-03-18)

1. **Summarise long-form content** — newsletters, circulars, etc. should be distilled into tight bullet summaries, with a way to read the full text.
2. **"Kindly note…" ≠ action required** — Informational language like "kindly note", "please be informed", "for your information" should NOT generate acknowledgement action items.
3. **Only create action items for genuine actions** — signatures, RSVPs, form submissions, consent.
4. **Consistency** — All ingested content should follow the same formatting patterns (bullet summaries for long content, plain text for short items, expandable full content for newsletters/circulars).

## Email Ingestion Pipeline (2026-03-18)

5. **Always clean email content** — Strip forwarding headers, email chains (> quoted replies), Bloomz/Mailchimp boilerplate, tracking URLs, and email footers before storing or displaying.
6. **Clean titles** — Remove `Fwd:`, `Re:`, `Post:` prefixes and decode HTML entities.
7. **HTML fallback** — When plain text body is empty (common with Bloomz), extract text from HTML instead.
8. **Multi-image posts = one message, OCR all together** — Bloomz posts with multiple attached images are usually one long post split across screenshots. All images in a single post must be analyzed/OCR'd together and merged into a single `content` field for one feed item. Never treat each image as a separate post, and never use a placeholder like "📸 X images shared" — the real content is inside the images.
9. **Email chain truncation** — Stop at "On ... wrote:" reply boundary. Don't show quoted reply chains.
10. **Conservative action detection** — Only `signature_required` and `rsvp` are valid actions. Never trigger actions from generic words like "sign", "confirm", "noted".
11. **Ingest everything relevant** — Regardless of email format (forwarded Gmail, Bloomz notification, Mailchimp, image-only), if it's school-related, ingest it.
12. **Verify ingested content is real** — After any ingestion run, audit the DB to confirm every feed item has substantive `content` (not stubs/placeholders). If content_length < 50 chars, something probably went wrong.
13. **Strip forwarded Bloomz email headers** — Bloomz sends notifications as forwarded emails. The body often starts with raw headers (`autoreply@bloomz.net>`, `Date:`, `Subject:`, `To:`) before the actual content. The email cleaner must strip these header blocks so only the school communication text remains.
