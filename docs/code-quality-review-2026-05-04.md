# Code Quality & Refactoring Review
**Date:** 2026-05-04  
**Reviewer Perspective:** Senior Frontend Developer  
**Overall Score: 6.5 / 10**

This document covers what should be added, removed, and restructured across the codebase to make it more readable, maintainable, and production-ready.

---

## Table of Contents
1. [Remove Immediately](#1-remove-immediately)
2. [Fix Immediately — Security & Config](#2-fix-immediately--security--config)
3. [TypeScript Improvements](#3-typescript-improvements)
4. [Component Decomposition](#4-component-decomposition)
5. [Code Organization & Architecture](#5-code-organization--architecture)
6. [Styling Consistency](#6-styling-consistency)
7. [Logging & Debugging](#7-logging--debugging)
8. [Add — Missing Infrastructure](#8-add--missing-infrastructure)
9. [Quick Wins Summary](#9-quick-wins-summary)

---

## 1. Remove Immediately

These are dead weight — they add noise, confuse future readers, and are already captured in git history.

### Commented-Out Code Blocks

| File | Lines | Description |
|------|-------|-------------|
| `utils/proxyFetch.ts` | ~51–131 | Old proxy route configuration (~82 lines of commented code) |
| `components/scheduler/SchedulerRow.tsx` | ~29–46 | Old cleaning status color definitions (duplicate of active code below) |
| `app/api/proxy/add-reservation/route.ts` | ~36–60 | Example payload left in as comment block |
| `apiData/loginUserInfo.ts` | ~12–14 | Commented-out dev-env branching that was never removed |

**Rule:** If it's commented out and not a short `// TODO:` or `// NOTE: workaround for X`, delete it. Git blame is your history.

### Unused Imports

Run a one-time audit with ESLint `no-unused-vars` / `@typescript-eslint/no-unused-imports`. Several component files import utilities or icons that are no longer used after refactors.

---

## 2. Fix Immediately — Security & Config

### Hardcoded Email Addresses in Source Code

**File:** `contexts/UserContext.tsx` (~line 54–56)

```ts
// ❌ Current
if (email === 'stay@thesqua.re' || email === 'apsdemo2023@gmail.com') { ... }
```

These are production email addresses committed to source. Anyone with repo access can see them. Move this to an environment variable:

```ts
// ✅ Better
const SQUARE_USER_EMAILS = (process.env.NEXT_PUBLIC_SQUARE_EMAILS ?? '').split(',');
if (SQUARE_USER_EMAILS.includes(email)) { ... }
```

### Hardcoded API URLs

Multiple files contain hardcoded production domain strings. Every hardcoded URL is a future bug when the domain changes.

**Files affected:** `utils/proxyFetch.ts`, `lib/getUserDetails.ts`, `hooks/useSchedulerData.ts`

**Fix:** Create a single `config/env.ts` file:

```ts
// config/env.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
export const IS_DEV = process.env.NODE_ENV === 'development';
```

Import from there everywhere. One change propagates everywhere.

### Multiple Dev-Mode Checks

`process.env.NODE_ENV === 'development'` is scattered across files. Centralizing to the config file above means no duplication.

---

## 3. TypeScript Improvements

### Replace `any` With Proper Types

The `any` type defeats the purpose of TypeScript. Key offenders:

| File | Issue |
|------|-------|
| `hooks/useSchedulerData.ts` | `normalizeBooking` returns `any` |
| `components/scheduler/Scheduler.tsx` | Most props typed as `any` (lines 30–47) |
| `contexts/UserContext.tsx` | `admin_details` field typed as `any` |
| `ReservationChart.tsx` | Multiple local state variables typed as `any` |

**Fix Pattern:**

```ts
// ❌ Before
const normalizeBooking = (raw: any): any => { ... }

// ✅ After
const normalizeBooking = (raw: RawBookingAPIResponse): NormalizedBooking => { ... }
```

### Create a Centralized `types/` Directory

Currently, all interfaces are defined inside the file that uses them first. This means no shared source of truth.

**Proposed structure:**

```
types/
├── booking.ts       // Booking, NormalizedBooking, RawBookingAPIResponse
├── resource.ts      // Resource, Room, Property
├── user.ts          // User, AdminDetails, UserRole
├── scheduler.ts     // SchedulerRow, DateCell, VirtualItem
├── sse.ts           // SSEEvent, SSEReservationEvent
└── api.ts           // FetchResponse<T>, APIError, ProxyConfig
```

Move type definitions here, re-export from each file's own interface section if needed. This makes it immediately obvious what the data model looks like without reading implementation files.

### Fix `dateUtils.js` Extension

`utils/dateUtils.js` should be `utils/dateUtils.ts`. Mixing `.js` and `.ts` in a TypeScript project means the file gets no type checking. Rename it and add types to its function signatures.

---

## 4. Component Decomposition

### `PaymentDetails.tsx` — 440 lines

This is doing too much: rendering a table, handling edit state, managing form fields, formatting currency, and computing financial totals.

**Split into:**
- `PaymentSummaryTable.tsx` — read-only display
- `PaymentEditForm.tsx` — controlled form with state
- `usePaymentForm.ts` — hook for form state, validation, submit logic
- `paymentCalculations.ts` — pure functions for tax/commission math

### `SchedulerRow.tsx` — 329 lines

Contains: row positioning, sticky label rendering, expand/collapse toggle, cleaning status color mapping, and resource label rendering.

**Split into:**
- `SchedulerRow.tsx` — row positioning and virtual item wrapper only (~80 lines)
- `ResourceLabel.tsx` — sticky left-side label with expand/collapse
- `cleaningStatusUtils.ts` — pure mapping function for status → color

### `ReservationChart.tsx` — 272 lines

This component manages: visible date range, filter state, modal state, context menu state, booking data, SSE connection, availability, overbooking. That is too many responsibilities for one component.

**Extract:**
- `useReservationFilters.ts` — filter state + derived filtered data
- `useVisibleDateRange.ts` — date window calculation + navigation
- Keep `ReservationChart.tsx` as the composition root that just wires these hooks together and renders `<Scheduler>` + `<ModalManager>` + `<ContextMenuManager>`

---

## 5. Code Organization & Architecture

### Prop Drilling in the Scheduler Tree

`Scheduler` → `SchedulerRow` → `ResourceRow` → `DateCell` passes many props down multiple levels. Several of these (e.g. `onBookingClick`, `contextMenuHandlers`) never change and don't need to be re-passed on every render.

**Fix:** Create a `SchedulerContext` with React Context that holds stable callbacks and config. Child components read from context instead of receiving 8–10 props.

### Modal State Is Already Well-Structured — Keep It

`ModalManager.tsx` with a central `useModalState.ts` is the right pattern. Don't break this up further.

### `useSchedulerData.ts` — Add Proper Types and Remove Console Logs

The hook is well-written structurally (parallel fetches, cancellation tokens, SSE integration) but:
- `console.log` calls at lines 131 and 134 should be removed (or gated behind `IS_DEV`)
- `any` return from `normalizeBooking` makes the entire data pipeline untyped downstream

### `ErrorContext.tsx` — Is It Being Used Everywhere?

Review whether all API calls actually pipe errors into this context. Partial adoption means some errors are silently swallowed. Either commit to it fully or standardize error handling per-call.

---

## 6. Styling Consistency

### Problem: Mixed Inline Styles and Tailwind

Two approaches are being used simultaneously:

```tsx
// Inline style object (in SchedulerRow, Scheduler, AddressDetailsModal)
style={{ position: 'absolute', top: '0', left: '0', width: '100%' }}

// Tailwind class (everywhere else)
className="absolute top-0 left-0 w-full"
```

Inline styles bypass Tailwind's purging, can't be overridden with utility classes, and are harder to read.

**Rule:** Use Tailwind for all layout/spacing/color. Reserve `style={{}}` **only** for dynamic values that can't be expressed as Tailwind classes (e.g. `style={{ left: virtualItem.start + 'px' }}` — this is legitimate and fine).

### Existing Tailwind Usage Is Good

The project correctly uses `clsx` + `tailwind-merge` for conditional classes. This pattern should be standardized across all components that aren't doing it yet.

---

## 7. Logging & Debugging

### Remove or Gate All `console.log` Calls

Production builds should have zero console output that isn't an error.

**Files with logging:**

| File | Count | Notes |
|------|-------|-------|
| `lib/getUserDetails.ts` | 6 logs | Logs full user object including sensitive data |
| `hooks/useSchedulerData.ts` | 2 logs | Logs fetched booking arrays |
| Various API routes | Scattered | Logs request/response bodies |

**Fix:**

```ts
// Either remove entirely, or gate:
if (IS_DEV) console.log('[useSchedulerData] bookings:', bookings);
```

For server-side code (`lib/`, API routes), use a proper logger (even a thin wrapper around `console`) that respects `LOG_LEVEL` environment variable.

---

## 8. Add — Missing Infrastructure

### Testing Framework

There is no test setup at all. For a calendar/booking application with financial calculations and complex state, this is a real risk.

**Add (in priority order):**

1. **Vitest** — fast, TypeScript-native, works great with Next.js
2. **@testing-library/react** — component testing
3. Start with pure function unit tests first (payment calculations, date utils, overbooking logic) — these are the highest-value, lowest-effort tests

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event
```

### ESLint Rules to Add

The project has ESLint but likely runs with minimal rules. Add:

```json
// .eslintrc additions
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

Running this will immediately surface the problems described in sections 3 and 7.

### `.env.example` File

There is no `.env.example` documenting what variables are required. A new developer cloning this repo has no idea what to set. Add:

```env
# .env.example
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_SQUARE_EMAILS=email1@example.com,email2@example.com
```

---

## 9. Quick Wins Summary

These can each be done in under 30 minutes and improve the codebase significantly:

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 Now | Remove commented-out code in `proxyFetch.ts` | 5 min | High |
| 🔴 Now | Move hardcoded emails to env var | 15 min | High (security) |
| 🔴 Now | Remove all `console.log` calls or gate with `IS_DEV` | 20 min | Medium |
| 🟠 Soon | Rename `dateUtils.js` → `dateUtils.ts` | 10 min | Low |
| 🟠 Soon | Create `config/env.ts` and replace inline env checks | 30 min | High |
| 🟠 Soon | Add `.env.example` | 10 min | Medium |
| 🟠 Soon | Add ESLint `no-explicit-any` rule | 10 min | Medium |
| 🟡 Later | Create `types/` directory and migrate shared interfaces | 2–3 hrs | High |
| 🟡 Later | Break up `PaymentDetails.tsx` | 3–4 hrs | Medium |
| 🟡 Later | Extract `useReservationFilters.ts` from `ReservationChart.tsx` | 2 hrs | Medium |
| 🟡 Later | Add Vitest + first unit tests for payment calculations | 4 hrs | High |
| 🟢 Eventually | Add `SchedulerContext` to eliminate prop drilling | 4–6 hrs | Medium |

---

## What's Actually Good — Don't Touch These

- **SSE implementation** in `useSSEBookings.ts` — exponential backoff, AbortController, connection state tracking is solid
- **Virtualization** with TanStack Virtual — correct approach for large calendars, don't remove it
- **`ModalManager.tsx` pattern** — centralized modal state is the right call
- **Parallel fetch pattern** in `useSchedulerData.ts` — `Promise.all` with cancellation tokens is good
- **shadcn/ui + Tailwind** combo — correct choice for a custom calendar UI
- **Naming conventions** — hooks, components, and utilities are consistently named

---

*This document reflects the state of the codebase as of 2026-05-04. Prioritize security and type-safety fixes first, then readability, then architecture.*
