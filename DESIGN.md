---
name: Bizify
description: AI-powered business ecosystem for early-stage entrepreneurs
colors:
  confidence-amber: "#F59E0B"
  amber-glow: "#EAB308"
  clarity-cyan-deep: "#0891B2"
  clarity-cyan: "#06B6D4"
  ink: "#1C1C1E"
  paper: "#FAFAFA"
  cloud: "#F5F5F5"
  ash: "#8C8C8C"
  mist: "#E9E9E9"
  blush-error: "#E53935"
typography:
  display:
    fontFamily: "Cormorant SC, Georgia, serif"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.confidence-amber}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.amber-glow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
  button-secondary:
    backgroundColor: "{colors.clarity-cyan-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
    typography: "{typography.label}"
  button-secondary-hover:
    backgroundColor: "{colors.clarity-cyan}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
    typography: "{typography.label}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
    typography: "{typography.label}"
---

# Design System: Bizify

## 1. Overview

**Creative North Star: "The Patient Cartographer"**

Bizify is built for the moment before confidence exists. The Cairo student opening the dashboard isn't looking for features — she's looking for permission to begin. The design system's single job is to hand her the map. Every screen has a primary action that reads before she consciously chooses it. Every surface is warm enough to linger and clear enough to act.

The color strategy is Restrained: tinted achromatic neutrals carry 90% of every surface. Confidence Amber appears only on elements that mean "go here next" — primary CTAs, active toggles, card hover highlights. Clarity Cyan handles feedback and orientation: focus rings, secondary actions, input confirmation. Neither color competes. Their reserve is what makes them readable.

This system explicitly rejects what PRODUCT.md names: the Salesforce/SAP enterprise density (too serious, too borrowed, wasn't built for her); the Notion/Linear cold white minimalism (technically right, emotionally wrong — she doesn't feel seen in that precision); and the hustler SaaS dark dashboard with neon gradients (performing confidence instead of building it, exactly the wrong register for someone managing fear of failure).

**Key Characteristics:**
- Warm achromatic neutrals: Paper (#FAFAFA) not pure white, Ink (#1C1C1E) not pure black
- One forward-motion signal (Confidence Amber), one orientation signal (Clarity Cyan)
- Rounded, comfortable components with generous touch targets (44px minimum)
- Ambient shadows establish visual hierarchy at rest before any interaction
- One primary action per screen; progressive disclosure over feature completeness
- RTL/LTR layout mirroring designed from day zero, not retrofitted

## 2. Colors: The Cartographer's Palette

A warm neutral field punctuated by two reserved accent roles. Most surfaces are Paper and Cloud; the signal colors earn their place by appearing rarely.

### Primary
- **Confidence Amber** (`#F59E0B`, rendered as amber-500 → yellow-500 gradient): The system's only forward-motion signal. Applied as the primary CTA gradient on the one action per screen that means "this is the move." Appears on active toggle states, card hover highlights (`border-color: rgba(245,158,11,0.3)`), and the amber glow shadow. Its rarity is the point: if amber is visible on two elements simultaneously, one of them is wrong.
- **Amber Glow** (`#EAB308`): The gradient endpoint (yellow-500). Carries the hover/active state of primary buttons and amplifies the warm register without introducing a second hue.

### Secondary
- **Clarity Cyan Deep** (`#0891B2`): Orientation and feedback. Applied on secondary CTAs (cyan gradient), input focus borders, select highlight states. Never competes with amber — always behind it in the visual hierarchy.
- **Clarity Cyan** (`#06B6D4`): The lighter gradient endpoint and focus ring base (cyan-500/20 opacity). Signals "I see you" without demanding attention.

### Neutral
- **Ink** (`#1C1C1E`): Body text, headings, default foreground. Achromatic near-black with just enough distance from true black to feel warm.
- **Paper** (`#FAFAFA`): The canonical base background. Achromatic near-white. Pure `#FFFFFF` is prohibited.
- **Cloud** (`#F5F5F5`): Muted surfaces — secondary backgrounds, sidebar, card interiors on elevated layouts.
- **Ash** (`#8C8C8C`): Secondary text, placeholders, descriptions, icon strokes. The quiet voice.
- **Mist** (`#E9E9E9`): Borders, dividers, input strokes at rest. Visible but not demanding.
- **Blush Error** (`#E53935`): Destructive states only — validation errors, delete confirmations, critical alerts. Never decorative.

### Named Rules
**The One Signal Rule.** Confidence Amber appears on at most one primary action per screen. If amber is visible in two places simultaneously, one of them is competing for attention that should be undivided.

**The Warm Neutral Rule.** Paper (`#FAFAFA`) and Ink (`#1C1C1E`) are the canonical background and text. Pure `#FFFFFF` and `#000000` are prohibited. The tint matters.

## 3. Typography

**Display Font:** Cormorant SC (Georgia, serif fallback)
**Body/UI Font:** Geist (system-ui, sans-serif fallback)
**Secondary UI Font:** Inter (available for dense data contexts)

**Character:** Cormorant SC is the brand's handshake — its slightly editorial weight marks "this was made for you" in the navbar and footer logo. Geist does everything else: legible, neutral-warm, at home from 12px labels to 36px headlines.

### Hierarchy
- **Display** (Cormorant SC, 400, line-height 1, letter-spacing 0.02em): The Bizify logo exclusively — navbar and footer. Never used for UI headings or marketing copy outside the wordmark.
- **Headline** (Geist, 700, clamp(1.875rem, 5vw, 2.25rem), line-height 1.15): Section heroes, page titles. One per screen. The single loudest voice on any given surface.
- **Title** (Geist, 600, 1.5rem, line-height 1.3): Card headings, modal titles, section intros. Subordinate to Headline; should never compete with it.
- **Body** (Geist, 400, 1rem, line-height 1.6): All prose and descriptions. Cap at 65–75ch. Light subheadings (font-light 300) use 1.125rem for a weight-contrast pairing with normal-weight body copy.
- **Label** (Geist, 500, 0.875rem, line-height 1.4): Button text, field labels, nav links, badge text, tab labels. Medium weight distinguishes it from body copy without going bold.

### Named Rules
**The One Display Rule.** Cormorant SC is reserved for the brand wordmark. Mixing it into UI headings, marketing copy, or hero text dilutes the brand signal and produces an editorial-confusion aesthetic that reads like a different product.

## 4. Elevation

Surfaces carry a constant low-level shadow that establishes hierarchy at rest. The user reads the visual structure before moving the mouse. Interaction amplifies the existing signal: hover lifts cards 6px and deepens the shadow; the primary CTA button glows amber.

This is not "shadows only on hover." The difference matters for the Cairo student who opens the dashboard cold and needs to orient fast.

### Shadow Vocabulary
- **Ambient card** (`box-shadow: 0 2px 8px -2px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)`): Always-on base depth for cards and containers. Establishes that a surface exists before any interaction.
- **Hover lift** (`transform: translateY(-6px)` + `box-shadow: 0 20px 30px -12px rgba(0,0,0,0.15)`): Hover state for interactive cards. The lift is the affordance signal.
- **CTA amber glow** (default: `box-shadow: 0 2px 8px rgba(245,158,11,0.4)`; hover: `0 4px 12px rgba(245,158,11,0.6)`): Primary gradient button only. The glow extends the amber signal without adding a second color.
- **Secondary cyan glow** (default: `box-shadow: 0 2px 8px rgba(87,222,255,0.4)`; hover: `0 4px 12px rgba(87,222,255,0.6)`): Secondary gradient button only.
- **Subtle ring** (`ring-1 ring-foreground/10`): Cards and containers where a full shadow would be visually heavy. The 10%-opacity ring at foreground hue.

### Named Rules
**The Hierarchy-at-Rest Rule.** Cards and containers carry a permanent ambient shadow. The user should read the visual hierarchy before any interaction. Shadows that appear only on hover create interfaces that require exploration to understand — fatal for a user who is already overwhelmed.

## 5. Components

Warm and approachable throughout: generous rounding (10px base), comfortable padding, clear hover responses. Designed for someone on a phone, possibly mid-conversation, who needs affordances to be obvious without being loud.

### Buttons
The gradient variants own the forward-motion register. Ghost and outline own the recessive register. Never two gradient buttons side by side.

- **Shape:** Gently curved (10px, `--radius-lg`). 14px (`--radius-xl`) on full-width mobile CTAs.
- **Primary (amber gradient):** `from-amber-500 to-yellow-500` background, amber glow shadow, Ink text. Hover brightens gradient and deepens glow. Font: label weight (500, 0.875rem).
- **Secondary (cyan gradient):** `from-cyan-600 to-cyan-500` background, cyan glow shadow, white text. Same scale as primary.
- **Ghost:** Transparent background, Ink text, Cloud hover (`bg-neutral-100`). For nav links, tertiary actions, icon-only buttons.
- **Outline:** Transparent with Mist border, Ink text. Quieter than ghost in dense contexts; used alongside primary where a second action exists.
- **Disabled:** `opacity-50`, no pointer events. No color shift.
- **Touch target:** `h-9` (36px) minimum. `h-10` (40px) preferred for mobile-primary layouts.

### Cards / Containers
- **Corner Style:** Rounded (10px base, `--radius-lg`); 14px (`--radius-xl`) for prominent dashboard cards.
- **Background:** Paper (`#FAFAFA`); white at 60–70% opacity for backdrop-blur overlays (process cards, modals).
- **Shadow Strategy:** Ambient card shadow at rest (see Elevation). Hover: lift + deepened shadow on interactive cards.
- **Border:** `ring-1 ring-foreground/10` as default. Never a colored `border-left` stripe.
- **Internal Padding:** 16px (md, `p-4`) standard; 12px (sm variant, `p-3`).

### Inputs / Fields
- **Style:** 10px radius, white background, Mist border (`border-gray-300`) at rest. Height 36px (`h-9`).
- **Focus:** `ring-2 ring-cyan-500/20 border-cyan-500`. The ring is soft (20% opacity); the border shift is decisive. Clarity Cyan owns all focus feedback.
- **Placeholder:** Ash (`#8C8C8C`, `text-gray-400`).
- **Error:** Blush Error border + ring (`aria-invalid:border-destructive`).
- **Disabled:** `opacity-50`, `cursor-not-allowed`.
- **Label:** Geist medium (500), 0.875rem, Ink text.

### Chips / Badges
- **Style:** Pill shape (9999px radius, `rounded-4xl`), 0.75rem font, medium weight (500), height 20px.
- **Neutral default:** secondary color (`bg-secondary text-secondary-foreground`).
- **Amber highlight:** `bg-amber-100 text-amber-600` for popular/active/featured states (pricing plan badges, active filters).

### Navigation
- **Desktop:** Fixed top, z-50, white background on scroll. Brand name in Cormorant SC. Nav links are label weight (500), ghost hover. Primary CTA (amber gradient) on the rightmost action; secondary CTA (cyan outline) beside it.
- **Mobile:** Full-height slide panel from the right edge (`translate-x-full` closed state), z-50, white background, `shadow-2xl`. No backdrop blur on the panel itself; a semi-opaque overlay covers the page.

### Process / Step Cards (Signature Component)
The guided-step cards unique to the onboarding flow. Each carries a step badge, a headline, and a short action.
- **Style:** `border border-white/70 bg-white/60 backdrop-blur-md rounded-xl p-4–5`.
- **Step badge:** Amber accent (`border border-amber-300/70 bg-amber-50 text-amber-700`), pill shape.
- **Hover:** `hover:bg-white/70`, no lift. These are informational, not navigation targets.

## 6. Do's and Don'ts

### Do:
- **Do** use Confidence Amber on exactly one primary CTA per screen. Its scarcity is what makes it legible as "the move."
- **Do** use Clarity Cyan for all focus rings, input confirmation borders, and selected states. Cyan means "I see you" — it should be consistent everywhere feedback happens.
- **Do** use Paper (`#FAFAFA`) as the base background. Never pure `#FFFFFF`.
- **Do** maintain 44px touch targets on interactive elements in mobile-first layouts. This user is likely on a phone, possibly stressed.
- **Do** cap body line length at 65–75ch. Shorter lines on mobile are preferable to longer ones that require horizontal tracking.
- **Do** apply ambient shadows to cards and containers at rest, so hierarchy reads before interaction.
- **Do** put one clear primary action per screen. Surface the next step; hide the rest until it's relevant.
- **Do** design RTL layout mirroring before it breaks — icon direction, nav flow, component mirroring — not after.

### Don't:
- **Don't** build dense dashboards with every feature visible at once. If it looks like Salesforce or SAP, it wasn't built for this user — and she'll know it immediately.
- **Don't** use pure `#FFFFFF` backgrounds or `#000000` text. Paper and Ink only.
- **Don't** import cold minimalism: white surfaces, micro-typography, zero warmth, precision without presence. If it feels like Notion or Linear, it doesn't feel like Bizify.
- **Don't** use dark mode with neon amber/cyan gradients or the aggressive "scale your business" hustle aesthetic. That register performs confidence instead of building it — the exact wrong emotional register for this user.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards, alerts, or list items. Use full borders, background tints, or leading icons instead.
- **Don't** use gradient text (`background-clip: text` with a gradient background). Amber and cyan appear as solid surfaces and glows — never as text decoration.
- **Don't** place two gradient buttons side by side. One amber gradient action per screen; a secondary action gets outline or ghost.
- **Don't** use glassmorphism (`backdrop-blur` + semi-transparent card) as a default style. It is reserved for overlay panels, modals, and the process-step onboarding card. Three instances at once is too many.
- **Don't** add modals as a first response. Inline edits, progressive disclosure, and contextual panels exhaust before a modal is considered.
