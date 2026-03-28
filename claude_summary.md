# Claude's Project Summary — daypilot-alternative-nextjs

## What This Project Is

A custom-built **Property Management System (PMS) Calendar** for the company **A Perfect Stay** (`aperfectstay.ai`). It is a ground-up replacement for the commercial **DayPilot** scheduling library. The core deliverable is a virtualized timeline grid that shows apartment buildings with their individual rooms/units as rows, and dates as columns, with color-coded booking blocks laid over the grid.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + `tailwind-merge` |
| Date Handling | Day.js 1.11.19 |
| HTTP (reads) | Native `fetch` via `apiFetch` / `proxyFetch` |
| HTTP (writes) | Axios 1.x via `apiData/lib/axios/client.ts` |
| Component Library | Radix UI + shadcn/ui (Popover, HoverCard) |
| Icons | Lucide React |
| Fonts | Geist Sans / Geist Mono |
| Deployment | Docker (standalone Next.js build, port 3000) |

No database. This is a pure frontend consuming an external REST API at `https://aperfectstay.ai`.

---

## Project Structure Overview

```
/
├── app/
│   ├── layout.tsx                  # Root layout — providers, Header, ErrorModal
│   ├── page.tsx                    # Default Next.js starter page (unused)
│   ├── pms-calendar/page.tsx       # PRIMARY ROUTE — renders <ReservationChart />
│   ├── aperfect-pms/booking/[bookingID]/  # Dynamic booking detail route
│   └── api/                        # Next.js Route Handlers (server-side proxies)
│       ├── proxy/route.ts          # Generic catch-all proxy
│       ├── proxy/add-reservation/
│       ├── proxy/add-payment/
│       ├── proxy/guests/
│       ├── proxy/user-details/
│       └── collaborator/
│
├── components/
│   ├── ReservationChart/           # THE CORE FEATURE
│   │   ├── ReservationChart.tsx    # Data fetching + top-level state
│   │   ├── Filter/                 # Filter toolbar (search, date, days, booking ID, etc.)
│   │   └── VirtualScheduler/      # The scheduler engine
│   │       ├── VirtualScheduler.tsx        # ~850-line orchestrator
│   │       ├── ResourceRow.tsx             # One row per apartment/room
│   │       ├── DateHeader.tsx              # Date column headers
│   │       ├── DateCell.tsx                # Individual grid cells
│   │       ├── BookingBlock.tsx            # Colored booking bars (draggable)
│   │       ├── BookingTooltip.tsx          # Hover tooltip on booking
│   │       ├── SelectionOverlay.tsx        # Click-drag date range selection
│   │       ├── BookingContextMenu.tsx      # Right-click menu on booking
│   │       ├── ResourceContextMenu.tsx     # Right-click menu on room row
│   │       ├── BookingChangeConfirmModal.tsx
│   │       ├── SplitBookingModal.tsx
│   │       ├── SkipCheckInModal.tsx
│   │       ├── CancelCheckInModal.tsx
│   │       └── BookingDetailsModal/        # Tabbed detail panel
│   │           ├── BookingDetailsTab.tsx
│   │           ├── AddPaymentTab.tsx
│   │           ├── CreateTaskTab.tsx
│   │           ├── CreateCaseTab.tsx
│   │           ├── SharePaymentLinkTab.tsx
│   │           └── CheckInModal.tsx
│   ├── Modals/
│   │   └── CreateBookingModal/     # Book / Hold / Block form
│   ├── common/                     # Shared UI primitives
│   │   ├── FloatingLabelInput.tsx
│   │   ├── FloatingLabelSelect.tsx
│   │   ├── FloatingLabelTextarea.tsx
│   │   ├── FloatingAutocomplete.tsx
│   │   ├── AutoSuggestionInput.tsx
│   │   ├── FloatingDropdown.tsx
│   │   └── ErrorModal.tsx
│   ├── Header/                     # App header with nav + user info
│   └── dev/                        # Dev-only session/token injectors
│
├── contexts/
│   ├── UserContext.tsx             # Auth user state
│   ├── ErrorContext.tsx            # Global error modal trigger
│   └── DataRefreshContext.tsx      # Pub/sub to trigger full data reload
│
├── hooks/
│   ├── useApiWithErrorHandling.ts  # Wraps fetch with error modal integration
│   └── useUser.ts                  # Shortcut hook for UserContext
│
├── utils/
│   ├── apiRequest.ts               # apiFetch() — native fetch + 401 redirect
│   ├── proxyFetch.ts               # proxyFetch() — dev proxy routing
│   ├── overbookingUtils.ts         # Overlap detection algorithm
│   ├── dateUtils.js                # generateDateRange, getDateIndex, etc.
│   ├── formatDateTime.ts
│   └── common.ts
│
├── apiData/                        # Axios-based typed service layer (writes only)
│   ├── lib/axios/
│   │   ├── client.ts               # Axios instance (adaptive baseURL)
│   │   └── interceptors.ts         # Token injection + error redirect
│   ├── lib/tokenManager.ts
│   └── services/pms/
│       ├── bookings.ts             # createReservation, createHold, createBlock, etc.
│       ├── rooms.ts
│       └── events.ts
│
├── constants/constant.ts           # Abbreviation lookup (pet policy, balcony, etc.)
├── mocks/data/                     # Static mock data for dev/testing
├── next.config.ts
├── docker-compose.yml
└── Dockerfile
```

---

## How the Scheduler Works

### Data Flow
1. `ReservationChart` mounts → fires 3 parallel API calls: **apartments**, **reservations**, **collaborators**
2. A 4th **availability** call runs independently in the background and updates state when complete
3. Data is passed down to `VirtualScheduler` as props
4. `VirtualScheduler` memoizes derived data (`rowPositions`, `visibleRows`, overbooking flags) and renders only visible rows

### Virtual Scrolling
- All resource rows (buildings + apartments) are flattened into a single array
- Row heights are **variable**: overbooking adds extra height (`rowHeight × (1 + overbookingCount)`)
- Cumulative pixel positions are pre-computed via `useMemo` into a `rowPositions` array
- Only rows whose pixel range intersects `[scrollTop, scrollTop + containerHeight]` are rendered
- Horizontal scroll is synchronized between the frozen date-header and the scrollable body using `requestAnimationFrame` + an `isScrollingRef` mutex

### Drag & Drop
- `BookingBlock` uses a threshold-based mouse handler: movement > 5px or held > 200ms escalates from click to drag
- Drop targets are discovered by `document.elementFromPoint` reading `data-date` and `data-resource-id` HTML attributes
- A `BookingChangeConfirmModal` intercepts the drop and asks for confirmation before mutating state

### Overbooking Detection
- Implemented in `utils/overbookingUtils.ts`
- Groups bookings by apartment, sorts by start date, then runs an O(n²) overlap check within each group
- Both overlapping bookings are flagged `isOverbooked = true`
- The affected row auto-expands to visually stack the overlapping blocks

### Modals
- All 9 modals in `VirtualScheduler` are loaded via `next/dynamic` with `{ ssr: false }` — their JS is excluded from the initial bundle
- They are also conditionally mounted: `{modalOpen && <Suspense><DynamicModal /></Suspense>}` — so they don't enter the React tree until needed

---

## State Management

No external state library. Everything is React state + Context.

| Scope | Mechanism |
|---|---|
| Global auth | `UserContext` (user object, `refreshUser`, `logout`) |
| Global errors | `ErrorContext` (`showError({ title, message, statusCode, endpoint })`) |
| Data refresh trigger | `DataRefreshContext` (pub/sub: filters call `refreshData()`, chart re-fetches) |
| Scheduler data | Local state in `ReservationChart` (resources, bookings, collaborators) |
| Interaction state | Local state in `VirtualScheduler` (drag, selection, context menus, modals) |

---

## Authentication & API

- **Auth mechanism**: Session cookie (`aperfectstay.ai` domain)
- **Dev auth**: `DevSessionSetter` injects a hardcoded `session` cookie; `NEXT_PUBLIC_DEV_TOKEN` env var provides a Bearer token
- **Read requests**: `apiFetch()` / `proxyFetch()` (native fetch, `credentials: 'include'`)
- **Write requests**: Axios instance via `apiData/lib/axios/client.ts` (routes through `/api/proxy?path=...` in dev)
- **401 handling**: Both layers redirect to `https://aperfectstay.ai/login/`

---

## Role-Based UI

An `isSquareUser` flag is computed from the logged-in user's email (`stay@thesqua.re` or `apsdemo2023@gmail.com`). It controls:
- Visibility of admin-only header links (cache management, STAAH logs)
- Certain booking block icons (no-call icons, lead source icons)

---

## Deployment

- Docker container via `docker-compose.yml`
- Next.js `output: 'standalone'` for minimal image size
- Build args set the API base URL and auth redirect URL
- TypeScript build errors are currently **silenced** (`ignoreBuildErrors: true` in `next.config.ts`)
