# Real-Time Booking Updates via Server-Sent Events (SSE)

## Goal

After the initial booking data loads, subscribe to an SSE endpoint so that any reservation changes pushed from the server automatically update the calendar — no manual refresh required.

**SSE endpoint:**
```
https://aperfectstay.ai/api/aps-pms/events/reservations?start=YYYY-MM-DD&end=YYYY-MM-DD
```

---

## Problem to Solve First: Auth Headers with SSE

The browser's native `EventSource` API does **not** support custom headers (no `Authorization`, no `Cookie` override). Our backend requires a Bearer token and session cookie.

**Solution:** Use `fetch()` with a `ReadableStream` instead of `EventSource`. This lets us pass the same auth headers we already use in `fetchUtils`. This is the modern alternative to `EventSource` and works in all current browsers and Node.js.

---

## Step-by-Step Implementation Plan

### Step 1 — Create a Next.js Proxy API Route for SSE

**File to create:** `app/api/proxy/sse-reservations/route.ts`

**Why:** The SSE connection must carry auth headers that the browser cannot attach via `EventSource`. A server-side proxy route will:
1. Receive the request from the client (cookies are automatically forwarded)
2. Open a proxied SSE connection to the real backend with the correct auth headers
3. Stream the raw SSE bytes back to the client

**What it does:**
- Accept `start` and `end` query params from the client
- Forward them to `https://aperfectstay.ai/api/aps-pms/events/reservations`
- Add `Authorization: Bearer <DEV_TOKEN>` and `Cookie: session=<DEV_SESSION>` (same pattern used in all other proxy routes)
- Set response headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- Pipe the upstream response body directly to the client response using `ReadableStream`

---

### Step 2 — Create a `useSSEBookings` Custom Hook

**File to create:** `hooks/useSSEBookings.ts`

**Why:** Keeps SSE subscription logic isolated and reusable. `ReservationChart` stays clean.

**What it does:**

1. Accepts `startDate`, `endDate`, and an `onEvent` callback as parameters
2. Opens a `fetch()` stream to `/api/proxy/sse-reservations?start=...&end=...`
3. Reads the `ReadableStream` line by line, parsing the SSE protocol:
   - Lines starting with `data:` contain the payload
   - Double newline (`\n\n`) marks end of an event
4. Calls `onEvent(parsedData)` when a complete event is received
5. **Reconnection:** If the stream closes unexpectedly, wait 3 seconds and reconnect automatically (with exponential back-off up to ~30s)
6. **Cleanup:** Aborts the `fetch` via `AbortController` when the component unmounts or date range changes

**Signature (rough):**
```ts
useSSEBookings({
  startDate: string,   // YYYY-MM-DD
  endDate: string,     // YYYY-MM-DD
  onEvent: (event: SSEReservationEvent) => void,
  enabled: boolean     // only subscribe after initial data has loaded
})
```

---

### Step 3 — Define the SSE Event Type

**File to update:** `types/` (or alongside the hook)

We need to agree on what an SSE event payload looks like from the server. There are two common shapes — we need to confirm with the backend team which one is used:

**Option A — Full reservation object pushed on every change:**
```json
{
  "type": "reservation.updated",
  "data": { ...full booking object... }
}
```

**Option B — Diff / patch pushed (only changed fields):**
```json
{
  "type": "reservation.updated",
  "id": "12345",
  "changes": { "start": "...", "end": "..." }
}
```

**Action required:** Ask the backend team to confirm the event shape before coding the merge logic in Step 4.

---

### Step 4 — Merge SSE Events into the Bookings State

**File to update:** `hooks/useSchedulerData.ts`

**Why here:** All booking state lives in this hook. Merging SSE changes alongside the initial fetch keeps the data lifecycle in one place.

**Logic per event type:**

| Event type | Action |
|---|---|
| `reservation.created` | Normalize the new booking (same mapping as initial load), append to `bookings` array |
| `reservation.updated` | Find by `id`, replace with updated + normalized booking |
| `reservation.deleted` | Filter out by `id` |

After any merge, re-run `detectOverbookings()` on the updated list so overbooking flags stay accurate.

**State update must be immutable** — always return a new array so React re-renders correctly.

---

### Step 5 — Wire the Hook into `ReservationChart`

**File to update:** `components/ReservationChart/ReservationChart.tsx`

**Changes:**
1. Pass `onEvent` handler (from Step 4) and `enabled` flag (true once initial load is complete) into `useSSEBookings`
2. The date range for the SSE subscription should match the currently visible date window — pass the same `startDate` / `endDate` already used for the initial fetch
3. Add a small visual indicator (e.g., a green dot or "Live" badge) so users know real-time updates are active. Hide or change it to "Reconnecting…" if the stream drops

---

### Step 6 — Handle Date Range Changes

When the user navigates forward/backward in the calendar (changing the visible date window), the SSE subscription must be restarted with the new `start` and `end` params.

`useSSEBookings` already handles this: `useEffect` depends on `[startDate, endDate]`, so changing either value will abort the current stream and open a new one automatically.

---

### Step 7 — Error and Edge-Case Handling

| Scenario | Handling |
|---|---|
| Server returns non-200 (auth failure, 404) | Log error, do **not** reconnect in a tight loop; surface a toast/error badge |
| Malformed SSE event (bad JSON) | Log and skip the event; do not crash |
| Tab goes to background | Browser throttles timers but `fetch` streams stay open — no special handling needed |
| User loses network | `AbortController` will reject; reconnect logic kicks in |
| Duplicate events from server | Deduplicate by event `id` field if the server sends one |

---

## File Change Summary

| File | Action |
|---|---|
| `app/api/proxy/sse-reservations/route.ts` | **Create** — SSE proxy route |
| `hooks/useSSEBookings.ts` | **Create** — SSE subscription hook |
| `hooks/useSchedulerData.ts` | **Update** — accept + apply SSE events to booking state |
| `components/ReservationChart/ReservationChart.tsx` | **Update** — wire hook, pass date range, add live indicator |
| `types/` (new or existing) | **Update** — add `SSEReservationEvent` type |

---

## Open Questions (Need Answers Before Coding)

1. **What does the SSE event payload look like?** Full object, diff, or just an ID? (See Step 3)
2. **Are there multiple event types** (`created`, `updated`, `deleted`) or just one catch-all?
3. **Does the endpoint send a heartbeat** (e.g., `: ping` comment lines) to keep the connection alive? If so, the parser should ignore comment lines.
4. **Auth in production:** The proxy uses `DEV_SESSION`/`DEV_TOKEN` env vars today. Is the production auth path different (e.g., `access_token` cookie)? The proxy route needs to handle both, matching what the other proxy routes already do.
5. **Date range:** Does the user navigate beyond the initial `start`/`end` window? If so, should we re-subscribe with the new range or always subscribe to a fixed rolling window?
