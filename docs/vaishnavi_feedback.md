# Project Improvement Suggestions

## 1. Type Safety
- `typescript.ignoreBuildErrors: true` is set in `next.config.ts` — this silently hides TypeScript errors during builds.
- **Fix:** Resolve all TS errors and remove that flag so regressions are caught before hitting production.

## 2. Mixed HTTP Clients
- Reads use native `fetch` (via `apiFetch` / `proxyFetch`), writes use Axios — two patterns to maintain across the codebase.
- **Fix:** Standardize on one client. Use a thin `fetch` wrapper everywhere.

## 3. No Test Coverage
- Zero test files exist in the project.
- **Fix:** Add unit tests for critical logic (overbooking detection, date utils, payload builders) and integration tests for key user flows (create booking, drag-move booking).

## 4. Filter State Not in URL
- All filter state (search term, date, days, collaborator) lives in local React state inside `ReservationChart`.
- Staff cannot share or bookmark a filtered view, and the browser back button resets filters.
- **Fix:** Sync filters to URL search params (`?search=&start=&days=`) so views are shareable and browser-navigable.

## 5. No React Error Boundaries
- No error boundaries wrap the scheduler or modals.
- A single render error in any component crashes the entire page.
- **Fix:** Wrap `<Scheduler>` and each modal in an `ErrorBoundary` with a fallback UI.

## 6. Implicit `any` Types
- Some components likely use implicit or explicit `any` types, reducing type safety benefit.
- **Fix:** Enable `noImplicitAny` in `tsconfig.json` and clean up all `any` usages.

## 7. Stale Data / No Real-time Updates
- Data is fetched once on mount with no polling or live refresh.
- If another staff member creates a booking, the current user's view stays stale until manual refresh.
- **Fix:** Add a periodic refetch interval via `DataRefreshContext`, or switch to SWR / React Query for built-in stale-while-revalidate behavior.

## 8. No Loading Skeletons
- Initial load renders an empty grid while data is being fetched, which looks broken.
- **Fix:** Add skeleton placeholder rows in the scheduler while `isLoading` is true.

## 9. Claude Docs Cluttering Root
- Nine `claude_*.md` documentation files sit in the project root alongside config files.
- **Fix:** Move them to a `docs/` folder or delete stale ones to keep the root clean.

## 10. No Pagination / Infinite Scroll for Large Datasets
- All apartments and bookings are fetched and held in memory at once.
- With 1000+ apartments and thousands of bookings, initial load and memory usage will grow.
- **Fix:** Consider paginated or windowed API fetching, loading only the visible date range plus a small buffer.

## 11. Reduce Third-Party Library Dependencies (e.g. Day.js)
- The project uses `dayjs` for all date operations, adding an external dependency for functionality that can be handled natively or with a small custom utility.
- Modern JavaScript (`Date`, `Intl`, `Temporal`) covers most date formatting, diffing, and parsing needs without a library.
- **Fix:** Replace `dayjs` with a lightweight custom `dateUtils` module (the project already has `utils/dateUtils.js`). Move all date logic there — formatting, range generation, diff calculations — and remove the `dayjs` dependency entirely. This reduces bundle size and eliminates a library upgrade surface.
