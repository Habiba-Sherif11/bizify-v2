# Bizify `/impeccable` Invocation Spec

A prioritized, screen-by-screen guide for using the `/impeccable` skill to improve the Bizify frontend.
Each entry includes: what to invoke it on, what's currently broken/weak, and what to ask it to do.

---

## How to Use This File

Run each section as a `/impeccable` session in order. Copy the **Prompt** block verbatim (edit any `[brackets]` if needed), then apply the output. Complete Phase 1 before touching any screen — the token fixes cascade everywhere.

---

## Phase 1 — Design System (Do This First)

### 1.1 — Color Token Overhaul

**File:** `src/styles/globals.css`

**Problem:**
- Zero brand color — every `--primary`, `--accent`, `--muted` is a neutral gray (`oklch(X 0 0)`, chroma = 0)
- Chart colors are also all gray, useless for data viz
- The `--ring` focus color is gray — invisible for accessibility
- `--accent` and `--muted` share the same value (`oklch(0.97 0 0)`), making them semantically meaningless
- The `hero-cta` glow in `animations.css` uses amber (`rgba(245, 158, 11, ...)`) — a brand color is implied but never defined as a token

**Goal:** Define a real brand color ramp, semantic color aliases, and wire the implied amber accent into the token system.

**Prompt:**
```
/impeccable

Audit and redesign the CSS color token system in src/styles/globals.css.

Context: Bizify is an AI-powered startup mentor platform for first-time entrepreneurs. The current palette has zero brand color — all tokens are neutral grays (oklch chroma = 0). The animations.css file uses amber (rgba(245, 158, 11)) for glow effects, implying a warm gold/amber brand accent exists but is never defined as a token.

Current token problems:
- --primary, --secondary, --accent, --muted all resolve to different shades of gray
- --accent and --muted have identical values
- --ring is gray — fails accessibility contrast for focus states
- Chart colors are all gray — useless for charts
- No brand color at all

Please:
1. Define a brand color ramp (amber/gold or whatever fits an AI mentor SaaS) anchored around the existing amber glow color
2. Assign semantic roles: --primary should be the brand CTA color, --accent a softer brand tint, --muted a true neutral
3. Update --ring to a visible, accessible focus indicator
4. Suggest chart-1 through chart-5 in the brand's color family
5. Preserve the dark mode block structure

Output: the full updated :root {} and .dark {} blocks, ready to paste into globals.css.
```

---

### 1.2 — Typography Scale

**File:** `src/styles/globals.css` + `src/app/layout.tsx`

**Problem:**
- Two heading fonts loaded (Cormorant SC and Geist/Inter) with no documented scale
- `--font-heading` points to `--font-sans`, ignoring Cormorant SC
- No type scale variables (h1–h6 sizes, line heights, letter spacing) defined anywhere
- Components use arbitrary `text-xl`, `text-2xl` etc. inline with no system

**Goal:** Establish a clear type hierarchy with Cormorant SC for display/hero headings and Geist/Inter for body.

**Prompt:**
```
/impeccable

Define a typography scale for the Bizify design system.

Context: src/styles/globals.css has two font families loaded — Cormorant SC (elegant serif, for display/hero headings) and Geist/Inter (clean sans-serif, for body and UI). Currently --font-heading incorrectly points to --font-sans, and there is no type scale. Components use arbitrary Tailwind text-* classes inconsistently.

Please:
1. Define CSS custom properties for a type scale: --text-display, --text-h1 through --text-h4, --text-body, --text-sm, --text-xs — each with font-size, line-height, and letter-spacing
2. Assign Cormorant SC to --font-heading and wire it to display/h1/h2 sizes
3. Assign Geist/Inter to --font-body for h3/h4, body, small, label sizes
4. Output as CSS variables to add to the @theme inline {} block and :root {}

Tone: premium SaaS, confident, not corporate.
```

---

### 1.3 — Motion & Animation Consistency

**File:** `src/styles/animations.css`

**Problem:**
- `--anim-easing: cubic-bezier(0.2, 0.9, 0.4, 1.1)` — overshoot easing (>1 Y-value) used for scroll fades, which looks bouncy and wrong for content appearing
- Stagger only hardcoded to 6 children — 7th child and beyond have no delay
- No entry/exit animation for modals or drawers (they use shadcn defaults)
- No loading skeleton animation token defined
- `card-hover` border-color references amber (`rgba(245, 158, 11, 0.3)`) hardcoded — should reference the brand token once 1.1 is done

**Prompt:**
```
/impeccable

Audit and improve the animation system in src/styles/animations.css.

Issues to fix:
1. --anim-easing uses cubic-bezier(0.2, 0.9, 0.4, 1.1) — the Y > 1 creates overshoot/bounce, which is wrong for scroll-reveal content. Replace with a smooth deceleration curve (ease-out style) while keeping a separate --anim-easing-spring for interactive elements like buttons that benefit from bounce.
2. .stagger-children only covers nth-child(1-6). Add coverage through nth-child(12) using a CSS custom property or calc() pattern.
3. card-hover border-color uses hardcoded amber rgba — replace with var(--color-brand-accent) or equivalent once tokens are set.
4. Add a --anim-fade-in keyframe and a --anim-slide-up keyframe for modal/drawer entrances.
5. Add a shimmer skeleton keyframe for loading states.

Output: the full updated animations.css file.
```

---

## Phase 2 — Landing Page

### 2.1 — Hero Section

**File:** `src/components/sections/hero.tsx` + `src/components/sections/herobg.tsx`

**Problem:** Unknown until audited — common hero issues are weak CTA hierarchy, no clear value proposition scan path, background not complementing foreground text.

**Prompt:**
```
/impeccable

Audit and redesign the hero section of the Bizify landing page at src/components/sections/hero.tsx (background: src/components/sections/herobg.tsx).

Context: Bizify is an AI-powered startup mentor platform for first-time entrepreneurs. Brand voice: bold, encouraging, modern. The hero-cta class adds an amber glow on hover. Font stack: Cormorant SC for display headlines, Geist/Inter for body.

Please:
1. Audit visual hierarchy — is the headline scannable in <3 seconds? Does the subheading support it or compete?
2. Audit CTA button placement, size, and contrast
3. Review background treatment — does it frame the foreground or distract?
4. Recommend spacing, headline sizing, and layout changes
5. Suggest any micro-interaction improvements for the CTA

Output: annotated critique + specific code changes (className diffs).
```

---

### 2.2 — Navbar

**File:** `src/components/sections/navbar.tsx`

**Prompt:**
```
/impeccable

Audit the navigation bar at src/components/sections/navbar.tsx.

Focus:
1. Scroll state — does it get a backdrop/blur on scroll or stay transparent? Is there a visible transition?
2. Mobile menu — is there a hamburger? Does it animate open/close? Does it block body scroll?
3. CTA button in nav — is it visually distinct from nav links?
4. Active link indication
5. Spacing and alignment at all breakpoints

Output: critique + className/JSX changes.
```

---

### 2.3 — How It Works & Process Cards

**Files:** `src/components/sections/how-it-works-new.tsx` + `src/components/sections/process-card.tsx`

**Prompt:**
```
/impeccable

Audit the "How It Works" section at src/components/sections/how-it-works-new.tsx and the ProcessCard component at src/components/sections/process-card.tsx.

Focus:
1. Cognitive flow — do the steps read in the correct order visually?
2. Step numbering/iconography — is the progression clear?
3. Card layout — is content density appropriate or overwhelming?
4. Does the scroll-fade stagger animation match the step-by-step narrative?
5. Mobile layout — do cards stack cleanly?

Output: critique + specific code changes.
```

---

### 2.4 — Pricing Section

**File:** `src/components/sections/pricing.tsx`

**Prompt:**
```
/impeccable

Audit the pricing section at src/components/sections/pricing.tsx.

Focus:
1. Plan hierarchy — is the recommended plan visually elevated (ring, scale, badge)?
2. Feature list scanability — are checkmarks/crosses legible?
3. CTA button differentiation per plan tier
4. Value-to-price communication — is pricing anchored correctly?
5. Mobile collapse behavior

Output: critique + code changes to maximize conversion clarity.
```

---

### 2.5 — Why Bizify + AI Mentor Sections

**Files:** `src/components/sections/why-bizify.tsx` + `src/components/sections/ai-startup-mentor.tsx`

**Prompt:**
```
/impeccable

Audit src/components/sections/why-bizify.tsx and src/components/sections/ai-startup-mentor.tsx.

Focus:
1. Differentiation clarity — does each section communicate a unique reason to care?
2. Visual rhythm — do these sections feel like part of the same page or disconnected?
3. Copy/headline strength — are the value props specific or generic?
4. Image/illustration usage and how it frames the text
5. Section spacing and scroll pacing between sections

Output: critique + code changes.
```

---

## Phase 3 — Auth & Onboarding Flow

### 3.1 — Login Page

**File:** `src/features/auth/components/LoginForm.tsx`

**Prompt:**
```
/impeccable

Audit the login form at src/features/auth/components/LoginForm.tsx.

Focus:
1. Form layout — field labels, input sizing, spacing
2. Error state presentation — are field errors inline and legible?
3. Google OAuth button (src/features/auth/components/GoogleButton.tsx) — is the divider between OAuth and email/password clear?
4. "Forgot password" link placement and visibility
5. Submit button state — loading, disabled, success feedback
6. Mobile keyboard behavior (inputs above fold?)

Output: critique + code changes.
```

---

### 3.2 — Questionnaire Onboarding (Highest Priority Auth Task)

**Files:** `src/features/auth/components/QuestionnaireStep.tsx` + `src/features/auth/components/ChatBubble.tsx` + `src/features/auth/components/ChoiceButton.tsx` + `src/features/auth/data/questionnaire.json`

**Problem:** This is the most critical onboarding UX — 10 questions that determine the user's profile. Drop-off here means lost users.

**Prompt:**
```
/impeccable

Redesign the questionnaire onboarding step at src/features/auth/components/QuestionnaireStep.tsx. Supporting components: ChatBubble.tsx (the question display), ChoiceButton.tsx (answer options).

The questionnaire has 10 questions of two types:
- Single choice (radio-style)
- Multi-select (checkbox-style)

Context: this is a chat-style onboarding flow — the question appears as a "chat bubble" and the user selects from buttons below. The tone should feel like talking to a smart mentor, not filling out a form.

Please audit and improve:
1. Progress indication — is it clear how far through the questionnaire the user is? (Step X of 10 + a progress bar)
2. ChatBubble component — typography, bubble shape, animation as each question appears
3. ChoiceButton component — selected vs unselected state contrast, multi-select vs single-select visual distinction, hover/active states
4. Multi-select affordance — is it obvious that multiple answers can be chosen on multi-select questions?
5. Transition between questions — does it animate smoothly to the next question or jump?
6. Mobile layout — do the buttons wrap cleanly on small screens?
7. Overall delight — this should feel like a fun onboarding, not a survey

Output: critique + full code changes for all three files.
```

---

### 3.3 — Skills Step

**File:** `src/features/auth/components/SkillsStep.tsx`

**Prompt:**
```
/impeccable

Audit the skills selection step at src/features/auth/components/SkillsStep.tsx.

Focus:
1. Skill chip/tag design — selected vs unselected state
2. Grid layout and wrapping behavior
3. Search/filter if present — input affordance
4. "Continue" CTA — when does it enable? Is feedback clear?
5. Empty state if no skills match search

Output: critique + code changes.
```

---

### 3.4 — Success Step

**File:** `src/features/auth/components/SuccessStep.tsx`

**Prompt:**
```
/impeccable

Design an impressive success/completion step for the Bizify signup flow at src/features/auth/components/SuccessStep.tsx.

This is the moment the user completes onboarding — it should feel like a milestone, not an afterthought.

Please:
1. Add a celebration micro-interaction (confetti, checkmark animation, or a branded reveal)
2. Ensure the headline is encouraging and personal (references their journey)
3. CTA to the dashboard should be prominent
4. Consider a brief summary of what the AI will do next for them (sets expectations)

Output: redesigned component code.
```

---

### 3.5 — Password Strength Indicator

**File:** `src/features/auth/components/PasswordStrength.tsx`

**Prompt:**
```
/impeccable

Audit the password strength indicator at src/features/auth/components/PasswordStrength.tsx.

Focus:
1. Visual encoding — are strength levels clearly differentiated (color + label, not just color)?
2. Segment animation — do segments fill in smoothly?
3. Accessible — does it work without color alone?
4. Positioning relative to the input field

Output: critique + code changes.
```

---

## Phase 4 — Entrepreneur Dashboard

### 4.1 — Dashboard Home

**Files:** `src/features/entrepreneur/components/DashboardHeader.tsx` + `src/features/entrepreneur/components/IdeaCard.tsx` + `src/features/entrepreneur/components/FeatureCard.tsx` + `src/features/entrepreneur/components/RecentActivity.tsx`

**Prompt:**
```
/impeccable

Audit the entrepreneur dashboard home — DashboardHeader.tsx, IdeaCard.tsx, FeatureCard.tsx, and RecentActivity.tsx.

Context: this is the main product dashboard for a first-time entrepreneur. It shows their ideas, features they can use, and recent activity. The user may have 0 or many ideas.

Focus:
1. DashboardHeader — navigation clarity, user greeting, quick-action CTA placement
2. IdeaCard — information hierarchy (title, status, last updated), action affordance (hover state, primary action)
3. FeatureCard — does it communicate what the feature does and why to use it?
4. RecentActivity — timestamp formatting, activity type differentiation, empty state
5. Overall grid layout — column structure, spacing, responsive collapse
6. Empty state for a brand new user with no ideas

Output: critique + code changes per component.
```

---

### 4.2 — Idea Detail / Analysis Page

**Files:** `src/features/entrepreneur/components/analysis/` (all 10+ section components)

**Problem:** 10+ distinct AI-generated content cards stacked on one page. High risk of cognitive overload, inconsistent card styles, and poor reading flow.

**Prompt:**
```
/impeccable

Audit the idea detail/analysis page — all section components in src/features/entrepreneur/components/analysis/:
- BusinessModelSection.tsx
- CompetitionSection.tsx
- CustomersSection.tsx
- FunctionsListSection.tsx
- GeneratedIdeaSection.tsx
- GoToMarketSection.tsx
- IdeaStrategySection.tsx
- MarketPotentialSection.tsx
- MvpPlanningSection.tsx
- ProblemsSection.tsx
- UnitEconomicsSection.tsx

Context: each section displays AI-generated analysis for a startup idea. There are 10+ sections stacked vertically. Users need to scan, digest, and act on this content.

Focus:
1. Card consistency — do all sections share a header pattern (icon + section title + description)?
2. Information density — are any sections overwhelming? Should content be collapsible?
3. Reading flow — is there a clear top-to-bottom narrative (problem → market → model → MVP)?
4. Data visualization — sections like MarketPotential and UnitEconomics likely have numbers — are they displayed with visual hierarchy (big number + label) or dumped as text?
5. Loading skeleton — what does each section look like while AI is generating it?
6. Section navigation — with 10+ sections, is there a sticky table of contents or jump links?

Output: critique + a unified section template component + specific changes per section.
```

---

### 4.3 — AI Chat Interface

**Files:** `src/features/entrepreneur/components/ChatBotBubble.tsx` + `src/features/entrepreneur/components/AiSearchBar.tsx`

**Prompt:**
```
/impeccable

Audit the AI chat interface components: ChatBotBubble.tsx and AiSearchBar.tsx.

Context: this is an in-product AI mentor chat. Users can ask questions about their startup. The chat may stream responses.

Focus:
1. Chat bubble design — user vs AI message differentiation (alignment, color, avatar)
2. Streaming text display — is there a typing indicator? Does streaming text feel smooth?
3. AiSearchBar — input sizing, send button affordance, keyboard shortcut hint (Enter to send)
4. Empty state — what does the chat look like before the first message?
5. Scroll behavior — does the chat auto-scroll to the latest message?
6. Mobile layout — does the input stay above the keyboard?

Output: critique + code changes.
```

---

### 4.4 — Team Pages

**Files:** `src/features/entrepreneur/components/TeamCard.tsx` + `src/features/entrepreneur/components/TeamMembersCard.tsx` + `src/features/entrepreneur/components/InviteTeamMemberModal.tsx`

**Prompt:**
```
/impeccable

Audit the team management components: TeamCard.tsx, TeamMembersCard.tsx, and InviteTeamMemberModal.tsx.

Focus:
1. TeamCard — member avatar stack, role badges, join/leave action placement
2. TeamMembersCard — member list layout, online status indicator if any, action menu per member
3. InviteTeamMemberModal — email input + send flow, copy-link alternative, pending invite list
4. Empty state — no team members yet
5. Role differentiation — owner vs member visual distinction

Output: critique + code changes.
```

---

### 4.5 — Marketplace

**File:** `src/features/marketplace/components/PartnerCard.tsx`

**Prompt:**
```
/impeccable

Audit the marketplace partner card at src/features/marketplace/components/PartnerCard.tsx.

Focus:
1. Card information hierarchy — logo, name, category, description, CTA
2. Category/type badge design
3. Hover state and click affordance
4. Grid layout for multiple cards
5. Filter/search bar if present on the marketplace page

Output: critique + code changes.
```

---

## Phase 5 — Empty States & Placeholder Pages

### 5.1 — Role Dashboard Placeholders

**Files:** `/mentor/page.tsx`, `/manufacturer/page.tsx`, `/supplier/page.tsx`

**Prompt:**
```
/impeccable

Design meaningful empty/coming-soon states for the Mentor, Manufacturer, and Supplier dashboard pages (currently placeholders).

These users have signed up but their dashboard isn't built yet. The empty state should:
1. Acknowledge their role specifically (not a generic "coming soon")
2. Set a clear expectation for what they'll be able to do here
3. Offer a useful action in the meantime (e.g., complete profile, browse marketplace)
4. Feel branded and polished, not like a forgotten page

Output: a reusable RolePlaceholder component + role-specific copy for each of the three roles.
```

---

### 5.2 — Partner Pending Page

**File:** `src/app/partner-pending/page.tsx`

**Prompt:**
```
/impeccable

Redesign the partner-pending page at src/app/partner-pending/page.tsx.

Context: this page is shown to partners (mentors, manufacturers, suppliers) after signup while their account is under review by Bizify admins.

This state can last hours or days. The page should:
1. Clearly communicate the current status and what happens next (timeline expectations)
2. Not feel like a dead end — offer something useful to do while waiting
3. Have a visual treatment that feels "warm hold" not "rejection"
4. Include a contact option if they have questions

Output: redesigned page component.
```

---

## Phase 6 — Global Polish Pass

Run this after all above phases are complete.

### 6.1 — Component Library Consistency

**Prompt:**
```
/impeccable

Do a final consistency pass across the shadcn/ui component overrides in src/components/ui/.

Files: button.tsx, card.tsx, input.tsx, badge.tsx, alert.tsx, select.tsx, label.tsx

Focus:
1. Do all components use the updated brand tokens from Phase 1?
2. Are focus rings consistent (--ring token, 2px offset)?
3. Are disabled states visually obvious but not ugly?
4. Are loading states defined for button?
5. Do input error states match the destructive color token?

Output: updated component files.
```

---

### 6.2 — Responsive Audit

**Prompt:**
```
/impeccable

Do a responsive breakpoint audit across these key layouts:
- src/components/sections/hero.tsx (landing)
- src/features/auth/components/QuestionnaireStep.tsx (onboarding)
- src/features/entrepreneur/ dashboard home

For each, check:
1. Does the layout collapse cleanly at 375px (iPhone SE), 768px (tablet), 1280px (desktop)?
2. Are touch targets at least 44x44px on mobile?
3. Are font sizes readable without zooming on mobile?
4. Is horizontal overflow avoided?

Output: a list of breakpoint issues with specific Tailwind className fixes.
```

---

## Quick Reference — Priority Order

| # | Task | File(s) | Impact |
|---|------|---------|--------|
| 1 | Color tokens | `globals.css` | Cascades everywhere |
| 2 | Typography scale | `globals.css` | Cascades everywhere |
| 3 | Animation fixes | `animations.css` | Cascades everywhere |
| 4 | Questionnaire UX | `QuestionnaireStep.tsx` + `ChatBubble.tsx` + `ChoiceButton.tsx` | Conversion-critical |
| 5 | Hero section | `hero.tsx` | First impression |
| 6 | Dashboard home | `DashboardHeader` + `IdeaCard` | Core product |
| 7 | Analysis page | `analysis/` (all) | Core product value |
| 8 | AI Chat | `ChatBotBubble` + `AiSearchBar` | Core product |
| 9 | Success step | `SuccessStep.tsx` | Onboarding delight |
| 10 | Pricing section | `pricing.tsx` | Revenue |
| 11 | Login form | `LoginForm.tsx` | Auth entry |
| 12 | Team pages | `TeamCard` + `TeamMembersCard` | Collaboration |
| 13 | Marketplace | `PartnerCard.tsx` | Partner adoption |
| 14 | Empty states | placeholders + partner-pending | Polish |
| 15 | Component library | `src/components/ui/` | Global polish |
| 16 | Responsive audit | Multiple | Accessibility |
