# Feed Quality Fixes — AI Parser, Photo Gallery, Full-Content

## Fix 1: AI Parser Root Cause
- [ ] Use Ollama `system` param instead of inlining system prompt in `prompt`
- [ ] Add `format: "json"` to force JSON output mode
- [ ] Add response validation (must contain `title` field)
- [ ] Test with `curl` to verify AI returns proper parsed fields

## Fix 2: Full-Content Click-Through
- [ ] Add `full_content` column to `feed_items` table (migration in `db.js`)
- [ ] Store original cleaned email body as `full_content` in `emailPoller.js`
- [ ] Map `fullContent` in `mapFeedItem` in `index.js`
- [ ] Verify "Read Full Newsletter" expand works on ingested emails

## Fix 3: Multi-Photo Gallery on Post Detail
- [ ] Replace single hero image with scrollable photo strip + lightbox
- [ ] Add swipe navigation in lightbox
- [ ] Show photo count badge
- [ ] Fix `MediaGallery.tsx` to use API data instead of static mock data

## Housekeeping
- [ ] Update `lessons.md` with Ollama system/prompt lesson
