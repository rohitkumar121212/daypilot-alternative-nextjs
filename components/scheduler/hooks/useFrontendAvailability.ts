import { useMemo } from 'react'

interface AvailabilityEntry {
  available: number
  total: number
}

interface UseFrontendAvailabilityResult {
  /** Per-date totals across all buildings — for the date header row */
  frontendOccupancyByDate: Record<string, AvailabilityEntry>
  /** Per-building per-date availability, keyed as `"parentId-date"` — for building row cells */
  frontendAvailabilityByParent: Record<string, AvailabilityEntry>
}

/**
 * useFrontendAvailability
 *
 * Calculates availability purely from booking data already in the frontend —
 * no backend call needed. Mirrors the shape of useAvailability so both sources
 * can be used interchangeably.
 *
 * A booking occupies date `d` when: startDate <= d < endDate
 * (endDate is checkout day — apartment is free on that day)
 *
 * Uses unfiltered `resources` so totals are never skewed by active search/filters.
 */
export function useFrontendAvailability(
  resources: any[],
  bookingsByResourceId: Map<string, any[]>,
  dates: string[]
): UseFrontendAvailabilityResult {
  return useMemo(() => {
    const frontendOccupancyByDate: Record<string, AvailabilityEntry> = {}
    const frontendAvailabilityByParent: Record<string, AvailabilityEntry> = {}

    const allChildren = resources.flatMap(parent => parent.children || [])
    const globalTotal = allChildren.length

    dates.forEach(date => {
      // ── Global (all buildings) ──────────────────────────────────────────────
      const globalOccupied = allChildren.filter(child => {
        const childBookings = bookingsByResourceId.get(String(child.id)) || []
        return childBookings.some((b: any) => b.startDate <= date && b.endDate > date)
      }).length
      frontendOccupancyByDate[date] = { available: globalTotal - globalOccupied, total: globalTotal }

      // ── Per building ────────────────────────────────────────────────────────
      resources.forEach(parent => {
        const children = parent.children || []
        const buildingTotal = children.length
        const buildingOccupied = children.filter((child: any) => {
          const childBookings = bookingsByResourceId.get(String(child.id)) || []
          return childBookings.some((b: any) => b.startDate <= date && b.endDate > date)
        }).length
        frontendAvailabilityByParent[`${parent.id}-${date}`] = {
          available: buildingTotal - buildingOccupied,
          total: buildingTotal,
        }
      })
    })

    return { frontendOccupancyByDate, frontendAvailabilityByParent }
  }, [resources, bookingsByResourceId, dates])
}
