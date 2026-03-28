# Claude's Optimization Notes — daypilot-alternative-nextjs

A file-by-file breakdown of every concrete issue found in the codebase, grouped by priority.

---

## CRITICAL — Bugs / Correctness Issues

### 1. `UserContext.tsx` — `isSquareUser` missing from `useMemo` deps (line 86)
`isSquareUser` is stored in state and used in the context value, but it is **not listed as a dependency** in the `useMemo` call. This means when the user logs in and `isSquareUser` changes, consumers of the context (like `BookingBlock`) will not re-render with the updated value. Admin-only icons will never appear until something else triggers a re-render.

```ts
// Current — isSquareUser is missing:
const value = useMemo(() => ({ user, isSquareUser, isLoading, error, refreshUser, logout }), [user, isLoading, error])

// Fix: add isSquareUser to deps
const value = useMemo(() => ({ ... }), [user, isSquareUser, isLoading, error])
```

### 2. `ReservationChart.tsx` — Booking ID generation is not unique (line 115)
`handleBookingCreate` assigns `id: bookings.length + 1`. If any booking is deleted, or if two bookings are created rapidly, IDs will collide, causing `BookingBlock` keys to clash and the wrong booking to be updated/removed.

```ts
// Current
id: bookings.length + 1

// Fix: use a proper unique ID (crypto.randomUUID() or Date.now() + Math.random())
id: crypto.randomUUID()
```

### 3. `VirtualScheduler.tsx` — `handleSplitBooking` lists `bookings` as dep but doesn't use it (line 513)
`bookings` is in the `useCallback` dependency array but is never referenced inside the function body. This causes the callback to be recreated unnecessarily on every bookings change, but more importantly signals a logic misunderstanding — the original intent may have been to validate the split against existing bookings, which is currently not done.

---

## HIGH — Performance Issues

### 4. `ResourceRow.tsx` — Bookings filtered and sorted on every render (lines 44–48)
`ResourceRow` is wrapped in `React.memo`, but inside it still runs `bookings.filter(...)` and `[...resourceBookings].sort(...)` on every render. Since `bookings` is the full array (potentially hundreds of bookings) and there can be many visible rows, this is **O(rows × bookings)** work per render cycle. Every scroll event causes a re-render of all visible rows.

**Fix:** Pre-compute a `bookingsByResourceId: Map<string, Booking[]>` in `VirtualScheduler` or `ReservationChart` using `useMemo`, then pass only the relevant slice to each `ResourceRow`.

### 5. `BookingBlock.tsx` — `getDateIndex` is O(n) on every render (lines 27–28)
`getDateIndex` does a `findIndex` linear scan of the full `dates` array. With `daysToShow = 30` this is 30 comparisons per call, called twice per booking block per render. As `daysToShow` grows (e.g. 90 days), this scales poorly. With hundreds of bookings visible, this adds up.

**Fix:** Convert `dates` to a `Map<string, number>` (date → index) once in `VirtualScheduler` via `useMemo`, and pass it down instead of the array. O(1) lookup.

### 6. `overbookingUtils.ts` — O(n²) overlap check (lines 38–58)
For each apartment, a nested loop compares every booking against every earlier booking. In the worst case (many overlapping bookings in one apartment) this is quadratic. More importantly, **dayjs objects are re-created inside the inner loop** for `existing` on every iteration of `i`, even though `existing` was already parsed in a previous `i` iteration.

**Fix:** Pre-parse all dayjs values once before the loops. The O(n²) is likely acceptable for typical PMS data volumes, but pre-parsing alone removes the repeated object creation.

```ts
// Pre-parse once:
const parsed = sorted.map(b => ({
  booking: b,
  start: dayjs(b.startDate || b.start),
  end: dayjs(b.endDate || b.end)
}))
// Then reference parsed[i].start / parsed[j].end in the loops
```

### 7. `VirtualScheduler.tsx` — Drag `mousemove` listener fires state update on every pixel (lines 402–470)
The `handleMouseMove` inside the drag `useEffect` calls `setDragState(...)` on every mouse move event. Each call triggers a full React re-render of `VirtualScheduler` and all its visible children. On a fast mouse drag this can be 60+ state updates per second.

**Fix:** Store drag position in a `useRef` and only call `setDragState` when needed to trigger visual updates (e.g. throttled with `requestAnimationFrame`).

### 8. `VirtualScheduler.tsx` — `visibleItems` uses O(n) linear scan (lines 238–247)
The visible rows are found by iterating all `rowPositions` and checking if each row is in the viewport. With hundreds of apartments this is a linear scan on every scroll event.

**Fix:** Since `rowPositions` is sorted by `top`, use binary search to find the first visible row and iterate forward from there until the row is below the viewport.

### 9. `BookingBlock.tsx` — Not wrapped in `React.memo` (line 6)
`BookingBlock` is not memoized. On every scroll event, `VirtualScheduler` re-renders, which re-renders every visible `ResourceRow`, which re-renders every visible `BookingBlock`. There can be many booking blocks on screen at once. Wrapping in `React.memo` would prevent re-renders when the booking's own props haven't changed.

### 10. `BookingBlock.tsx` — `bubbleHtml` JSON parsed on every render (lines 91–99)
`JSON.parse(booking.bubbleHtml.replace(...))` runs on every render of every `BookingBlock`. This should be memoized with `useMemo`.

---

## MEDIUM — Code Quality / Maintainability Issues

### 11. `ReservationChart.tsx` — Data fetching logic is fully duplicated (lines 133–271)
The `loadData` function inside the `useEffect` and the `loadDataFunction` in `useCallback` are **nearly identical** (~60 lines duplicated). They fetch the same URLs, process data the same way, and set the same state. The only difference is that `loadDataFunction` sets `isLoading(true)` at the start. This duplication means any bug fix or change must be made in two places.

**Fix:** Extract a single `loadData` async function, call it from both the `useEffect` and the refresh handler.

### 12. `ReservationChart.tsx` — API base URL hardcoded (lines 137–140)
The API URLs are constructed with `https://aperfectstay.ai` hardcoded directly, ignoring `NEXT_PUBLIC_API_BASE_URL`. This means changing the environment variable in `.env` or Docker has no effect on the main data fetches. Only the Axios layer respects the env var.

```ts
// Current:
const resourcesUrl = `https://aperfectstay.ai/api/aps-pms/apts/private`

// Fix: use the env var (same pattern as apiRequest.ts already does internally):
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'
const resourcesUrl = `${BASE_URL}/api/aps-pms/apts/private`
```

### 13. `apiRequest.ts` + `proxyFetch.ts` — Two near-identical HTTP utilities (both files)
Both files implement the same pattern: build URL, fetch with credentials, handle 401 redirect, handle non-ok status, parse JSON, catch and rethrow. This is ~50 lines duplicated. The only real difference is that `proxyFetch` checks a proxy route map in development.

**Fix:** Create a single `httpFetch(url, options, { useProxy? })` utility. `apiFetch` and `proxyFetch` become thin wrappers over it.

### 14. `apiRequest.ts` + `proxyFetch.ts` — `LOGIN_URL` hardcoded (line 5 in both)
The login redirect URL `https://aperfectstay.ai/login/` is hardcoded in two places and ignores `NEXT_PUBLIC_AUTH_URL` which is already configured in the Docker build args for this purpose.

### 15. `UserContext.tsx` — `refreshUser` and `logout` not stable (lines 63–71)
`refreshUser` and `logout` are plain functions defined inside the component body (not `useCallback`), and they're included in the `useMemo` value. Each render recreates them, which means the memoized value object reference changes on every render, defeating the purpose of `useMemo`.

**Fix:** Wrap both in `useCallback`.

### 16. `BookingBlock.tsx` — `allowedSalesChannels` array defined inside component (lines 19–23)
This constant array is recreated on every render of every `BookingBlock`. It should be a module-level constant outside the component.

### 17. `BookingBlock.tsx` — Duplicate icon rendering (lines 136–144)
Lines 136–137 and 139–140 render the same `<img src={bubbleData.Lead_Source}>` under conditions that can both be true simultaneously (`isSquareUser && showOnLeft` AND `shouldShowIcon && showOnLeft`). This likely means the lead source icon is rendered twice when both conditions are true.

### 18. `VirtualScheduler.tsx` — `setTimeout` to open modal after mouseup (lines 305–307)
```ts
setTimeout(() => { setModalOpen(true) }, 100)
```
This is a timing hack to ensure the selection state is committed before the modal opens. It is fragile and can fail on slow devices. The modal should be opened based on an explicit trigger, not a timer.

### 19. `VirtualScheduler.tsx` — `handleResourceRightClick` uses `setTimeout(10ms)` (lines 545–551)
Closing and reopening a context menu with a 10ms timer is a workaround for a state update ordering issue. A single `setResourceContextMenu(...)` call setting the new position directly is sufficient.

### 20. `VirtualScheduler.tsx` — Inline arrow functions on modal close handlers (lines 763, 775, 799, 814, 828, 843)
Patterns like `onClose={() => setContextMenu({ isOpen: false, ... })}` create new function references on every render. These should be extracted into named `useCallback` handlers to keep the JSX stable.

---

## LOW — TypeScript / Developer Experience Issues

### 21. `VirtualScheduler.tsx` — No TypeScript prop types (lines 58–69)
The component is in a `.tsx` file but uses untyped JS-style default parameter destructuring with no `interface` or `type` for props. All props are implicitly `any`.

### 22. `dateUtils.js` — Plain JavaScript file in a TypeScript project
This file is `.js`, not `.ts`. It has no type annotations and cannot benefit from TypeScript checks. It should be renamed to `dateUtils.ts` with typed function signatures.

### 23. `ResourceRow.tsx` — All props typed as `any` (lines 11–24)
`resource: any`, `bookings?: any[]`, `selection?: any`, `dragState?: any` — the interface uses `any` for all domain types. Proper types for `Booking`, `Resource`, `Selection`, and `DragState` would catch many errors at compile time.

### 24. `next.config.ts` — `ignoreBuildErrors: true` (line 7)
TypeScript build errors are silenced. This means real type errors are hidden. It should be removed once the `any` types are cleaned up.

### 25. `VirtualScheduler.tsx` — Multiple `console.log` / `console.warn` left in code (lines 386, 517, 523, 530, 559)
Debug logging is left in production code paths. These should be removed.

### 26. `UserContext.tsx` — `console.log` in production (line 46)
`console.log('Fetched user data:', data?.data)` runs on every page load and logs sensitive user data to the browser console.

### 27. `ReservationChart.tsx` — Large commented-out code block (lines 322–405)
An entire old implementation (~80 lines) is commented out at the bottom of the file, below the `export default`. Dead code should be deleted; git history preserves it if needed.

### 28. `VirtualScheduler.tsx` — Commented-out imports (lines 45–52)
Old non-dynamic imports are left commented out. They should be deleted.

---

## ARCHITECTURE — Structural Improvements

### 29. No error boundaries
A JavaScript error anywhere in `VirtualScheduler` or its children (e.g. malformed booking data causing a crash in `BookingBlock`) will unmount the entire page. A React error boundary wrapping `VirtualScheduler` would catch this and show a recoverable error state instead of a blank page.

### 30. `resourcesLoaded` and `bookingsLoaded` state are unused (lines 22–23 in ReservationChart)
These flags are set to `true` but never read anywhere in the component tree. The single `isLoading` flag already covers the loading state. These are dead state variables.

### 31. `DataRefreshContext` pattern is overly complex
The context stores an `onRefresh` callback that `ReservationChart` registers, and children call `refreshData()` to trigger it. This is effectively manual event wiring via context. A simpler approach would be to pass a `refreshKey` prop to `VirtualScheduler` and increment it to trigger re-fetch, or use a URL-based approach where filter changes update query params and the data fetcher depends on them.

### 32. Two separate Axios and native-fetch layers for the same API
The Axios layer (`apiData/`) handles writes, and native fetch handles reads. They have separate interceptors, token injection, error handling, and proxy logic. This split means any change to auth or error handling must be made in both places. Unifying to a single layer would reduce maintenance burden significantly.
