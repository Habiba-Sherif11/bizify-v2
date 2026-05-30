---
target: entrepreneur dashboard
total_score: 22
p0_count: 0
p1_count: 2
timestamp: 2026-05-30T19-44-00Z
slug: src-app-entrepreneur-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No active location indicator; API errors fail silently |
| 2 | Match System / Real World | 3 | "AI tokens" is jargon for a 21-year-old Cairo student |
| 3 | User Control and Freedom | 2 | No breadcrumbs, no undo, navigation is one-way |
| 4 | Consistency and Standards | 3 | Section header styles diverge; bg-white vs bg-card in token widget |
| 5 | Error Prevention | 2 | Empty AI query blocked; no other guards |
| 6 | Recognition Rather Than Recall | 3 | Good labels, icons, suggestion chips |
| 7 | Flexibility and Efficiency | 2 | Only Enter key shortcut; no power-user paths |
| 8 | Aesthetic and Minimalist Design | 2 | No dominant primary action; 4 equal-weight workspaces compete |
| 9 | Error Recovery | 1 | Token widget silently disappears on error; no error states |
| 10 | Help and Documentation | 2 | GuidanceTour exists but no inline decision-point help |
| **Total** | | **22/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**Does this look AI-generated?** Mostly no — warm neutrals, amber restraint, and split primary/compact card layout show intent. Two flags: TokenUsageWidget leads with a text-2xl bold number (hero-metric template). Four workspace cards with identical structure (icon + title + description + count/action) approach the identical card grid ban.

**Deterministic scan:** Detector unavailable (detect.mjs not bundled). Assessment B degraded to manual review only.

## Overall Impression

Solid bones: warm neutral palette, restrained amber, consistent card component. The failure is conceptual. The design principle says "every screen has one clear primary action" — this screen has five competing ones. The Cairo student who opens this for the first time, paralyzed and looking for a map, gets a 4-option crossroads instead.

## What's Working

1. Amber restraint is real — appears only on hover states and the single primary CTA, never twice simultaneously.
2. Greeting section earns warmth — time-based greeting, first name, adaptive contextSubtitle.
3. Primary/compact card split prevents full grid sameness — shows real design judgment.

## Priority Issues

**[P1] No dominant primary action — "Start Here" principle violated**
- 5+ equal-weight actions above the fold: AI search + 3 chips + 2 primary cards + CTA button
- Fix: Make AI search bar structurally dominant. For zero-state users, collapse the 4-card grid to a single first-step prompt.
- Suggested command: /impeccable layout entrepreneur dashboard

**[P1] TokenUsageWidget breaks two design rules**
- bg-white (banned, use bg-card) at TokenUsageWidget.tsx:108
- text-2xl font-bold number + supporting stats = hero-metric template anti-pattern
- Hardcoded bg-green-500/bg-orange-500/bg-red-500 not in design system palette
- Fix: Lead with plan name + simple progress bar, not the big number. Use bg-card. Replace status colors with amber "running low" signal.

**[P2] Empty zero-state gives a direction but no path**
- 0-idea users see 4 equal options; nothing says which is the safe first step
- Fix: For 0-idea users, replace the workspace grid with a single "Your first idea takes 5 minutes" prompt.

**[P2] RTL is promised but absent from all components**
- No dir attribute, no rtl: utilities, no logical properties anywhere
- ArrowUpRight with translate-x-0.5 moves wrong in RTL
- Fix: Replace directional utilities with logical variants (ps-, pe-, ms-, me-).

**[P3] Static "4 modules" label adds no information — remove it.**

## Persona Red Flags

**Farida (Cairo Student):** Faces 4-option decision tree immediately after greeting. AI chat leads to blank chat with no prompt. Abandonment risk high in zero-state.

**Jordan (First-Timer):** "AI tokens" is unexplained jargon. Team/Marketplace cards describe things she doesn't have (co-founders, startup). GuidanceTour trigger unknown — if not auto-started, she'll never find it.

**Casey (Mobile User):** Compact card descriptions truncate. Suggestion chips may wrap to 2 rows on 375px. Primary "New idea" action buried inside a second-section card — not in thumb zone.

## Minor Observations

- max-w-280 (1120px) leaves almost no margin at 1280px viewport
- groupCount briefly shows "0 groups" after API error — potentially misleading
- FeatureCard count + action footer layout may misalign if both are present simultaneously
- deriveActivity 60-second dedup threshold is smart
