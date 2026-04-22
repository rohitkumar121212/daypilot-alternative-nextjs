# NewVirtualizedContainer — Improvement Notes

---

## CRITICAL — Bugs / Correctness

### 1. `setTimeout(100)` to open modal after mouseup (line 202)
```ts
setTimeout(() => setModalOpen(true), 100)
```
This is a timing hack. If the device is slow, `selection` state may not have been committed by the time the modal reads it. The reliable fix: store the finalized selection in a `useRef` on mouseup, open the modal immediately (no timer), and read from the ref inside the modal.

```ts
// On mouseup:
const pendingSelection = useRef(null)
pendingSelection.current = { ...selection, startDate: finalStartDate, endDate: finalEndDate }
setModalOpen(true)   // immediate — no timer
```

### 2. `handleResourceRightClick` uses `setTimeout(10ms)` (line 270–272)
```ts
setResourceContextMenu({ isOpen: false, ... })
setTimeout(() => {
  setResourceContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY }, resource })
}, 10)
```
This double-set with a 10ms delay is a workaround for a state ordering issue. It's fragile and unnecessary — a single `setResourceContextMenu({ isOpen: true, position: ..., resource })` call overwrites whatever was there. The false→true dance adds no value.

### 3. `getDateIndex` still used in drag mouseup (lines 300–301)
The drag `handleMouseUp` calls `getDateIndex(dragState.draggedBooking.startDate, dates)` and `getDateIndex(dragState.draggedBooking.endDate, dates)` — two O(n) linear scans. `dateIndexMap` already exists in this component and provides O(1) lookup. These two calls should use `dateIndexMap.get(...)` instead.

---

## HIGH — Performance

### 4. Drag `mousemove` fires `setDragState` on every pixel (lines 287–289)
```ts
const handleMouseMove = (e) => {
  setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null)
}
```
Every pixel of mouse movement calls `setDragState`, which triggers a full React re-render of `NewVirtualizedContainer` and all its visible children. On a fast drag this is 60+ state updates per second, each re-rendering the virtual list.

**Fix:** Throttle with `requestAnimationFrame` — updates at most once per frame (60fps), which is more than enough for visual feedback.

```ts
const rafId = useRef<number>(0)
const handleMouseMove = (e: MouseEvent) => {
  cancelAnimationFrame(rafId.current)
  rafId.current = requestAnimationFrame(() => {
    setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null)
  })
}
```

### 5. `handleMouseUp` (selection) re-registers on every `selection` state change (line 190–207)
The `useEffect` that attaches `mouseup` to `window` lists `[isSelecting, selection, dates]` as deps. Because `selection` changes on every `mousemove` (via `handleCellMouseEnter`), this effect tears down and re-adds the `mouseup` listener on every drag pixel. The fix is to store selection in a `useRef` so the `mouseup` handler can read it without being in the dep array.

### 6. Inline arrow functions on modal close handlers (lines 554, 566, 590, 602, 613, 625)
Patterns like:
```tsx
onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, booking: null })}
```
create a new function reference on every render of `NewVirtualizedContainer`. If the modal components are memoized, these inline closures defeat the memo. These should be extracted into named `useCallback` handlers.

---

## MEDIUM — Code Quality

### 7. Hardcoded URLs in `handleContextMenuAction` (lines 243–245)
```ts
window.open(`https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/logs`, '_blank', 'noopener,noreferrer')
window.open(`https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/view-details`, '_blank', 'noopener,noreferrer')
```
Same issue as in `useSchedulerData` — the base URL is hardcoded. It should use `process.env.NEXT_PUBLIC_API_BASE_URL` for environment consistency.

### 8. `handleResourceContextMenuAction` is a no-op (lines 275–277)
```ts
const handleResourceContextMenuAction = useCallback((action) => {
  setResourceContextMenu({ isOpen: false, position: { x: 0, y: 0 }, resource: null })
}, [])
```
This handler closes the menu but does nothing with `action`. Either actions are missing implementation, or the handler will never do anything useful. It's a stub that silently swallows user intent.

### 9. Modal state pairs could be consolidated (lines 91–111)
Each modal has two state variables: a boolean open flag and the booking/data being acted on:
```ts
const [splitModalOpen, setSplitModalOpen] = useState(false)
const [bookingToSplit, setBookingToSplit] = useState(null)

const [skipCheckInModalOpen, setSkipCheckInModalOpen] = useState(false)
const [bookingToSkip, setBookingToSkip] = useState(null)
// ... × 3 more pairs
```
These 10 variables (5 pairs) could be a single `activeModal: { type: string; booking: any } | null` — open when non-null, closed when null. This halves the modal state and makes it impossible to have `isOpen: false` with a stale booking reference, or `isOpen: true` with `booking: null`.

```ts
// Replace all 5 pairs with:
const [activeModal, setActiveModal] = useState<{ type: 'split' | 'skip' | 'check-in' | 'cancel-check-in' | 'details'; booking: any; tab?: string } | null>(null)
```

### 10. `selectedResource` useMemo searches `visibleRows` then falls back to `resources` (lines 379–389)
If the resource is in `visibleRows`, the `for (const parent of resources)` loop below it is unreachable. The fallback is dead code — `visibleRows` is derived from `resources` so any resource in `resources` is also in `visibleRows`. The memo can be simplified to a single `visibleRows.find(...)`.

### 11. `availabilityByResource` is computed but never used (lines 65, 83, 496)
```ts
const { availabilityByResource, ... } = useMemo(...)
```
`availabilityByResource` is destructured from the memo and passed as `availabilityData={availabilityByResource}` to `ResourceRow`, but inside the memo the `byResource` object is never populated — it is always returned empty `{}`. The building-wise availability is computed into `byParent`, not `byResource`. Either the data mapping is wrong, or `availabilityData` prop is unused.

---

## LOW — TypeScript / Developer Experience

### 12. No TypeScript prop types
The component uses JS-style default parameter destructuring with no `interface` or `type` for its props. All props are implicitly `any`. A `NewVirtualizedContainerProps` interface would catch mismatches at the call site in `ReservationChart`.

### 13. `dragState` type inline (line 98)
```ts
const [dragState, setDragState] = useState<{ draggedBooking: any; startX: number; startY: number; currentX: number; currentY: number } | null>(null)
```
This type is defined inline. It should be extracted as a named `DragState` interface (or imported from a shared types file), both for readability and so `VirtualScheduler` can share the same type.

### 14. `Suspense` wrapping each modal individually
Every modal is wrapped in its own `<Suspense fallback={null}>`. Since they all use `fallback={null}`, a single `<Suspense>` at the top of the fragment would serve the same purpose with less nesting.

---

## ARCHITECTURE

### 15. This component has too many responsibilities
`NewVirtualizedContainer` currently owns:
- Virtualized grid rendering
- Date header rendering
- Resource label rendering
- All selection state and handlers
- All drag & drop state and handlers
- All modal state (9 modals) and handlers
- Context menu state and handlers
- Availability data transformation

This is ~634 lines for what is conceptually a "scheduler canvas". A cleaner split:

```
NewVirtualizedContainer   →  grid layout + virtualization only
useSchedulerInteractions  →  custom hook: selection, drag, modal, context menu state
useAvailability           →  custom hook: transforms availability API response
```

Each hook is independently testable and the component becomes primarily JSX.
