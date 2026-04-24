# NewVirtualizedContainer — What We Changed & Why

A complete record of every change made to `NewVirtualizedContainer.tsx` and the files created as part of this refactor.

---

## The Problem We Started With

The original file was **633 lines** doing 6 different things at once:

1. Grid layout & virtualization
2. Click-drag selection (to create a booking)
3. Drag & drop (to move a booking)
4. Modal state (9 modals, 10 separate `useState` variables)
5. Context menu state (booking + resource right-click)
6. Availability data transformation

A developer opening the file had no obvious place to start. Every concern was tangled with every other concern.

**Goal:** Make the file readable in under 2 minutes. One responsibility per file.

---

## Bug Fixes (done before the refactor)

### 1. Removed `setTimeout(100)` before opening create-booking modal
**Before:**
```ts
setSelection({ ...selection, startDate: finalStartDate, endDate: finalEndDate })
setTimeout(() => setModalOpen(true), 100)
```
**After:**
```ts
setSelection({ ...selection, startDate: finalStartDate, endDate: finalEndDate })
setModalOpen(true)
```
**Why:** The timer was a hack to wait for `setSelection` to commit before the modal read the value. In React 18, all state updates inside the same event handler are automatically batched into one render — both calls commit together, so the modal always sees the correct selection. The timer added fragility with no benefit.

---

### 2. Removed `setTimeout(10ms)` in `handleResourceRightClick`
**Before:**
```ts
setResourceContextMenu({ isOpen: false, ... })
setTimeout(() => {
  setResourceContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY }, resource })
}, 10)
```
**After:**
```ts
setResourceContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY }, resource })
```
**Why:** The false→true dance was a workaround for a state ordering issue that doesn't actually exist. A single `setState` call is all that's needed. The timer added a flicker risk on slow devices.

---

### 3. Replaced `getDateIndex` O(n) with `dateIndexMap` O(1) in drag mouseup
**Before:**
```ts
const startIndex = getDateIndex(dragState.draggedBooking.startDate, dates)
const endIndex   = getDateIndex(dragState.draggedBooking.endDate, dates)
```
**After:**
```ts
const startIndex = dateIndexMap.get(dragState.draggedBooking.startDate) ?? -1
const endIndex   = dateIndexMap.get(dragState.draggedBooking.endDate)   ?? -1
```
**Why:** `getDateIndex` does a linear scan of the full `dates` array every call. `dateIndexMap` is a `Map<string, number>` built once when `dates` changes — O(1) lookup. Also swapped `[dragState, dates, resources]` dep array to `[dragState, dateIndexMap, resources]`.

---

## Architectural Changes

### Step 1 — `useModalState` hook

**File created:** `hooks/useModalState.ts`

**What it does:** Replaces 10 separate `useState` variables (5 modal open/data pairs) with a single `activeModal` object.

**Before (in the container):**
```ts
const [selectedBooking, setSelectedBooking]         = useState(null)
const [detailsModalOpen, setDetailsModalOpen]       = useState(false)
const [detailsModalInitialTab, ...]                 = useState('details')
const [splitModalOpen, setSplitModalOpen]           = useState(false)
const [bookingToSplit, setBookingToSplit]           = useState(null)
const [skipCheckInModalOpen, ...]                   = useState(false)
const [bookingToSkip, setBookingToSkip]             = useState(null)
const [checkInModalOpen, ...]                       = useState(false)
const [bookingToCheckIn, ...]                       = useState(null)
const [cancelCheckInModalOpen, ...]                 = useState(false)
const [bookingToCancel, setBookingToCancel]         = useState(null)
```

**After (in the container):**
```ts
const { activeModal, openModal, closeModal } = useModalState()
```

**How it works:**
- `activeModal` is `{ type, booking, tab? } | null` — null means no modal is open
- `openModal('details', booking, 'task')` opens the details modal on the task tab
- `closeModal()` sets `activeModal` back to null
- Only one modal can be open at a time — impossible to have `isOpen: true` with `booking: null`

**Modal JSX changes:** Conditionals changed from `{detailsModalOpen && <BookingDetailsModal booking={selectedBooking} ...>}` to `{activeModal?.type === 'details' && <BookingDetailsModal booking={activeModal.booking} ...>}`. The `isOpen` prop is always `true` when the block renders — the outer conditional is the gate.

---

### Step 2 — `<SchedulerRow>` component

**File created:** `components/ReservationChart/VirtualScheduler/SchedulerRow.tsx`

**What it does:** Extracts the ~70 lines of inline JSX from inside the TanStack Virtual loop into a named, memoized component.

**Before (virtualizer loop):**
```tsx
{rowVirtualizer.getVirtualItems().map(virtualRow => {
  const row = visibleRows[virtualRow.index]
  if (!row) return null
  return (
    <div key={virtualRow.key} style={{ position: 'absolute', top: 0, left: 0, width: '100%',
      height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}>
      <div className="flex border-b border-gray-200" style={{ height: '100%' }}>
        <div className={`w-64 min-w-64 sticky left-0 z-30 ...`} {...}>
          {row.type === 'parent' && <button onClick={...}><svg .../></button>}
          {row.type === 'child' && <span className="w-6 shrink-0" />}
          <span className="flex-1 truncate text-sm">{row.name}</span>
        </div>
        <div className="relative" style={{ width: dates.length * cellWidth }}>
          <ResourceRow resource={row} dates={dates} dateIndexMap={...} ... />
        </div>
      </div>
    </div>
  )
})}
```

**After (virtualizer loop):**
```tsx
{rowVirtualizer.getVirtualItems().map(virtualRow => {
  const row = visibleRows[virtualRow.index]
  if (!row) return null
  return (
    <SchedulerRow
      key={virtualRow.key}
      virtualRow={virtualRow}
      row={row}
      dates={dates}
      dateIndexMap={dateIndexMap}
      bookingsByResourceId={bookingsByResourceId}
      // ... other props
    />
  )
})}
```

**Bonus:** `SchedulerRow` is wrapped in `React.memo` — it won't re-render when unrelated container state changes (e.g. a context menu opening).

**What `SchedulerRow` renders:**
1. The absolute-positioned TanStack Virtual wrapper div (positioning via `translateY`)
2. The resource label cell (sticky left — stays visible on horizontal scroll)
3. The expand/collapse chevron button for parent (building) rows
4. The timeline cell containing `ResourceRow` (date cells + booking blocks)

---

### Step 3 — `useSelectionState` hook

**File created:** `hooks/useSelectionState.ts`

**What it does:** Extracts all the click-drag-to-create-booking logic — state, refs, handlers, and the window `mouseup` effect.

**Removed from container:**
- `const [selection, setSelection] = useState(null)`
- `const [isSelecting, setIsSelecting] = useState(false)`
- `const [modalOpen, setModalOpen] = useState(false)`
- `const mouseDownRef = useRef(false)`
- `const startDateRef = useRef(null)`
- `const startResourceIdRef = useRef(null)`
- `handleCellMouseDown` useCallback (~10 lines)
- `handleCellMouseEnter` useCallback (~4 lines)
- `useEffect` for window mouseup (~15 lines, including date ordering logic)
- `handleModalClose` useCallback
- `handleBookingConfirm` useCallback
- `selectedResource` useMemo (~12 lines, also simplified — removed dead fallback)

**Added to container:**
```ts
const {
  selection, modalOpen, selectedResource,
  handleCellMouseDown, handleCellMouseEnter,
  handleModalClose, handleBookingConfirm,
} = useSelectionState({ visibleRows, dates, onBookingCreate })
```

**How the selection flow works:**
1. `handleCellMouseDown` — sets `mouseDownRef = true`, records `startDateRef` and `startResourceIdRef`, sets initial selection
2. `handleCellMouseEnter` — extends `selection.endDate` while mouse is held down
3. window `mouseup` effect — normalises date order (handles right-to-left drag), sets `modalOpen = true`
4. `handleModalClose` / `handleBookingConfirm` — resets all state back to null/false

**Why refs instead of state for mouse tracking:** `mouseDownRef`, `startDateRef`, `startResourceIdRef` are refs so the `mouseup` listener can read current values without being in its dependency array. If they were state, the effect would need them as deps and re-register the listener on every mouse move.

---

### Step 4 — `useDragState` hook

**File created:** `hooks/useDragState.ts`

**What it does:** Extracts drag & drop state, the document `mousemove`/`mouseup` effect, and the change confirmation modal state. Also adds **RAF throttling** to the mousemove handler.

**Removed from container:**
- `const [dragState, setDragState] = useState<...>(null)`
- `const [changeConfirmation, setChangeConfirmation] = useState(...)`
- `handleBookingDragStart` useCallback
- `useEffect` for document mousemove + mouseup (~50 lines)
- `handleConfirmChange` useCallback
- `handleCancelChange` useCallback

**Added to container:**
```ts
const {
  dragState, changeConfirmation,
  handleBookingDragStart, handleConfirmChange, handleCancelChange,
} = useDragState({ dateIndexMap, resources, onBookingUpdate })
```

**RAF throttle (performance fix):**

Before, every pixel of mouse movement called `setDragState`, triggering a full React re-render of the virtualised list — potentially 200+ state updates per second on a fast drag.

```ts
// Before — fires on every pixel
const handleMouseMove = (e) => {
  setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null)
}
```

```ts
// After — capped at 60fps via requestAnimationFrame
const rafId = useRef<number>(0)

const handleMouseMove = (e: MouseEvent) => {
  cancelAnimationFrame(rafId.current)
  rafId.current = requestAnimationFrame(() => {
    setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null)
  })
}
```

The RAF is also cancelled on mouseup and on effect cleanup so there are no stale updates after a drop.

---

### Step 5 — `ModalManager` component

**File created:** `components/ReservationChart/VirtualScheduler/ModalManager.tsx`

**What it does:** Moves all 9 modal/overlay JSX blocks (~110 lines) out of the container into a single dedicated component. All 9 `dynamic()` imports also move here.

**Before (in container):** 9 separate `{condition && <Suspense><Modal .../></Suspense>}` blocks scattered at the bottom of the return.

**After (in container):**
```tsx
<ModalManager
  createBookingOpen={modalOpen}
  selection={selection}
  selectedResource={selectedResource}
  onCreateBookingClose={handleModalClose}
  onCreateBookingConfirm={handleBookingConfirm}
  activeModal={activeModal}
  openModal={openModal}
  closeModal={closeModal}
  onDetailsClose={handleDetailsModalClose}
  onSplitBooking={handleSplitBooking}
  contextMenu={contextMenu}
  onContextMenuClose={handleContextMenuClose}
  onContextMenuAction={handleContextMenuAction}
  resourceContextMenu={resourceContextMenu}
  onResourceContextMenuClose={handleResourceContextMenuClose}
  onResourceContextMenuAction={handleResourceContextMenuAction}
  changeConfirmation={changeConfirmation}
  onConfirmChange={handleConfirmChange}
  onCancelChange={handleCancelChange}
  resources={resources}
/>
```

`ModalManager` has no state — it is purely driven by props. Adding a new modal means editing one file with one obvious location.

---

### Step 6 — `useAvailability` hook

**File created:** `hooks/useAvailability.ts`

**What it does:** Moves the availability API response transformation out of the container.

**Before (in container):**
```ts
const { availabilityByResource, totalAvailabilityByDate, availabilityByParent } = useMemo(() => {
  // ~20 lines parsing availability.total_availability and
  // availability.building_wise_availability into lookup objects
}, [availability])
```

**After (in container):**
```ts
const { availabilityByResource, totalAvailabilityByDate, availabilityByParent } = useAvailability(availability)
```

**Note documented in the hook:** The API spells the field `"availibility"` (missing an 'a') — matched intentionally so as not to break the data mapping.

---

### Step 7 — `useContextMenuState` hook

**File created:** `hooks/useContextMenuState.ts`

**What it does:** Moves both context menu state variables and all their handlers out of the container.

**Removed from container:**
- `const [contextMenu, setContextMenu] = useState(...)`
- `const [resourceContextMenu, setResourceContextMenu] = useState(...)`
- `handleBookingRightClick`, `handleContextMenuAction`, `handleContextMenuClose`
- `handleResourceRightClick`, `handleResourceContextMenuAction`, `handleResourceContextMenuClose`

**Added to container:**
```ts
const {
  contextMenu, resourceContextMenu,
  handleBookingRightClick, handleContextMenuAction, handleContextMenuClose,
  handleResourceRightClick, handleResourceContextMenuAction, handleResourceContextMenuClose,
} = useContextMenuState({ openModal })
```

**Why `openModal` is passed in:** `handleContextMenuAction` needs to open booking-action modals (split, skip, details with tab). Rather than duplicating that logic, the hook receives `openModal` from `useModalState` — the context menu hook handles menu UI state, the modal hook handles modal UI state.

**Shared constant pattern:** The closed states are extracted as module-level constants to avoid creating new objects on every `setState` call:
```ts
const CLOSED_CONTEXT_MENU = { isOpen: false, position: { x: 0, y: 0 }, booking: null }
const CLOSED_RESOURCE_CONTEXT_MENU = { isOpen: false, position: { x: 0, y: 0 }, resource: null }
```

---

## Final State

### Container: `NewVirtualizedContainer.tsx`
**279 lines** (down from 633). Contains only:
- Imports (hooks + components)
- `dates` and `dateIndexMap` computed values
- 6 hook calls (one line each)
- `visibleRows` and `rowHeightsMap` (grid-specific computed values that belong here)
- `rowVirtualizer` setup
- 4 remaining handlers (`handleBookingClick`, `handleDetailsModalClose`, `handleSplitBooking`, `handleToggleExpand`)
- The render return (scroll container → date header → virtual rows → `<ModalManager>`)

### Files created
| File | Lines | Purpose |
|---|---|---|
| `hooks/useModalState.ts` | ~45 | One active modal at a time |
| `hooks/useSelectionState.ts` | ~120 | Click-drag to create booking |
| `hooks/useDragState.ts` | ~140 | Drag to move booking + RAF throttle |
| `hooks/useAvailability.ts` | ~55 | API response → 3 lookup structures |
| `hooks/useContextMenuState.ts` | ~110 | Both right-click context menus |
| `VirtualScheduler/SchedulerRow.tsx` | ~110 | Single virtualised row layout |
| `VirtualScheduler/ModalManager.tsx` | ~180 | All 9 overlays in one place |

### Imports removed from container
`useState`, `useEffect`, `Suspense`, `dynamic`, and all 9 `dynamic()` modal imports — they all moved to their respective hooks/components.
