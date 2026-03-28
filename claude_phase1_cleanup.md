# Phase 1 — Dead Code Cleanup
## Change Tracking Document

Goal: remove all dead code before starting the Phase 2 reusability refactor.
Each item is marked **Done** or **Pending**.

---

## Changes

### 1. Remove `USE_NEW_CONTAINER` flag and `VirtualScheduler` dead code path
**Status: ✅ Done**

**Files changed:**
- `components/ReservationChart/ReservationChart.tsx`
- `components/ReservationChart/VirtualScheduler/VirtualScheduler.tsx` — **deleted**

**What was removed:**
```ts
// Removed constant
const USE_NEW_CONTAINER = true

// Removed import
import VirtualScheduler from './VirtualScheduler/VirtualScheduler'

// Removed conditional render — now always renders NewVirtualizedContainer directly
{USE_NEW_CONTAINER ? (
  <NewVirtualizedContainer ... />
) : (
  <VirtualScheduler ... />
)}
```

**Why:** `USE_NEW_CONTAINER` was always `true`. The `VirtualScheduler` branch was never reached. Keeping it created a false impression that both implementations were in use and added import weight.

---

### 2. Remove unused `bookings` prop from `NewVirtualizedContainer`
**Status: ✅ Done**

**Files changed:**
- `components/ReservationChart/VirtualScheduler/NewVirtualizedContainer.tsx`
- `components/ReservationChart/ReservationChart.tsx`

**What was removed:**
```ts
// Removed from component props
bookings = [],

// Removed from call site in ReservationChart
bookings={bookings}
```

**What was added:**
A proper TypeScript interface `NewVirtualizedContainerProps` — previously the component had no interface, so TypeScript inferred all types from defaults (causing `never[]` for arrays, `null` for optional strings). The interface also changed `startDate = null` to `startDate = undefined` to match the `string | undefined` type that `generateDateRange` expects.

**Why:** `bookings` was never read inside `NewVirtualizedContainer` — `bookingsByResourceId` (the pre-grouped Map) is used everywhere instead. The prop was a leftover from an earlier version.

---

### 3. Fix duplicate `AbbreviationsModal` in `FilterContainer`
**Status: ✅ Done**

**File changed:** `components/ReservationChart/Filter/FilterContainer.tsx`

**What was removed:**
```tsx
// Line 64 — always-mounted instance inside the toolbar (removed)
<AbbreviationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
```

**What remains (correct):**
```tsx
// Line 86 — conditional instance outside the toolbar (kept)
{isModalOpen && <AbbreviationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
```

**Why:** Both instances mounted simultaneously when `isModalOpen` was true. The one inside the toolbar div was always in the DOM (even when closed), and both rendered when open — a visual double-mount bug.

---

### 4. Remove dead `availabilityData` prop from `ResourceRow` and its call chain
**Status: ✅ Done**

**Files changed:**
- `components/ReservationChart/VirtualScheduler/ResourceRow.tsx`
- `components/ReservationChart/VirtualScheduler/SchedulerRow.tsx`
- `components/ReservationChart/VirtualScheduler/NewVirtualizedContainer.tsx`

**What was removed:**
```ts
// ResourceRow interface
availabilityData?: Record<string, any>

// ResourceRow destructuring
availabilityData = {},

// SchedulerRow interface
availabilityByResource: any

// SchedulerRow destructuring
availabilityByResource,

// SchedulerRow → ResourceRow call
availabilityData={availabilityByResource}

// NewVirtualizedContainer — destructure from useAvailability
const { availabilityByResource, totalAvailabilityByDate, availabilityByParent } = ...
// Now:
const { totalAvailabilityByDate, availabilityByParent } = ...

// NewVirtualizedContainer → SchedulerRow call
availabilityByResource={availabilityByResource}
```

**Why:** `availabilityData` mapped to `availabilityByResource` — per-apartment availability data. The API does not populate this field (documented in `useAvailability.ts`). The prop flowed through 3 components and was never used by any of them. Removing it eliminates 6 lines of dead plumbing across the render tree.

---

### 5. Remove hardcoded admin email from `FilterContainer`
**Status: ⏳ Pending** *(deferred by user — requires `useUser` role check)*

**File:** `components/ReservationChart/Filter/FilterContainer.tsx`

**What needs to change:**
```tsx
// Current — hardcoded email in JSX
{(user?.email === 'stay@thesqua.re') && (
  <div>...</div>
)}

// Target — role check from useUser
const { isAdmin } = useUser()
...
{isAdmin && (
  <div>...</div>
)}
```

**Why deferred:** Requires confirming what `useUser` exposes and whether an `isAdmin` flag exists or needs to be added. Skipping this to avoid modifying auth logic without full context.

---

## Phase 2 — Reusability Refactor (upcoming)

The goal is to make `NewVirtualizedContainer` a standalone, drop-in scheduler component with no APS-specific logic inside it. Like DayPilot: pass data in, get events out.

### Target API
```tsx
<Scheduler
  resources={resources}
  bookings={bookings}

  // All optional — grid renders fine with none of these
  onTimeRangeSelect={(selection) => openCreateModal(selection)}
  onBookingClick={(booking) => openDetailsModal(booking)}
  onBookingMove={(booking, newDates) => showConfirmDialog(booking, newDates)}
  onBookingRightClick={(booking, pos) => showContextMenu(booking, pos)}
  onResourceRightClick={(resource, pos) => showResourceMenu(resource, pos)}
  onResourcesChange={(updated) => setResources(updated)}
/>
```

### Planned changes (in order)

| # | Change | Status |
|---|---|---|
| 2.1 | Change `useSelectionState` to fire `onTimeRangeSelect(selection)` instead of managing `modalOpen` | ⏳ Pending |
| 2.2 | Change `useDragState` to fire `onBookingMove(booking, newDates)` instead of managing `changeConfirmation` | ⏳ Pending |
| 2.3 | Remove `useContextMenuState` from scheduler — fire `onBookingRightClick` / `onResourceRightClick` events instead | ⏳ Pending |
| 2.4 | Remove `useModalState` from scheduler | ⏳ Pending |
| 2.5 | Remove `ModalManager` from scheduler render — consumer renders its own modals | ⏳ Pending |
| 2.6 | Move `isSquareUser` / `ALLOWED_SALES_CHANNELS` out of `BookingBlock` — consumer passes as prop | ⏳ Pending |
| 2.7 | Remove hardcoded `user: 'Aperfect Stay'` from `useDragState` confirmation data | ⏳ Pending |
| 2.8 | Rename `NewVirtualizedContainer` → `Scheduler` (or `ResourceScheduler`) | ⏳ Pending |
| 2.9 | Wire up all callbacks in `ReservationChart` — open APS-specific modals in response to scheduler events | ⏳ Pending |
