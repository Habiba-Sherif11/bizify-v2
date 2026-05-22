# Bizify v2 — Implementation Specification: Audit Fixes

Generated from `/impeccable audit` findings. Every issue is numbered and self-contained: prerequisites are called out explicitly so fixes can be batched safely.

**Score at audit: 11/20 (Acceptable)**
**Target score: 17+/20 (Good)**

---

## Reading this document

Each fix has:
- **File** — exact path from repo root
- **Lines** — the current range to change
- **Before / After** — concrete code diffs where the change is non-trivial
- **Prerequisite** — if another fix must land first
- **Test** — how to verify it worked

Fixes are ordered: theming foundation first (everything else depends on it), then accessibility (grouped by component), then animation, then responsive, then anti-patterns.

---

## 1. Theming Foundation

These two fixes must land before anything else. They establish the correct token layer that later fixes reference.

---

### ✅ FIX-T1 — Register brand accent tokens and correct base background

**Status: DONE**  
**Priority:** P0  
**File:** `src/styles/globals.css`  
**Lines:** 51–84 (`:root` block)

The `:root` block has two problems:

1. `--background`, `--card`, and `--popover` are `oklch(1 0 0)` — pure white. The design system prohibits pure white. Paper (`#FAFAFA`) maps to approximately `oklch(0.985 0 0)`.
2. Confidence Amber and Clarity Cyan exist nowhere as CSS custom properties. Every component uses raw Tailwind utility classes (`bg-amber-500`, `bg-cyan-600`), which means the token layer has no authority over the brand palette.

**Before (lines 51–84):**
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... rest unchanged ... */
}
```

**After:**
```css
:root {
  /* ── Brand accent tokens ─────────────────────────── */
  --brand-amber:       oklch(0.75  0.179  75.2);   /* #F59E0B  Confidence Amber  */
  --brand-amber-glow:  oklch(0.82  0.190  88.4);   /* #EAB308  Amber Glow        */
  --brand-cyan-deep:   oklch(0.47  0.130 214.0);   /* #0891B2  Clarity Cyan Deep */
  --brand-cyan:        oklch(0.56  0.130 210.0);   /* #06B6D4  Clarity Cyan      */

  /* ── Neutral tokens (corrected) ─────────────────── */
  --background:        oklch(0.985 0 0);            /* Paper — NOT pure white     */
  --foreground:        oklch(0.13  0.002 260);      /* Ink — warm near-black      */
  --card:              oklch(0.985 0 0);
  --card-foreground:   oklch(0.13  0.002 260);
  --popover:           oklch(0.985 0 0);
  --popover-foreground:oklch(0.13  0.002 260);
  --primary:           oklch(0.75  0.179  75.2);   /* Amber as primary           */
  --primary-foreground:oklch(0.13  0.002 260);
  --secondary:         oklch(0.97  0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted:             oklch(0.97  0 0);
  --muted-foreground:  oklch(0.556 0 0);
  --accent:            oklch(0.97  0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive:       oklch(0.577 0.245 27.325);
  --border:            oklch(0.922 0 0);
  --input:             oklch(0.922 0 0);
  --ring:              oklch(0.56  0.130 210.0);   /* Cyan as focus ring         */
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.556 0 0);
}
```

Also add brand tokens to `@theme inline` so Tailwind can reference them:

**After (add inside the `@theme inline` block, lines 7–49):**
```css
  --color-brand-amber:      var(--brand-amber);
  --color-brand-amber-glow: var(--brand-amber-glow);
  --color-brand-cyan-deep:  var(--brand-cyan-deep);
  --color-brand-cyan:       var(--brand-cyan);
```

**Test:** Open any page. The base background should be a very slightly off-white (#FAFAFA) instead of pure white. Focus any input — the ring should be cyan.

---

### ✅ FIX-T2 — Remove hard-coded `bg-white` from landing and auth page roots

**Status: DONE**  
**Priority:** P1  
**Prerequisite:** FIX-T1

Once `--background` is Paper, `bg-background` gives the correct value. Replace explicit `bg-white` usages on page wrapper elements.

**File:** `src/app/page.tsx` — line 9  
```tsx
/* Before */
<div className="flex flex-col bg-white">

/* After */
<div className="flex flex-col bg-background">
```

**File:** `src/app/(auth)/login/page.tsx` — line 9  
```tsx
/* Before */
<div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center bg-white/80 lg:bg-white ...">

/* After */
<div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center bg-background/80 lg:bg-background ...">
```

Also update the inner form card on the same page:
```tsx
/* Before — line 14 */
<div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">

/* After */
<div className="rounded-xl border border-gray-200/80 bg-background p-6 shadow-sm">
```

**File:** `src/app/(auth)/signup/page.tsx` — line 5  
```tsx
/* Before */
<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">

/* After */
<div className="min-h-screen bg-muted flex items-center justify-center px-4 py-8">
```

**File:** `src/app/(auth)/forgot-password/page.tsx` — line 5  
```tsx
/* Before */
<div className="min-h-screen flex items-center justify-center bg-white px-4">

/* After */
<div className="min-h-screen flex items-center justify-center bg-background px-4">
```

**File:** `src/app/(auth)/reset-password/page.tsx` — line 26  
```tsx
/* Before */
<div className="min-h-screen flex items-center justify-center bg-white px-4">

/* After */
<div className="min-h-screen flex items-center justify-center bg-background px-4">
```

**Test:** Auth pages and landing page should have a very slightly warm off-white base rather than clinical white.

---

## 2. Animation

### ✅ FIX-A1 — Replace banned bounce easing globally

**Status: DONE**  
**Priority:** P1  
**File:** `src/styles/animations.css`  
**Lines:** 3, 91

`cubic-bezier(0.2, 0.9, 0.4, 1.1)` — the Y2 control point of `1.1` overshoots the final value, producing a spring/bounce effect. The design laws explicitly ban bounce and elastic easing. The correct substitute is ease-out-expo: `cubic-bezier(0.16, 1, 0.3, 1)` — fast entry, smooth deceleration, zero overshoot.

**Before (line 3):**
```css
--anim-easing: cubic-bezier(0.2, 0.9, 0.4, 1.1);
```

**After:**
```css
--anim-easing: cubic-bezier(0.16, 1, 0.3, 1);
```

This variable is referenced on lines 28–29, 45–46, and 91 via `var(--anim-easing)` — all three are corrected automatically by the single change above. No further edits needed in animations.css.

**Test:** Scroll the landing page. Cards and sections should fade in with a confident ease-out — no spring-back at the end of the animation.

---

## 3. Accessibility — Navbar

### ✅ FIX-B1 — Add `aria-label` to `<nav>` landmark

**Status: DONE**  
**Priority:** P3  
**File:** `src/components/sections/navbar.tsx`  
**Line:** 53

When multiple `<nav>` elements exist on a page, WCAG 2.4.1 requires them to be distinguishable. Adding `aria-label` costs one attribute.

**Before:**
```tsx
<nav
  className={`fixed top-0 w-full z-50 transition-all duration-300 ${...}`}
>
```

**After:**
```tsx
<nav
  aria-label="Main navigation"
  className={`fixed top-0 w-full z-50 transition-all duration-300 ${...}`}
>
```

---

### ✅ FIX-B2 — Add Escape key handler to mobile menu overlay

**Status: DONE**  
**Priority:** P3  
**File:** `src/components/sections/navbar.tsx`  
**Lines:** 137–143

The mobile overlay closes on click but has no keyboard handler. A keyboard user who opens the menu has no standard way to close it without tabbing through every item.

**Before:**
```tsx
<div
  className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
    isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
  }`}
  onClick={() => setIsMenuOpen(false)}
/>
```

**After:**
```tsx
<div
  className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
    isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
  }`}
  onClick={() => setIsMenuOpen(false)}
  onKeyDown={(e) => e.key === "Escape" && setIsMenuOpen(false)}
  role="presentation"
/>
```

Also add an Escape handler to the menu panel itself so it fires even when focus is inside:

**File:** `src/components/sections/navbar.tsx` — line 146 (the mobile panel div)

**Before:**
```tsx
<div
  className={`fixed top-0 right-0 z-40 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${
    isMenuOpen ? "translate-x-0" : "translate-x-full"
  }`}
>
```

**After:**
```tsx
<div
  className={`fixed top-0 right-0 z-40 h-full w-full max-w-sm bg-background shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${
    isMenuOpen ? "translate-x-0" : "translate-x-full"
  }`}
  onKeyDown={(e) => e.key === "Escape" && setIsMenuOpen(false)}
>
```

(The `bg-white` → `bg-background` change here also applies FIX-T2 to the mobile panel.)

---

### ✅ FIX-B3 — aria-hidden on decorative icons in Navbar

**Status: DONE**  
**Priority:** P1  
**File:** `src/components/sections/navbar.tsx`  
**Lines:** 127–131 (hamburger/X icons)

The Menu and X icons are purely decorative — the button already has `aria-label="Toggle menu"`. The icons should be hidden from the accessibility tree.

**Before:**
```tsx
{isMenuOpen ? (
  <X className="h-6 w-6 text-neutral-700" />
) : (
  <Menu className="h-6 w-6 text-neutral-700" />
)}
```

**After:**
```tsx
{isMenuOpen ? (
  <X className="h-6 w-6 text-neutral-700" aria-hidden="true" />
) : (
  <Menu className="h-6 w-6 text-neutral-700" aria-hidden="true" />
)}
```

Also on line 169 (Close button X icon inside the mobile panel):
```tsx
/* Before */
<X className="h-5 w-5 text-neutral-700" />

/* After */
<X className="h-5 w-5 text-neutral-700" aria-hidden="true" />
```

---

## 4. Accessibility — DashboardHeader

### ✅ FIX-C1 — Add ARIA to the user dropdown trigger and menu

**Status: DONE**  
**Priority:** P1  
**File:** `src/features/entrepreneur/components/DashboardHeader.tsx`  
**Lines:** 103–161

The dropdown trigger button has no `aria-expanded` or `aria-haspopup`. The menu container has no `role="menu"`. Each item has no `role="menuitem"`. Screen readers cannot identify or navigate this pattern.

**Before (trigger button, line 104–109):**
```tsx
<button
  type="button"
  onClick={() => setShowMenu((v) => !v)}
  className="flex items-center gap-2.5 cursor-pointer"
>
```

**After:**
```tsx
<button
  type="button"
  onClick={() => setShowMenu((v) => !v)}
  aria-expanded={showMenu}
  aria-haspopup="menu"
  aria-label="User menu"
  className="flex items-center gap-2.5 cursor-pointer"
>
```

**Before (menu container div, line 132):**
```tsx
<div className="absolute top-full mt-2 start-0 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg p-1 z-50 min-w-44">
  <button type="button" onClick={handleProfileClick} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer">
    <User size={14} />
    Profile
  </button>
  <button type="button" onClick={handleSettingsClick} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer">
    <Settings size={14} />
    Settings
  </button>
  <div className="my-1 h-px bg-gray-100 dark:bg-neutral-700" />
  <button type="button" onClick={handleLogoutClick} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg cursor-pointer">
    <LogOut size={14} />
    Log out
  </button>
</div>
```

**After:**
```tsx
<div
  role="menu"
  aria-label="User options"
  className="absolute top-full mt-2 start-0 bg-background border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg p-1 z-50 min-w-44"
>
  <button
    type="button"
    role="menuitem"
    onClick={handleProfileClick}
    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer"
  >
    <User size={14} aria-hidden="true" />
    Profile
  </button>
  <button
    type="button"
    role="menuitem"
    onClick={handleSettingsClick}
    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer"
  >
    <Settings size={14} aria-hidden="true" />
    Settings
  </button>
  <div role="separator" className="my-1 h-px bg-gray-100 dark:bg-neutral-700" />
  <button
    type="button"
    role="menuitem"
    onClick={handleLogoutClick}
    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg cursor-pointer"
  >
    <LogOut size={14} aria-hidden="true" />
    Log out
  </button>
</div>
```

---

### ✅ FIX-C2 — Fix LogoutConfirmDialog: ARIA modal + focus trap + Escape

**Status: DONE**  
**Priority:** P0  
**File:** `src/features/entrepreneur/components/DashboardHeader.tsx`  
**Lines:** 11–42

The dialog overlay has no `role="dialog"`, no `aria-modal`, and no `aria-labelledby`. Focus is not trapped — a keyboard user can tab through the page behind it. Escape does not close it.

**Full replacement of `LogoutConfirmDialog`:**

```tsx
import { useEffect, useRef } from "react";

function LogoutConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the Cancel button on mount; restore focus on unmount is handled by React
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Trap Tab inside the dialog; close on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-desc"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="bg-background dark:bg-neutral-800 rounded-2xl p-6 shadow-xl w-full max-w-sm mx-4"
      >
        <h3 id="logout-dialog-title" className="text-base font-semibold text-gray-900 dark:text-white">
          Log out?
        </h3>
        <p id="logout-dialog-desc" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to log out of your account?
        </p>
        <div className="mt-5 flex gap-3 justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-neutral-100 dark:bg-neutral-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
```

Add `useEffect` and `useRef` to the imports at the top of the file (line 3):
```tsx
import { Bell, ChevronDown, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
```

---

### ✅ FIX-C3 — aria-hidden on decorative icons in DashboardHeader

**Status: DONE**  
**Priority:** P1  
**File:** `src/features/entrepreneur/components/DashboardHeader.tsx`

All icons in this file are decorative (parent elements carry the accessible name via text or `title`). Add `aria-hidden="true"` to every Lucide icon:

| Line | Icon | Change |
|------|------|--------|
| 120 | `ChevronDown` | add `aria-hidden="true"` |
| 172–173 | `Sun` / `Moon` | add `aria-hidden="true"` on each |
| 182 | `Bell` | add `aria-hidden="true"` |

**Bell button specifically** — `title` is not reliable for screen readers. Replace the `title` prop on `NavButton` with an `aria-label` on the wrapping button. Since `NavButton` accepts a `title` prop and passes it as HTML `title`, also accept `aria-label` and forward it:

**Before (`NavButton`, lines 46–65):**
```tsx
function NavButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-9 h-9 justify-center bg-white dark:bg-neutral-800 rounded-[10px] outline-[0.67px] outline-offset-[-0.67px] outline-black/10 dark:outline-white/10 flex items-center cursor-pointer"
    >
      {children}
    </button>
  );
}
```

**After:**
```tsx
function NavButton({
  children,
  onClick,
  title,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      className="w-11 h-11 justify-center bg-background dark:bg-neutral-800 rounded-[10px] outline-[0.67px] outline-offset-[-0.67px] outline-black/10 dark:outline-white/10 flex items-center cursor-pointer"
    >
      {children}
    </button>
  );
}
```

Note: `w-9 h-9` → `w-11 h-11` here also applies FIX-R1 (touch targets). `bg-white` → `bg-background` applies FIX-T2.

Update the Notifications `NavButton` call (line 179):
```tsx
/* Before */
<NavButton title="Notifications">

/* After */
<NavButton aria-label="Notifications">
```

---

## 5. Accessibility — AiSearchBar

### ✅ FIX-D1 — Associate label with input; aria-hidden on Sparkles icon

**Status: DONE**  
**Priority:** P1  
**File:** `src/features/entrepreneur/components/AiSearchBar.tsx`  
**Lines:** 27–44

The `<input>` has no associated `<label>`. WCAG 1.3.1 requires every form control to have a programmatic label. The `placeholder` alone is not sufficient. The Sparkles icon is decorative but not `aria-hidden`.

**Before (lines 27–44):**
```tsx
<div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-3 px-4 py-3">
  <Sparkles size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleSubmit(query)}
    placeholder="Ask Bizify anything — validate an idea, find a supplier, draft a pitch…"
    className="flex-1 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none min-w-0"
  />
  <button
    type="button"
    onClick={() => handleSubmit(query)}
    className="shrink-0 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(245,158,11,0.35)] hover:shadow-[0_2px_16px_rgba(245,158,11,0.5)] transition-shadow whitespace-nowrap cursor-pointer"
  >
    Ask AI
  </button>
</div>
```

**After:**
```tsx
<div className="bg-background dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-3 px-4 py-3">
  <label htmlFor="ai-search" className="sr-only">
    Ask Bizify
  </label>
  <Sparkles size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" aria-hidden="true" />
  <input
    id="ai-search"
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleSubmit(query)}
    placeholder="Ask Bizify anything — validate an idea, find a supplier, draft a pitch…"
    className="flex-1 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none min-w-0"
  />
  <button
    type="button"
    onClick={() => handleSubmit(query)}
    className="shrink-0 px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(245,158,11,0.35)] hover:shadow-[0_2px_16px_rgba(245,158,11,0.5)] transition-shadow whitespace-nowrap cursor-pointer"
  >
    Ask AI
  </button>
</div>
```

Note: `bg-white` → `bg-background` (FIX-T2). `py-1.5` → `py-2 min-h-[44px]` on the Ask AI button (FIX-R2 for that element).

---

### ✅ FIX-D2 — Suggestion buttons touch target

**Status: DONE** (applied during FIX-D1)  
**Priority:** P2  
**File:** `src/features/entrepreneur/components/AiSearchBar.tsx`  
**Lines:** 51–59

Suggestion chips use `py-1` (8px top/bottom + ~14px font ≈ 30px total). Under the 44px floor.

**Before:**
```tsx
className="px-2.5 sm:px-3 py-1 rounded-xl border border-amber-400 ..."
```

**After:**
```tsx
className="px-2.5 sm:px-3 py-2.5 rounded-xl border border-amber-400 ..."
```

---

## 6. Accessibility — RecentActivity

### ✅ FIX-E1 — Convert div grid to semantic table

**Status: DONE**  
**Priority:** P2  
**File:** `src/features/entrepreneur/components/RecentActivity.tsx`  
**Lines:** 58–113

The component uses a CSS grid to render tabular data (rows with Activity, Module, Time columns) without any semantic table markup. Screen readers have no way to associate header labels with data cells.

**Full replacement of the table section (lines 58–113):**

```tsx
<div className="bg-background dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60">
        <th
          scope="col"
          className="px-4 sm:px-5 py-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
        >
          Activity
        </th>
        <th
          scope="col"
          className="hidden sm:table-cell px-3 py-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center"
        >
          Module
        </th>
        <th scope="col" className="px-4 sm:px-5 py-3 sr-only">
          Time
        </th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <tr
            key={item.id}
            className="border-b border-zinc-100 dark:border-neutral-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-neutral-700/30 transition-colors"
          >
            <td className="px-4 sm:px-5 py-3 sm:py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    item.iconBg
                  )}
                  aria-hidden="true"
                >
                  <Icon size={13} className="text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm text-gray-800 dark:text-gray-100 block truncate">
                    {item.activity}
                  </span>
                  <div className="mt-1 sm:hidden">
                    <ModuleBadge item={item} />
                  </div>
                </div>
              </div>
            </td>
            <td className="hidden sm:table-cell px-3 py-3.5">
              <div className="flex items-center justify-center">
                <ModuleBadge item={item} />
              </div>
            </td>
            <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-right">
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {item.time}
              </span>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
```

---

## 7. Accessibility — FeatureCard

### ✅ FIX-F1 — aria-hidden on decorative icon

**Status: DONE**  
**Priority:** P1  
**File:** `src/features/entrepreneur/components/FeatureCard.tsx`  
**Line:** 34

The icon inside the card is purely decorative; the button's accessible name comes from the `title` paragraph text that follows.

**Before:**
```tsx
<Icon size={18} className="text-white" />
```

**After:**
```tsx
<Icon size={18} className="text-white" aria-hidden="true" />
```

---

## 8. Accessibility — ProblemsSection

### ✅ FIX-G1 — aria-hidden on problem icons

**Status: DONE**  
**Priority:** P1  
**File:** `src/components/sections/problems.tsx`  
**Line:** 62

Icons are decorative; the heading below each card provides the label.

**Before:**
```tsx
<problem.icon className="w-5 h-5" />
```

**After:**
```tsx
<problem.icon className="w-5 h-5" aria-hidden="true" />
```

---

## 9. Responsive Design

### ✅ FIX-R1 — NavButton touch target: 36px → 44px

**Status: DONE** (applied during FIX-C3)  
**Priority:** P2  
**File:** `src/features/entrepreneur/components/DashboardHeader.tsx`  
**Line:** 60

Already covered in FIX-C3 (the `NavButton` rewrite changes `w-9 h-9` to `w-11 h-11`). No separate change needed if FIX-C3 is applied.

---

### ✅ FIX-R2 — Mobile nav links minimum tap height

**Status: DONE** (applied during FIX-B3 batch)  
**Priority:** P2  
**File:** `src/components/sections/navbar.tsx`  
**Line:** 181

`py-2.5` yields approximately 34px tap height. PRODUCT.md requires 44px.

**Before:**
```tsx
className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
```

**After:**
```tsx
className="px-4 py-3 min-h-[44px] flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
```

---

## 10. Performance

### ✅ FIX-P1 — Throttle scroll listener with rAF

**Status: DONE**  
**Priority:** P2  
**File:** `src/components/sections/navbar.tsx`  
**Lines:** 28–31

The scroll handler fires synchronously on every scroll event. On a 120 Hz display during a fast swipe this can fire hundreds of times per second.

**Before:**
```tsx
useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 10);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

**After:**
```tsx
useEffect(() => {
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

The `{ passive: true }` option tells the browser this listener will not call `preventDefault()`, allowing scroll to start immediately without waiting for the JS handler to return.

---

## 11. Anti-Patterns

### ✅ FIX-AP1 — ProblemsSection glassmorphism

**Status: DONE**  
**Priority:** P2  
**File:** `src/components/sections/problems.tsx`  
**Line:** 58

`border border-white/70 bg-white/60 backdrop-blur-md` on four simultaneously visible cards is glassmorphism used as a default card style — explicitly banned. Glassmorphism is reserved for overlay panels. In the Problems section the cards sit over a background image; the overlay already has `bg-white/72` applied at the section level. The cards can use a solid-but-warm surface.

**Before:**
```tsx
<Card
  key={idx}
  className="p-4 sm:p-5 border border-white/70 bg-white/60 backdrop-blur-md shadow-sm transition-colors duration-200 hover:bg-white/70"
>
```

**After:**
```tsx
<Card
  key={idx}
  className="p-4 sm:p-5 border border-neutral-200/80 bg-background shadow-sm transition-shadow duration-200 hover:shadow-md"
>
```

---

### ✅ FIX-AP2 — Dashboard feature card grid (design-level anti-pattern)

**Status: DONE**  
**Priority:** P1  
**File:** `src/app/entrepreneur/page.tsx`  
**Lines:** 40–67 (the `FEATURE_CARD_CONFIGS` array and the grid section)  
**File:** `src/features/entrepreneur/components/FeatureCard.tsx` (the component itself)

This is the only fix that requires a design decision before implementation, so it is described as a specification rather than a drop-in replacement.

**The problem:** Four identical-structure cards in a uniform 4-column grid. The design laws call this out by name. More importantly, PRODUCT.md says the interface must tell the user what to do next — a feature catalogue with equal visual weight does the opposite.

**The required redesign:**

The four modules have different user journey priority:
- **Ideas + AI Chat** — primary. This is where the user spends session time. One of them should be the clear primary action on any given visit.
- **Team + Marketplace** — secondary. These are supporting surfaces the user visits less frequently.

**Implementation approach:**

Replace the `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5` uniform grid with a two-tier layout:

```
┌─────────────────────────┬─────────────────────────┐
│  My Ideas               │  AI Chat                │
│  [larger, more detail]  │  [larger, more detail]  │
└──────────────┬──────────┴──────────┬──────────────┘
               │  Team  │ Marketplace│
               └────────┴────────────┘
```

- Primary row: Ideas and AI Chat as half-width cards (`grid-cols-2`) with more vertical height and room for a status line (e.g. "3 ideas saved" for Ideas, "Last chat: yesterday" for AI Chat).
- Secondary row: Team and Marketplace as quarter-width cards (`grid-cols-2` on the same row) — smaller, less detailed.
- The amber gradient on the primary CTA button inside the primary-row cards should be on whichever module is the user's "next step" based on session state. If that logic doesn't exist yet, apply the amber CTA to Ideas only and use an outline or ghost for AI Chat.

**`FeatureCard` component should be split into two variants:** `FeatureCardPrimary` (tall, with subtitle, status line, amber CTA) and `FeatureCardSecondary` (compact, icon + label, no CTA button). Or accept a `variant` prop.

**This fix requires running `/impeccable shape dashboard feature navigation` to nail down the exact layout before writing code.**

---

## 12. Button component size audit

### ✅ FIX-Q1 — `size="icon"` and `size="lg"` are under 44px

**Status: DONE**  
**Priority:** P2  
**File:** `src/components/ui/button.tsx`  
**Lines:** 31–36

The current height definitions:

| Size | Height |
|------|--------|
| `default` | `h-8` = 32px |
| `sm` | `h-7` = 28px |
| `lg` | `h-9` = 36px |
| `icon` | `size-8` = 32px |
| `icon-lg` | `size-9` = 36px |

None of these meet the 44px WCAG 2.5.5 floor. For interactive elements that are the primary action on mobile, use `h-11` (44px) on `lg` and `size-11` on `icon-lg`.

**Before (lines 27–36):**
```tsx
size: {
  default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs ...",
  sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] ...",
  lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  icon: "size-8",
  "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] ...",
  "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] ...",
  "icon-lg": "size-9",
},
```

**After:**
```tsx
size: {
  default: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs ...",
  sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] ...",
  lg: "h-11 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
  icon: "size-9",
  "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] ...",
  "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] ...",
  "icon-lg": "size-11",
},
```

Raise `default` from 32 → 36px and `lg` from 36 → 44px. `icon-lg` from 36 → 44px. Leave `xs`, `icon-xs`, `icon-sm` unchanged — these are intentionally small for dense UI contexts (badges, table actions) where they are not the primary hit target.

---

## Implementation order

Run fixes in this sequence to avoid conflicts:

```
Phase 1 — Foundation
  FIX-T1   globals.css tokens + background fix
  FIX-T2   bg-white → bg-background across pages

Phase 2 — Animation
  FIX-A1   bounce easing → ease-out-expo

Phase 3 — Accessibility (components with no cross-dependencies)
  FIX-B1   nav aria-label
  FIX-B2   Escape key on mobile overlay
  FIX-B3   aria-hidden on navbar icons
  FIX-C1   dropdown ARIA (trigger + menu + items)
  FIX-C2   LogoutConfirmDialog (ARIA modal + focus trap)
  FIX-C3   aria-hidden + NavButton size + aria-label for bell  ← also applies FIX-R1
  FIX-D1   AiSearchBar label + sparkles aria-hidden
  FIX-D2   suggestion button tap target
  FIX-E1   RecentActivity → semantic table
  FIX-F1   FeatureCard icon aria-hidden
  FIX-G1   ProblemsSection icon aria-hidden

Phase 4 — Responsive + Performance
  FIX-Q1   button.tsx size scale
  FIX-R2   mobile nav link tap height
  FIX-P1   throttle scroll listener

Phase 5 — Anti-patterns
  FIX-AP1  ProblemsSection glassmorphism → solid card
  FIX-AP2  Dashboard card grid → tiered layout (design-first)

Phase 6 — Final pass
  /impeccable polish
```

---

## Expected score after all fixes

| Dimension | Current | Expected |
|-----------|---------|----------|
| Accessibility | 2 | 4 |
| Performance | 3 | 4 |
| Theming | 1 | 3 |
| Responsive Design | 3 | 4 |
| Anti-Patterns | 2 | 3 |
| **Total** | **11/20** | **18/20** |

Theming lands at 3 rather than 4 because brand accent classes (`bg-amber-500`, `bg-cyan-600`) in components are not migrated to CSS-variable-based tokens in this spec — that is a wider refactor beyond the audit scope. Anti-patterns lands at 3 because FIX-AP2 is design-dependent and may not fully eliminate the card-grid pattern depending on the shape outcome.
