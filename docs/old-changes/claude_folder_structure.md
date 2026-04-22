# Folder Structure Proposal
## Goal: isolate the reusable scheduler so it can be copied to any project

The core idea is a single boundary line:

> **Everything inside `components/scheduler/` is reusable.**
> Everything outside is APS-specific.

To drop the scheduler into another project: copy `components/scheduler/` and its
corresponding hooks (`hooks/scheduler/`). That's the entire dependency.

---

## The Boundary — What Is vs Is Not Reusable

### Reusable (generic scheduler logic)
These files have zero APS knowledge — they only know about resources, bookings, dates, and grid layout.

| File | Currently lives at |
|---|---|
| `Scheduler.tsx` (= NewVirtualizedContainer) | `VirtualScheduler/NewVirtualizedContainer.tsx` |
| `SchedulerRow.tsx` | `VirtualScheduler/SchedulerRow.tsx` |
| `ResourceRow.tsx` | `VirtualScheduler/ResourceRow.tsx` |
| `BookingBlock.tsx` * | `VirtualScheduler/BookingBlock.tsx` |
| `DateCell.tsx` | `VirtualScheduler/DateCell.tsx` |
| `DateHeader.tsx` | `VirtualScheduler/DateHeader.tsx` |
| `SelectionOverlay.tsx` | `VirtualScheduler/SelectionOverlay.tsx` |
| `hooks/useSelectionState.ts` | `hooks/useSelectionState.ts` |
| `hooks/useDragState.ts` * | `hooks/useDragState.ts` |

\* needs minor cleanup before it's truly generic (see Phase 2 notes below)

### APS-specific (stays in the project)
These files contain APS API calls, APS modal forms, APS business rules, or hardcoded APS URLs.

| File | Reason it stays |
|---|---|
| `ReservationChart.tsx` | Orchestrates APS data + APS modals |
| `Filter/*` (7 files) | APS-specific filter UI |
| `Modals/CreateBookingModal/*` | APS booking creation form |
| `Modals/Abbreviation/` | APS legend |
| `Modals/PropertiesLegends/` | APS legend |
| `VirtualScheduler/ModalManager.tsx` | Wires APS modals to scheduler events |
| `VirtualScheduler/BookingDetailsModal.tsx` | APS booking detail tabs |
| `VirtualScheduler/BookingDetailsModal/*` | APS booking detail tabs |
| `VirtualScheduler/BookingContextMenu.tsx` | APS-specific actions + hardcoded URLs |
| `VirtualScheduler/ResourceContextMenu.tsx` | APS-specific actions |
| `VirtualScheduler/BookingChangeConfirmModal.tsx` | Could be generic, but currently APS-styled |
| `VirtualScheduler/SplitBookingModal.tsx` | APS business rule |
| `VirtualScheduler/SkipCheckInModal.tsx` | APS business rule |
| `VirtualScheduler/CancelCheckInModal.tsx` | APS business rule |
| `VirtualScheduler/BookingTooltip.tsx` | APS booking field names |
| `hooks/useSchedulerData.ts` | Fetches APS API endpoints |
| `hooks/useContextMenuState.ts` | Hardcoded APS URLs in window.open |
| `hooks/useModalState.ts` | Used by APS modal orchestration |
| `hooks/useAvailability.ts` | Parses APS-specific availability API shape |

---

## Proposed Structure

```
components/
│
├── scheduler/                          ← REUSABLE CORE — copy this to any project
│   ├── index.ts                        ← barrel: export { Scheduler } from './Scheduler'
│   ├── Scheduler.tsx                   ← main entry point (renamed from NewVirtualizedContainer)
│   ├── SchedulerRow.tsx
│   ├── ResourceRow.tsx
│   ├── BookingBlock.tsx
│   ├── DateCell.tsx
│   ├── DateHeader.tsx
│   ├── SelectionOverlay.tsx
│   └── hooks/
│       ├── useSelectionState.ts
│       └── useDragState.ts
│
└── ReservationChart/                   ← APS-SPECIFIC CONSUMER
    ├── ReservationChart.tsx            ← orchestrator: data + modals + scheduler
    ├── Filter/
    │   ├── FilterContainer.tsx
    │   ├── SearchApartmentFilter.tsx
    │   ├── BookingIdFilter.tsx
    │   ├── StartDateFilter.tsx
    │   ├── DaysFilter.tsx
    │   ├── CollaboratorFilter.tsx
    │   └── EnquiryIdFilter.tsx
    ├── Modals/
    │   ├── CreateBookingModal/         ← (stays as-is, already well organised)
    │   ├── Abbreviation/
    │   └── PropertiesLegends/
    └── Overlays/                       ← renamed from VirtualScheduler (these are overlays, not the scheduler)
        ├── ModalManager.tsx
        ├── BookingDetailsModal.tsx
        ├── BookingDetailsModal/
        ├── BookingContextMenu.tsx
        ├── ResourceContextMenu.tsx
        ├── BookingChangeConfirmModal.tsx
        ├── SplitBookingModal.tsx
        ├── SkipCheckInModal.tsx
        ├── CancelCheckInModal.tsx
        └── BookingTooltip.tsx

hooks/
├── scheduler/                          ← REUSABLE — copy alongside components/scheduler/
│   ├── useSelectionState.ts            (same files as components/scheduler/hooks/ — see note below)
│   └── useDragState.ts
│
├── useSchedulerData.ts                 ← APS-specific (stays)
├── useContextMenuState.ts              ← APS-specific (stays)
├── useModalState.ts                    ← APS-specific (stays)
├── useAvailability.ts                  ← APS-specific (stays)
├── useUser.ts                          ← app-wide (stays)
└── useApiWithErrorHandling.ts          ← app-wide (stays)
```

> **Note on hooks location:** The scheduler hooks (`useSelectionState`, `useDragState`) can either
> live inside `components/scheduler/hooks/` (collocated with the component — easiest to copy) or
> in a top-level `hooks/scheduler/` folder (consistent with the rest of the project's hooks convention).
> **Recommendation: collocate them inside `components/scheduler/hooks/`** so copying one folder
> is all that's needed. The top-level `hooks/` listing above shows them only for reference.

---

## What the `scheduler/index.ts` barrel looks like

```ts
export { default as Scheduler } from './Scheduler'

// Export types so the consumer can type their own callbacks
export type { SchedulerResource, SchedulerBooking, TimeRangeSelection, BookingMoveData } from './types'
```

The consumer in `ReservationChart.tsx` changes from:
```ts
import NewVirtualizedContainer from './VirtualScheduler/NewVirtualizedContainer'
```
to:
```ts
import { Scheduler } from '@/components/scheduler'
```

---

## Why rename `VirtualScheduler/` → `Overlays/`

The folder currently called `VirtualScheduler/` contains two very different things:
1. The scheduler grid itself (`NewVirtualizedContainer`, `SchedulerRow`, etc.) — **moving to `components/scheduler/`**
2. APS-specific modals and context menus (`BookingDetailsModal`, `SplitBookingModal`, etc.) — **staying**

After the scheduler grid moves out, what remains in that folder is entirely overlays
(modals + context menus). Calling it `Overlays/` makes it immediately clear what lives there.

---

## What changes in Phase 2 become simpler with this structure

Once the boundary is clear:

- Phase 2.1–2.5 (remove modals/menus from the scheduler) means moving files from `Overlays/`
  into `ReservationChart.tsx`'s responsibility — the folder already signals they don't belong
  inside the scheduler.
- Any APS-specific prop (`isSquareUser`, `ALLOWED_SALES_CHANNELS`) in `BookingBlock` becomes
  obviously wrong because `BookingBlock` lives in `components/scheduler/` which is supposed to
  have zero APS knowledge.
- Adding the scheduler to a new project means: copy `components/scheduler/`, install
  `@tanstack/react-virtual` and `dayjs`, import `<Scheduler />`, done.

---

## Files that need a small cleanup before they move

| File | Issue | Fix needed |
|---|---|---|
| `BookingBlock.tsx` | calls `useUser()` for `isSquareUser`; uses `ALLOWED_SALES_CHANNELS` | Move to a prop passed from consumer |
| `useDragState.ts` | hardcodes `user: 'Aperfect Stay'` in confirmation data | Remove — consumer provides this context |
| `DateHeader.tsx` | not wrapped in `React.memo` | Wrap before moving |

These are all Phase 2 items — they do not block the folder move itself.

---

## Migration order (if you confirm this structure)

1. ✅ Create `components/scheduler/` and `components/scheduler/hooks/`
2. ✅ Move the 7 reusable component files into `components/scheduler/`
3. ✅ Move `useSelectionState.ts` and `useDragState.ts` into `components/scheduler/hooks/`
4. ✅ Create `components/scheduler/index.ts` barrel
5. ✅ Rename `VirtualScheduler/` → `Overlays/` (what remains after the move)
6. ✅ Update all import paths
7. ✅ Verified — no broken imports remain

**Completed 2026-03-29.**
