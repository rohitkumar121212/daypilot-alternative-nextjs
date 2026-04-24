# API Calls — Migration Status & Roadmap

## The Single Rule

All API calls must go through `fetchUtils` (`utils/fetchUtils.ts`).  
No raw `fetch()`, no axios, no other wrappers.

---

## What `fetchUtils` Provides

- `fetchUtils.get(url, config?)`
- `fetchUtils.post(url, data?, config?)`
- `fetchUtils.put(url, data?, config?)`
- `fetchUtils.delete(url, config?)`

Built-in behaviour (no extra config needed):
- `credentials: 'include'` on every request (cookies in production)
- `Authorization: Bearer {NEXT_PUBLIC_DEV_TOKEN}` in development
- Smart `Content-Type` detection — JSON, FormData, and URLSearchParams handled automatically
- Throws `Error("HTTP 4xx: ...")` on non-2xx so try/catch works cleanly

---

## Changes Already Made

### ✅ Removed axios entirely
- Deleted `apiData/lib/axios/` (client, interceptors, index)
- Deleted `apiData/lib/devTokens.ts` (orphaned, unused)
- Removed `axios` from `package.json` and `node_modules`

### ✅ Removed `apiFetch` (`utils/apiRequest.ts`) from all callers
The file still exists but nothing imports it. It can be deleted.

| File | Before | After |
|------|--------|-------|
| `hooks/useSchedulerData.ts` | `apiFetch(url)` | `fetchUtils.get(url)` |
| `components/.../BookingDetailsModal.tsx` | `apiFetch(url)` + raw `fetch()` | `fetchUtils.get(url)` |
| `hooks/useApiWithErrorHandling.ts` | dynamic `import(apiFetch)` | `fetchUtils` directly |

### ✅ Replaced direct `fetch()` calls in components
All had the same repetitive pattern:
```ts
// BEFORE — repeated in every file
const isDevelopment = process.env.NODE_ENV === 'development'
const url = isDevelopment ? '/api/proxy/cancel-checkin' : 'https://aperfectstay.ai/...'
const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' })
const data = await response.json()

// AFTER
const { data } = await fetchUtils.post('/api/proxy/cancel-checkin', payload)
```

Files migrated:
- `AddPaymentTab.tsx`
- `CreateCaseTab.tsx`
- `CreateTaskTab.tsx`
- `useBookingSubmission.ts`
- `CancelCheckInModal.tsx`
- `SplitBookingModal.tsx`
- `BookingDetailsTab.tsx`
- `CheckInModal.tsx`
- `CollaboratorFilter.tsx`
- `SkipCheckInModal.tsx`

### ✅ Rewrote axios service files to use `fetchUtils`
- `apiData/services/pms/bookings.ts`
- `apiData/services/pms/booking-details-tabs.ts`
- `apiData/services/pms/rooms.ts`
- `apiData/services/pms/events.ts`
- `apiData/services/shared/auth.ts`

---

## What Still Needs to Change

### 🔲 1. Delete `utils/apiRequest.ts`
Nothing imports it anymore. Safe to delete.

### 🔲 2. Migrate `proxyFetch` callers to `fetchUtils`

`proxyFetch` is a routing utility that sends calls through `/api/proxy/*` in dev and directly to the backend in prod. The goal is to remove it entirely and use `fetchUtils` with direct URLs everywhere (dev auth is now handled by `fetchUtils` via `NEXT_PUBLIC_DEV_TOKEN`).

Files still using `proxyFetch`:

| File | Endpoint |
|------|----------|
| `contexts/UserContext.tsx` | `/aps-api/v1/users/details/private` |
| `components/.../AddressDetailsModal.tsx` | `/api/aperfect-pms/fetch-property-address-and-details` |
| `components/.../ResourceContextMenu.tsx` | `/api/aperfect-pms/change-property-cleaning-status` |
| `components/.../SharePaymentLinkTab.tsx` | `/api/aperfect-pms/share-payment-link` |
| `components/.../useBookingModalData.ts` | `/aps-api/v1/case-accounts/`, `/aps-api/v1/guests/`, `/aps-api/v1/taxsets/` |
| `components/view-details/ViewDetails.tsx` | `/aps-api/v1/reservations/details/{id}` |

**Migration pattern:**
```ts
// BEFORE
const data = await proxyFetch('/aps-api/v1/users/details/private')

// AFTER
const { data } = await fetchUtils.get('https://aperfectstay.ai/aps-api/v1/users/details/private')
```

Once all callers are migrated, delete `utils/proxyFetch.ts`.

### 🔲 3. Migrate `loginUserInfo.ts` away from `/api/proxy/user-details`

`apiData/loginUserInfo.ts` calls `fetchUtils.get('/api/proxy/user-details')`.  
Change to direct URL:
```ts
// BEFORE
fetchUtils.get('/api/proxy/user-details')

// AFTER
fetchUtils.get('https://aperfectstay.ai/aps-api/v1/users/details/private')
```

### 🔲 4. Delete all `/api/proxy/*` route files

Once every caller has been moved to direct `fetchUtils` calls, the entire `app/api/proxy/` directory can be removed. These Next.js route handlers exist solely as a workaround for dev auth, which `fetchUtils` now handles client-side.

Routes to delete:
- `app/api/proxy/route.ts` (generic `?path=` proxy)
- `app/api/proxy/user-details/route.ts`
- `app/api/proxy/guests/route.ts`
- `app/api/proxy/taxsets/route.ts`
- `app/api/proxy/case-accounts/route.ts`
- `app/api/proxy/add-payment/route.ts`
- `app/api/proxy/add-reservation/route.ts`
- `app/api/proxy/cancel-checkin/route.ts`
- `app/api/proxy/convert-to-booking/route.ts`
- `app/api/proxy/create-task/route.ts`
- `app/api/proxy/create-case/route.ts`
- `app/api/proxy/split-booking/route.ts`
- `app/api/proxy/share-payment-link/route.ts`
- `app/api/proxy/pms-mark-guest-as-inhouse/route.ts`
- `app/api/proxy/change-property-cleaning-status/route.ts`
- `app/api/proxy/fetch-property-address-and-details/route.ts`
- `app/api/proxy/collab-admin-session/route.ts`
- `app/api/proxy/reservations/[bookingId]/route.ts`

---

## End State

When all the above is done, the full API layer will be:

```
fetchUtils.get / post / put / delete
        ↓
  direct HTTPS call to aperfectstay.ai
  (dev token injected automatically by fetchUtils)
```

No proxy, no wrapper layers, no env-based URL switching.
