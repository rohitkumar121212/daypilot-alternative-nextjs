# NewVirtualizedContainer — What Changed & Why

## Overview

`NewVirtualizedContainer` is a drop-in replacement for `VirtualScheduler`. It keeps all the same interaction logic (drag & drop, modals, selection, context menus, overbooking) but replaces the scroll architecture entirely.

To switch between them, flip one flag in `ReservationChart.tsx`:

```ts
const USE_NEW_CONTAINER = true   // new single-container approach
const USE_NEW_CONTAINER = false  // original VirtualScheduler
```

---

## The Core Architectural Change

### Old approach — Two panes + JS scroll sync (`VirtualScheduler`)

```
┌─────────────────┬──────────────────────────────────────┐
│  Resource col   │  Date header (scroll synced via RAF)  │
│  (overflow:     ├──────────────────────────────────────┤
│   hidden +      │  Timeline (scroll source)             │
│   translateY)   │  absolute-positioned rows             │
└─────────────────┴──────────────────────────────────────┘
```

- Two separate scroll containers kept in sync via `requestAnimationFrame`
- Left column uses `overflow: hidden` + CSS `translateY(-${scrollTop}px)` to mirror vertical scroll
- Horizontal scroll synced between the date header div and the timeline div via an `isScrollingRef` mutex
- Rows are `position: absolute` with a pre-computed `top` pixel value
- Any sync lag = scroll jitter. Fast scrolling can cause the two panes to desync briefly

### New approach — Single container + CSS sticky (`NewVirtualizedContainer`)

```
┌──────────────────────────────────────────────────────┐
│  sticky top + sticky left │  sticky top              │  ← date header row
│  "Apartments" corner      │  Jan │ Feb │ Mar │ ...   │
├───────────────────────────┼──────┼─────┼─────┼───────┤
│  sticky left              │ date cells + bookings    │  ← row 1
│  Building A               │                          │
├───────────────────────────┼──────┼─────┼─────┼───────┤
│  sticky left              │ ▓▓▓▓▓│     │▓▓▓▓▓│       │  ← row 2
│    Room 101               │                          │
└──────────────────────────────────────────────────────┘
         ↑ ONE scroll container handles both axes
```

- ONE `<div overflow-auto>` handles both horizontal and vertical scroll
- Date header: `position: sticky; top: 0` — browser handles it natively
- Resource label per row: `position: sticky; left: 0` — browser handles it natively
- Zero JavaScript scroll synchronization
- No `requestAnimationFrame`, no mutex ref, no `translateY` workaround

---

## Virtual Scrolling: Spacer-based vs Absolute-positioned

### Why the approach had to change

CSS `position: sticky` only works when the element is in **normal document flow**. Absolute-positioned elements are taken out of the flow, so `sticky` stops working inside them.

`VirtualScheduler` positions every row with `position: absolute; top: Xpx`, which breaks sticky. `NewVirtualizedContainer` switches to **spacer-based virtual scrolling** to keep rows in normal flow.

### How spacer-based virtual scrolling works

Instead of rendering all rows as absolutely-positioned divs, we render only visible rows in normal flow, with invisible spacer divs above and below to preserve the correct total scroll height:

```
<div overflow-auto>                        ← single scroll container

  <div sticky top>Date header</div>        ← always visible at top

  <div height={topSpacerHeight} />         ← represents rows scrolled above viewport

  <Row id="room-101" />                    ← only visible rows rendered
  <Row id="room-102" />                    ← in normal document flow
  <Row id="room-103" />                    ← CSS sticky works here ✓

  <div height={bottomSpacerHeight} />      ← represents rows below viewport

</div>
```

**Spacer height calculation:**

```ts
topSpacerHeight  = rowPositions[firstVisibleIndex].top
bottomSpacerHeight = totalHeight - (lastVisibleRow.top + lastVisibleRow.height)
```

The `rowPositions` array and `rowHeightsMap` (which handles overbooking row expansion) are computed identically to `VirtualScheduler` — only the rendering strategy changes.

---

## What Was Removed

| Removed from VirtualScheduler | Why it's gone |
|---|---|
| `headerScrollRef` | No separate header scroll div |
| `timelineScrollRef` | No separate timeline scroll div |
| `isScrollingRef` | No mutex needed — single scroll source |
| `handleHeaderScroll` | No header scroll to handle |
| `handleTimelineScroll` | Replaced by a single `handleScroll` |
| `bodyContainerRef` | Replaced by `scrollContainerRef` |
| Scrollbar compensation `<div width={17}>` | Not needed — single container |
| `window.addEventListener('resize', ...)` | Replaced by ResizeObserver |
| Absolute `top` / `translateY` layout | Replaced by spacer divs |

---

## What Was Added / Changed

### 1. Single `handleScroll`

```ts
// Old: two handlers + RAF mutex
const handleHeaderScroll = useCallback((e) => {
  if (isScrollingRef.current) return
  isScrollingRef.current = true
  timelineScrollRef.current.scrollLeft = e.target.scrollLeft
  requestAnimationFrame(() => { isScrollingRef.current = false })
}, [])

// New: one handler, no sync needed
const handleScroll = useCallback((e) => {
  setScrollTop(e.currentTarget.scrollTop)
}, [])
```

### 2. ResizeObserver for container height

The old approach read `clientHeight` synchronously on mount, which often returned `0` because the browser hadn't committed layout yet. This caused the visible items calculation to show nothing on first render.

```ts
// Old — unreliable on first render
useEffect(() => {
  const updateHeight = () => {
    if (bodyContainerRef.current) {
      setContainerHeight(bodyContainerRef.current.clientHeight)
    }
  }
  updateHeight()  // ← clientHeight may be 0 here
  window.addEventListener('resize', updateHeight)
  return () => window.removeEventListener('resize', updateHeight)
}, [])

// New — fires after layout is painted
useEffect(() => {
  const el = scrollContainerRef.current
  if (!el) return
  const observer = new ResizeObserver(entries => {
    const height = entries[0]?.contentRect.height
    if (height) setContainerHeight(height)
  })
  observer.observe(el)
  return () => observer.disconnect()
}, [])
```

### 3. Spacer-based visibleItems

```ts
// Old — absolute positioning, no spacers needed
const visibleItems = useMemo(() => {
  return rowPositions.filter(pos =>
    pos.top + pos.height >= scrollTop && pos.top <= scrollTop + containerHeight
  ).map((pos, i) => ({ ...visibleRows[i], ...pos }))
}, [...])

// New — returns spacer heights alongside visible items
const { visibleItems, topSpacerHeight, bottomSpacerHeight } = useMemo(() => {
  let firstVisible = -1
  let lastVisible = -1
  for (let i = 0; i < rowPositions.length; i++) {
    const { top, height } = rowPositions[i]
    if (top + height > scrollTop && firstVisible === -1) firstVisible = i
    if (top < scrollTop + containerHeight) lastVisible = i
  }
  // ... builds items array + calculates spacers
}, [...])
```

### 4. Resource label z-index raised to `z-30`

Both `BookingBlock` and the old resource label column used `z-20`. In the old two-pane layout this wasn't an issue because they were in separate containers. In a single row flex layout, the timeline cell (containing booking blocks) is a later DOM sibling, so it painted on top.

```
z-index hierarchy in NewVirtualizedContainer:
  BookingBlock               → z-20
  Resource label (sticky left) → z-30  ← raised from z-20
  Date header row (sticky top) → z-30
  "Apartments" corner cell     → z-40  (sticky top + sticky left)
```

---

## Files Changed

| File | Change |
|---|---|
| `VirtualScheduler/NewVirtualizedContainer.tsx` | **Created** — new single-container implementation |
| `ReservationChart/ReservationChart.tsx` | Added `USE_NEW_CONTAINER` flag + conditional render |

## Files NOT changed

`VirtualScheduler.tsx`, `ResourceRow.tsx`, `BookingBlock.tsx`, `DateCell.tsx`, `DateHeader.tsx`, all modals — completely untouched. `NewVirtualizedContainer` reuses all of them as-is.

---

## Migration Checklist (before deleting VirtualScheduler)

- [ ] Vertical scroll works — all rows visible, resource labels stay pinned left
- [ ] Horizontal scroll works — date header stays pinned top, resource column stays pinned left
- [ ] Booking blocks render at correct positions
- [ ] Overbooking rows expand correctly (double height)
- [ ] Expand / collapse buildings works
- [ ] Click on booking block → BookingDetailsModal opens
- [ ] Right-click on booking → context menu appears
- [ ] Drag & drop booking to new date/room → confirmation modal appears
- [ ] Click-drag on empty cell → CreateBookingModal opens
- [ ] Split booking, skip check-in, cancel check-in modals open correctly
- [ ] No scroll jitter or desync between resource column and timeline
