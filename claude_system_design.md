# PMS Calendar — Senior Frontend System Design

How I would design this system from scratch, knowing what the domain requires.

---

## 1. The Core Problem

A PMS calendar is fundamentally a **2D read-heavy data grid**:
- X axis: time (days)
- Y axis: resources (apartments)
- Cells: booking blocks that span multiple columns

Three things make it hard:
1. The grid can be very wide (90+ days × 100px = 9000px) and very tall (200+ apartments)
2. Booking blocks don't fit neatly into cells — they span across column boundaries
3. Both axes need frozen headers (resource column pinned left, date row pinned top)

Everything else — drag & drop, modals, overbooking — is secondary to getting the grid right.

---

## 2. Rendering Architecture

### Single scroll container (what we have now)

```
┌─────────────────────────────────────────────────────────┐
│  [sticky top + sticky left]  │  [sticky top]            │
│  "Apartments" corner         │  date header cells       │
├──────────────────────────────┼──────────────────────────┤
│  [sticky left]               │                          │
│  Building A                  │  (availability cells)    │
├──────────────────────────────┼──────────────────────────┤
│  [sticky left]                                          │
│    Room 101                  │  ████ booking ████       │
└─────────────────────────────────────────────────────────┘
         ONE <div overflow-auto> — browser handles both axes
```

**Why this is the right call:**
- Two-pane + JS scroll sync (the DayPilot approach) always has jitter. RAF callbacks fire after paint, so fast scrolling shows a brief desync. Browser native sticky has zero lag by design.
- Single container also means one event target for all scroll events, one ResizeObserver, one ref.

### Virtualization: rows only, never columns

Virtualizing columns (date cells) would break booking blocks. A booking from Jan 1–Jan 20 is a single DOM element whose `width = 20 × cellWidth`. If you remove column 5 from the DOM, that element's position calculation breaks.

**Rows are safe to virtualize** because each row is fully self-contained. TanStack Virtual handles this with `overscan: 5` to prevent blank content on fast scroll.

The correct mental model:
```
virtualize ↕ rows       →  renders ~20 rows out of 200
never virtualize ↔ cols →  always renders all 30/60/90 date cells
booking block width      →  always correct, never clipped
```

---

## 3. Data Layer

### What I would do differently

#### 3a. Server-side date windowing
The API currently returns all reservations in a date range. The client receives everything, normalizes it, deduplicates it, runs overbooking detection — all synchronously on the main thread before the first paint.

For a PMS with hundreds of apartments and months of bookings, this is O(n) blocking work. The right approach: the server returns pre-windowed, pre-sorted data. The client just renders.

```
// What to ask for from the API:
GET /reservations?start=2024-01-01&end=2024-01-31&include=overbooking_flag

// Server response includes:
{
  "reservations": [...],      // already sorted by start_date per apartment
  "overbooking_ids": [42, 87] // server-computed, not client-computed
}
```

#### 3b. Optimistic updates for drag & drop
Currently drag & drop opens a confirmation modal, waits for user confirmation, then calls `onBookingUpdate` which calls `setBookings`. The booking visually snaps back to its original position during the confirmation wait, then jumps to the new position after confirm.

The better UX: move the booking immediately (optimistic), show a subtle "saving…" indicator, revert only on API failure.

```ts
// 1. Move booking in local state immediately
setBookings(prev => prev.map(b => b.id === dragged.id ? { ...b, ...newPosition } : b))

// 2. Call API in background
api.updateBooking(newPosition)
  .catch(() => {
    // 3. Revert only on failure
    setBookings(prev => prev.map(b => b.id === dragged.id ? originalBooking : b))
    toast.error('Failed to move booking')
  })
```

#### 3c. Pre-compute bookingsByResourceId on the server or in a worker
`bookingsByResourceId` (the Map we built) is computed on the main thread on every bookings change. For 1000+ bookings this is fine today, but if the dataset grows, this should move to a Web Worker so it doesn't block the UI thread during date range changes.

---

## 4. State Management

### What I'd use and why

**Keep React Context for global cross-cutting state:**
- `UserContext` — who is logged in, what permissions they have. Changes rarely. Fine in context.
- `ErrorContext` — global error display. Rarely changes.
- `DataRefreshContext` — the `onRefresh` callback. Fine.

**Do NOT put scheduler state in context:**
- `bookings`, `resources`, `availability` — these change frequently (filter changes, date range changes). If they're in context, every context consumer re-renders on every change.
- Keep them as local state in `ReservationChart` and pass down as props. The current approach is correct.

**For a larger team I'd use Zustand for scheduler state:**
```ts
// Selector-based subscriptions — only re-render what changed
const bookings = useSchedulerStore(s => s.bookings)         // only BookingBlock re-renders
const resources = useSchedulerStore(s => s.resources)       // only ResourceRow re-renders
const isLoading = useSchedulerStore(s => s.isLoading)       // only LoadingOverlay re-renders
```
Context re-renders all consumers. Zustand with selectors re-renders only the component that subscribed to what changed. The difference is invisible with 5 users; it matters at 200 users in a shared tab.

---

## 5. Component Tree

### Current tree (what we have)

```
ReservationChart
├── FilterContainer
└── NewVirtualizedContainer
    ├── DateHeader (×30/60/90)            ← sticky top, always in DOM
    └── [virtualized rows]
        └── ResourceRow (×~20 visible)
            ├── DateCell (×30/60/90)      ← always in DOM
            └── BookingBlock (×n)         ← always in DOM per row
```

### What I'd change

**`DateHeader` as a single component, not n components:**
The current `dates.map(date => <DateHeader key={date} date={date} />)` creates 30–90 React elements for what is essentially a static row. One `<DateHeaderRow dates={dates} />` component with internal rendering is simpler and gives `React.memo` a single bailout point.

**`ResourceRow` split into two concerns:**
```
ResourceRow            →  layout (height, overbooking expansion)
  ├── DateCellTrack    →  the background grid (date cells)
  └── BookingTrack     →  the booking blocks layer (absolute positioned)
```
Separating these means `DateCellTrack` only re-renders when selection/availability changes, and `BookingTrack` only re-renders when its bookings change. Currently both are in one component so either change re-renders everything.

---

## 6. Interaction Design

### Drag & drop
The current approach attaches `mousemove` and `mouseup` to `document` during a drag. This is correct — it captures movement even when the cursor leaves the scheduler area.

What I'd change: **throttle `mousemove` with `requestAnimationFrame`**. Currently every pixel of movement calls `setDragState`, which re-renders the entire virtualized list. With RAF throttling, it updates at most once per frame (60fps max), which is more than enough for visual feedback.

```ts
const rafId = useRef<number>(0)

const handleMouseMove = (e: MouseEvent) => {
  cancelAnimationFrame(rafId.current)
  rafId.current = requestAnimationFrame(() => {
    setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null)
  })
}
```

### Selection (click-drag to create booking)
The current `setTimeout(100)` to open the modal after mouseup is a timing hack. The reliable pattern:

```ts
// On mouseup: finalize selection in a ref, then open modal
const pendingSelection = useRef(null)

const handleMouseUp = () => {
  pendingSelection.current = { ...currentSelection, finalized: true }
  setModalOpen(true)  // open immediately, read from ref inside modal
}
```

No timer, no race condition.

---

## 7. Performance Budget

For a PMS with ~200 apartments and 30-day view, the budget I'd target:

| Metric | Target | Current status |
|---|---|---|
| Initial load (TTI) | < 2s | depends on API speed |
| Scroll frame time | < 16ms (60fps) | ✅ with TanStack Virtual |
| Drag frame time | < 16ms | ⚠️ every pixel fires setState |
| Date range change | < 300ms | re-fetch + re-render |
| Expand/collapse building | < 50ms | ✅ local state only |

---

## 8. What I'd Build Next (Priority Order)

### P0 — Correctness
1. **Unique booking IDs** (`crypto.randomUUID()`) — current `bookings.length + 1` collides on delete
2. **API base URL from env var** — hardcoded `https://aperfectstay.ai` ignores `NEXT_PUBLIC_API_BASE_URL`

### P1 — Performance
3. **Throttle drag mousemove with RAF** — reduces setState calls from 60+/s to 60/s max
4. **`dateIndexMap` passed to BookingBlock** ✅ done — O(1) lookup
5. **`bookingsByResourceId` Map** ✅ done — O(1) per row instead of O(bookings)

### P2 — Resilience
6. **Error boundary around NewVirtualizedContainer** — one bad booking's data shouldn't blank the whole page
7. **Optimistic drag & drop** — move booking immediately, revert on API failure
8. **Loading skeleton** — instead of a spinner overlay that hides the whole UI, show a shimmer grid with the correct number of rows

### P3 — Developer Experience
9. **Typed Booking/Resource interfaces** — replace `any` everywhere with proper types
10. **Single HTTP utility** — `apiFetch` and `proxyFetch` do the same thing in two different files
11. **`dateUtils.js` → `dateUtils.ts`** — the only `.js` file in a TypeScript project

---

## 9. The One Structural Change I'd Make Today

Move `fetchSchedulerData` into a custom hook:

```ts
// hooks/useSchedulerData.ts
export function useSchedulerData({ startDate, daysToShow }) {
  const [state, setState] = useState({ resources: [], bookings: [], availability: null, isLoading: true })

  const refresh = useCallback(async () => {
    // all the fetch logic here
  }, [startDate, daysToShow])

  useEffect(() => {
    let cancelled = false
    refresh()
    return () => { cancelled = true }
  }, [refresh])

  return { ...state, refresh }
}
```

`ReservationChart` becomes just layout + filter state. The data concern is fully isolated and independently testable. This is the single change with the best ratio of value to effort.
