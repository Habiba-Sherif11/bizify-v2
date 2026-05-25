# Frontend Fixes & Changes Log

All changes made to bizify-v2 (Next.js) by the AI assistant. Newest entries first.

---

## 2026-05-25 — Section Chat Popup: Persistence + Context Fix

### Files changed:
- `src/app/entrepreneur/ideas/[idea_id]/page.tsx`
- `src/app/entrepreneur/ai-chat/page.tsx`
- `src/app/api/chat/sessions/route.ts` *(new)*
- `src/app/api/chat/sessions/[id]/route.ts` *(new)*
- `src/app/api/chat/sessions/[id]/messages/route.ts` *(new)*

### Problems fixed:

**1. Popup was creating a new session every time it opened**
The popup now calls `GET /api/chat/sessions?section_slug=...&idea_id=...` on mount and reuses the most recent existing session. Only creates a new session if none exists yet. This means the conversation persists when the user closes and reopens the popup.

**2. Messages were not being saved to DB**
The `api.post(...)` call to save messages was fire-and-forget with `.catch(() => {})` silently swallowing all errors. Changed to `await` with a proper `try/catch` so errors are surfaced during development and the save is guaranteed to complete before the stream is marked done.

**3. Section chatbot was answering about the wrong idea**
The popup now passes `idea_id` in the streaming chat body so BizifyAI pins to the correct idea's analysis before answering. Also passed in the AI Chat page for section-specific sessions.

**4. "View full chat" button opened an empty conversation**
Fixed by #1 and #2 above — messages are now saved and the correct session is reused.

### New Next.js API proxy routes:
| Route | Methods | Proxies to |
|---|---|---|
| `/api/chat/sessions` | GET, POST | `BACKEND_URL/api/v1/chat/sessions` |
| `/api/chat/sessions/[id]` | DELETE | `BACKEND_URL/api/v1/chat/sessions/{id}` |
| `/api/chat/sessions/[id]/messages` | GET, POST | `BACKEND_URL/api/v1/chat/sessions/{id}/messages` |

GET `/api/chat/sessions` forwards query params (`?section_slug=`, `?idea_id=`) to the backend.

---

## 2026-05-25 — AI Chat Page: DB-backed Sessions

### File: `src/app/entrepreneur/ai-chat/page.tsx`

### Problem
The AI Chat page stored all conversations in `localStorage`. This meant section-specific popup chats (e.g., the Customers chatbot popup on an idea page) were never visible in the AI Chat tab, and data was lost when clearing browser storage.

### Fix
Rewrote the AI Chat page to load sessions from the backend DB:
- On mount, calls `GET /api/chat/sessions` to load all sessions for the user
- Supports `?session_id=` URL param — clicking "View full chat" in a popup deep-links to that session
- When clicking a session in the sidebar, loads messages from `GET /api/chat/sessions/{id}/messages`
- Section-specific sessions (e.g. "Customers Chat") show a colored badge in the sidebar
- Section sessions use the streaming section-specific chat API; general sessions use general-chat
- All messages saved to DB after each exchange
- Sidebar shows section label badge (Customers, Competition, etc.) so users can identify chat type

---

## 2026-05-25 — Section Chat Popup: New Component

### File: `src/app/entrepreneur/ideas/[idea_id]/page.tsx`

### What was added
A `SectionChatPopup` component was added to the idea detail page. It appears as a fixed bottom-right panel (360×500px) with an amber gradient header.

**Features:**
- Opens when the user clicks the chat icon (💬) in the tab bar action icons
- Each section tab has its own chatbot (customers → Customers AI, competition → Competition AI, etc.)
- Uses SSE streaming via `/api/ai/{slug}/chat/stream`
- "View full chat →" link in the header opens the full conversation in the AI Chat page
- Input supports Enter to send, Shift+Enter for newline
- `key={sectionKey}` resets conversation when switching sections

---

## 2026-05-25 — Tab Bar Action Icons (Regenerate, Custom Regenerate, Chat)

### File: `src/app/entrepreneur/ideas/[idea_id]/page.tsx`

### What was added
Three icon buttons appear in the tab bar row when the active tab has AI-generated data:
- **RefreshCw** — Regenerate: calls `POST /api/ai/{slug}/regenerate`
- **Wand2** — Regenerate with custom prompt: opens a modal with a textarea, calls `POST /api/ai/{slug}/regenerate-custom`
- **MessageCircle** — Chat with AI: opens the section-specific chat popup

Icons show a tooltip on hover. Buttons are disabled while the section is loading.

---

## 2026-05-25 — Per-Section "Generate Analysis" Button

### File: `src/app/entrepreneur/ideas/[idea_id]/page.tsx`

### Problem
When a tab had no data yet, there was no way to generate just that section — only the full pipeline could be run.

### Fix
Each tab now shows a `SectionCallToAction` component when no data exists. Clicking "Generate Analysis" calls only that section's POST endpoint (e.g., `POST /api/ai/competition`) instead of running the full pipeline. The `idea_id` from the URL is passed in the request body so the correct idea is used.

---

## 2026-05-25 — `idea_id` Threading Through Section Routes

### Files changed:
- `src/app/api/ai/competition/route.ts`
- `src/app/api/ai/customers/route.ts`
- `src/app/api/ai/market-potential/route.ts`
- `src/app/api/ai/idea-strategy/route.ts`
- `src/app/api/ai/business-model/route.ts`
- `src/app/api/ai/functions-list/route.ts`
- `src/app/api/ai/mvp-planning/route.ts`
- `src/app/api/ai/unit-economics/route.ts`
- `src/app/api/ai/go-to-market/route.ts`
- `src/app/api/ai/[section]/regenerate/route.ts` *(new)*
- `src/app/api/ai/[section]/regenerate-custom/route.ts` *(new)*
- `src/app/api/ai/[section]/chat/stream/route.ts` *(new)*
- `src/features/entrepreneur/hooks/useAiPipeline.ts`

### What was done
All 9 section generate endpoints now accept `idea_id` in the POST body. The frontend passes the `idea_id` from the URL so BizifyAI can pin the correct idea before generating analysis.

`useAiPipeline.ts` was updated to add:
- `runSection(key)` — generate a single section (passes `idea_id`)
- `regenerateSection(key)` — regenerate a section
- `regenerateSectionCustom(key, prompt)` — regenerate with a custom prompt

Dynamic Next.js routes created for regenerate and regenerate-custom (single file handles all 9 sections via `[section]` param). SSE chat stream also uses a dynamic `[section]` route.

---

## 2026-05-25 — Wrong Analysis Shown for Specific Idea

### Problem
When navigating to a specific idea's page and triggering analysis, BizifyAI generated analysis for a different idea (the one stored in `current_idea_id`) instead of the one in the URL.

### Root cause
The section POST endpoints only accepted `user_id` but not `idea_id`. BizifyAI used whatever `current_idea_id` was stored in `pipeline_runs` for that user.

### Fix
Added `idea_id` to every section's POST body. BizifyAI calls `crud.set_current_idea_id(db, user_id, idea_id)` before running the analysis, pinning the correct idea for that request.

---
