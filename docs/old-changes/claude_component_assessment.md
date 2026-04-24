# Component Assessment — Full Render Flow
## Architectural & Optimization Issues

Covers every component from entry point to leaf node.
Ordered by how a render flows through the app.

---

## 1. `app/pms-calendar/page.tsx`

**Status: Clean — no action needed.**

Trivial wrapper that renders `<ReservationChart />`. No issues.

---

## 2. `hooks/useSchedulerData.ts`

**Status: Mostly good. One architectural issue.**

### What it does well
- Cancellation pattern (`isCancelled()`) prevents stale state on fast navigation
- Two-phase loading: shows main data first, fetches availability in background
- `detectOverbookings` runs once after dedup, not on every render

### Issues

#### ARCH — All API URLs hardcoded in the hook
```ts
const resourcesUrl = `https://aperfectstay.ai/api/aps-pms/apts/private`
const bookingsUrl  = `https://aperfectstay.ai/api/aps-pms/reservations/private?...`
```
The hook is tightly coupled to a specific deployment. Moving the URLs to a single `constants/api.ts` file makes it easy to change the base URL (staging vs prod) without hunting through hook files.

#### ARCH — `setBookings` and `setResources` are exposed to the parent
`ReservationChart` calls `setBookings` directly (in `handleBookingCreate` / `handleBookingUpdate`). This bypasses `detectOverbookings` — a locally created booking or a drag-moved booking will never be checked for overbooking. The hook should expose `addBooking(data)` and `updateBooking(data)` that call `detectOverbookings` internally and keep the overbooking logic in one place.

#### OPT — `bookings.length` as a dep in `handleBookingCreate`
```ts
const handleBookingCreate = useCallback((bookingData) => {
  const newBooking = { id: bookings.length + 1, ...bookingData }
  ...
}, [bookings.length, setBookings])
```
Using `bookings.length` as a dep makes `handleBookingCreate` a new function reference every time a booking is added. The ID should come from the API response or `Date.now()` — not from the current array length. Then the dep array becomes `[setBookings]` — stable forever.

---

## 3. `components/ReservationChart/ReservationChart.tsx`

**Status: Good. One dead code issue, one filtering issue.**

### What it does well
- `bookingsByResourceId` Map is built once here and passed down — avoids each row filtering the full bookings array
- `filteredResources` useMemo is well structured
- `handleBookingCreate` / `handleBookingUpdate` are wrapped in `useCallback`

### Issues

#### ARCH — `USE_NEW_CONTAINER` flag + dead `VirtualScheduler` import
```ts
const USE_NEW_CONTAINER = true
```
This flag has been `true` since the new container was introduced. `VirtualScheduler` and its code path are dead. When you're confident the new container works correctly, delete `VirtualScheduler.tsx`, remove the flag, and remove the conditional. Dead code paths mislead future developers and add bundle weight even when tree-shaken imperfectly.

#### ARCH — `filteredResources` does not preserve `expanded` state
When the search term changes, `filteredResources` rebuilds the resource tree from `resources`. If a building was expanded, it stays expanded (good). But if a building's children are filtered down to zero, the whole parent disappears and comes back collapsed when the filter is cleared. This is expected for search, but worth noting: `expanded` state lives on the resource object in the `resources` array, so it round-trips correctly.

#### OPT — Three sequential `.map().filter()` chains in `filteredResources`
Each filter (bookingId → enquiryId → searchTerm) does a full pass over the resource tree. This is fine for the current data size (tens of buildings, hundreds of apartments), but the chains could be merged into a single pass if performance ever becomes an issue.

#### OPT — `bookings` prop passed to `NewVirtualizedContainer` but unused
```tsx
<NewVirtualizedContainer
  bookings={bookings}       // ← passed but never read inside
  bookingsByResourceId={bookingsByResourceId}
  ...
/>
```
`NewVirtualizedContainer` has `bookings = []` in its prop list but never uses it — `bookingsByResourceId` is used everywhere instead. The prop should be removed from both the call site and the component signature to avoid confusion.

---

## 4. `components/ReservationChart/Filter/FilterContainer.tsx`

**Status: Needs cleanup. Multiple issues.**

### Issues

#### ARCH — Hardcoded admin email check
```tsx
{(user?.email === 'stay@thesqua.re') && (
  <div>...</div>
)}
```
Business logic about who is an admin belongs in a `useUser` hook or a role-check utility, not inlined in a UI component with a literal email address. If the admin email ever changes (or a second admin is added), this requires a code change and a deployment.

#### ARCH — `AbbreviationsModal` rendered twice
```tsx
<AbbreviationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />  {/* ← line 64, inside the toolbar */}
...
{isModalOpen && <AbbreviationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}  {/* ← line 86 */}
```
The modal is mounted twice when `isModalOpen` is true. The first instance (line 64) is always in the DOM. The second (line 86) is conditional. This is a bug — whichever one renders last will visually stack on top of the other. One of them should be removed.

#### ARCH — Commented-out features left in source
```tsx
{/* {collaborators && collaborators?.length>1 ? <CollaboratorFilter .../> : null} */}
{/* <BookingIdFilter .../> */}
{/* <EnquiryIdFilter .../> */}
```
Three components are commented out with their props still wired up in `ReservationChart`. If these features are disabled on purpose, they should either be removed or tracked in a TODO with a reason. Commented-out code in a PR is a maintenance burden.

#### ARCH — `bookings` and `collaborators` props accepted but mostly unused
`bookings` is passed to the commented-out `BookingIdFilter` and `EnquiryIdFilter`. `collaborators` is passed to the commented-out `CollaboratorFilter`. With those filters disabled, these props do nothing. Remove them until the features are re-enabled.

#### OPT — Inline `onClose` arrow functions recreated on every render
```tsx
onClose={() => setIsModalOpen(false)}
onClose={() => setColorsModalOpen(false)}
```
These create new function references on every render. Wrap in `useCallback` or use setter aliases.

---

## 5. `components/ReservationChart/VirtualScheduler/NewVirtualizedContainer.tsx`

**Status: Well refactored. One minor issue.**

(Full change history in `claude_nvc_changes.md`.)

### Remaining issue

#### ARCH — `"Apartments"` label is hardcoded
```tsx
<div className="...">Apartments</div>
```
This is a domain-specific string in a generic scheduler component. It should be a prop (e.g. `resourceLabel = 'Apartments'`) so the component can be reused for other resource types without a code change.

---

## 6. `components/ReservationChart/VirtualScheduler/SchedulerRow.tsx`

**Status: Clean. No issues.**

- Properly memoized with `React.memo` + `displayName`
- Clear prop interface
- Thin — only handles layout and passes data down

---

## 7. `components/ReservationChart/VirtualScheduler/ResourceRow.tsx`

**Status: Good. Two issues.**

### What it does well
- Memoized
- Overbooking row separation logic is clear
- Passes `dateIndexMap` down to `BookingBlock` for O(1) lookup

### Issues

#### ARCH — `isDateInSelection` defined after the component, outside the module export
```ts
const isDateInSelection = (date, selection) => { ... }
```
This function is called inside `ResourceRow` but defined after it. It works because of JavaScript hoisting (it's a `const`, so actually it does NOT hoist — it's in the temporal dead zone before the component definition). This works only because `ResourceRow` is a function that closes over it at call time, not at definition time. Move `isDateInSelection` above `ResourceRow` to make the dependency order explicit.

Additionally, `isDateInSelection` creates a new sorted array on every call:
```ts
const dates = [selection.startDate, selection.endDate].sort()
```
This runs once per date cell per render. Precompute `[normalizedStart, normalizedEnd]` once at the top of `ResourceRow` and pass the result in, or memoize inside the function.

#### ARCH — `availabilityData` prop accepted but ignored
```ts
availabilityData = {},   // ← received
availabilityByParent = {}  // ← also received
```
Inside the component, only `availabilityByParent` is used. `availabilityData` is declared in the interface and accepted as a prop but never read. This is the `availabilityByResource` data (apartment-level availability, not yet populated by the API). The dead prop should be removed from the interface and from all call sites until the API supplies apartment-level data.

---

## 8. `components/ReservationChart/VirtualScheduler/BookingBlock.tsx`

**Status: Mostly good. Two architectural issues.**

### What it does well
- Memoized
- `bubbleHtml` parse is in a `useMemo` — only re-parses when `booking.bubbleHtml` changes
- O(1) date→index lookup via `dateIndexMap`
- Drag distance threshold (5px) prevents accidental drags on clicks

### Issues

#### ARCH — `handleMouseDown` registers and cleans up its own document listeners
```ts
const handleMouseDown = (e) => {
  ...
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
```
`BookingBlock` manages its own drag detection (the click-vs-drag threshold) but hands off to `onBookingDragStart` once the threshold is crossed. This is a split responsibility: part of the drag lifecycle lives in `BookingBlock`, the rest in `useDragState`. If the drag threshold needs to change, a developer has to find it in `BookingBlock`, not in the drag hook. Consider moving the threshold logic into `useDragState` or a shared `useDragThreshold` utility.

Also note: if the component unmounts during a drag (e.g. the row scrolls out of the virtual window), the `mousemove` and `mouseup` listeners registered in `handleMouseDown` are never cleaned up. This is a listener leak.

#### ARCH — `useUser` hook called in a leaf render component
```ts
const { isSquareUser } = useUser()
```
`BookingBlock` is rendered once per visible booking — potentially 50–200 instances at a time. Each instance calls `useUser()`. If `useUser` triggers a context read, every booking block re-renders when user state changes. `isSquareUser` is a derived boolean that doesn't change during a session — it should be computed once in `ReservationChart` or `NewVirtualizedContainer` and passed down as a prop.

#### OPT — `props: any` — no type safety
```ts
const BookingBlock = memo(({ booking, dates, dateIndexMap, ... }: any) => {
```
The entire props object is typed as `any`. This makes the component invisible to TypeScript — wrong prop names, missing props, and type mismatches all go undetected. A proper interface (like `ResourceRow` has) should be added.

---

## 9. `components/ReservationChart/VirtualScheduler/DateCell.tsx`

**Status: Good. One minor issue.**

### What it does well
- Memoized
- Typed props interface
- `data-date` and `data-resource-id` attributes support drag-drop hit detection

### Issues

#### OPT — `getOccupancyInfo()` is a plain function called on every render
```ts
const getOccupancyInfo = () => { ... }
const occupancyInfo = getOccupancyInfo()
```
This is functionally equivalent to inline code — defining it as a named function inside the render body adds a call overhead with no benefit. Since `DateCell` is memoized, it only re-renders when its props change, so this is low impact, but the pattern is misleading (looks like it could be memoized but isn't).

#### BUG — `title` attribute has a typo and wrong format
```tsx
title={availability ? `O: ${occupancyInfo.percentage}% )` : ''}
```
The closing `)` should not be there. Also, the tooltip text format is inconsistent with the hover tooltip in `DateHeader` which shows `O: ${occupancyPercentage}%` (no parenthesis). Fix the stray character.

---

## 10. `components/ReservationChart/VirtualScheduler/DateHeader.tsx`

**Status: Good. One minor issue.**

### What it does well
- Thin component — format + display, nothing else
- Delegates formatting to `formatDateHeader` utility
- Color-codes availability clearly

### Issues

#### ARCH — Commented-out `dayNumber` block
```tsx
{/* <div className={`text-lg font-semibold ...`}>
  {formatted.dayNumber}
</div> */}
```
The large day number is commented out. If this was a deliberate design decision, remove it. If it's work-in-progress, add a comment explaining why it's disabled.

#### OPT — Not memoized
`DateHeader` is rendered once per date column — 30+ instances for the default 30-day view. It re-renders whenever the parent `NewVirtualizedContainer` renders (e.g. on drag state changes). Wrapping in `React.memo` would prevent these re-renders since its props (`date`, `cellWidth`, `totalAvailability`) change only when the date range changes.

---

## 11. `components/ReservationChart/VirtualScheduler/ModalManager.tsx`

**Status: Clean. No issues.**

- Stateless — purely prop-driven
- All 9 modals in one place
- All lazy-loaded with `dynamic()`

---

## Summary Table

| Component | Priority | Main Issues |
|---|---|---|
| `useSchedulerData` | **High** | URLs hardcoded, `setBookings` exposed bypasses overbooking, `bookings.length` dep |
| `FilterContainer` | **High** | Hardcoded email, modal rendered twice, 3 commented-out features |
| `ReservationChart` | **Medium** | Dead `USE_NEW_CONTAINER` flag + `VirtualScheduler`, unused `bookings` prop |
| `BookingBlock` | **Medium** | Listener leak on unmount during drag, `useUser` called in leaf, no TypeScript |
| `ResourceRow` | **Medium** | Dead `availabilityData` prop, `isDateInSelection` defined after usage |
| `DateCell` | **Low** | Title attribute typo, `getOccupancyInfo` pattern |
| `DateHeader` | **Low** | Not memoized, commented-out code |
| `NewVirtualizedContainer` | **Low** | Hardcoded `"Apartments"` label |
| `SchedulerRow` | — | Clean |
| `ModalManager` | — | Clean |
| `app/pms-calendar/page.tsx` | — | Clean |

---

## Recommended Order of Work

1. **`FilterContainer`** — Fix the duplicate modal bug (actual bug, not cleanup). Then remove the hardcoded email check.
2. **`ReservationChart`** — Remove `USE_NEW_CONTAINER` flag and dead `VirtualScheduler` once confirmed stable. Remove unused `bookings` prop to `NewVirtualizedContainer`.
3. **`useSchedulerData`** — Expose `addBooking`/`updateBooking` so overbooking detection runs on local mutations too.
4. **`BookingBlock`** — Add TypeScript interface, move `isSquareUser` to a prop, fix the listener leak.
5. **`ResourceRow`** — Remove dead `availabilityData` prop, move `isDateInSelection` above the component.
6. **`DateHeader`** — Add `React.memo`, remove commented-out code.
7. **`DateCell`** — Fix title typo.
