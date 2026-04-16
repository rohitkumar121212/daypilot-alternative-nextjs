import { useMemo } from 'react'

interface AvailabilityEntry {
  available: number
  total: number
}

interface UseAvailabilityResult {
  /** Per-date totals shown in the date header row (all buildings combined) */
  totalAvailabilityByDate: Record<string, AvailabilityEntry>
  /** Per-building per-date availability, keyed as `"buildingId-date"` */
  availabilityByParent: Record<string, AvailabilityEntry>
  /** Per-apartment availability — currently always empty (not populated by API) */
  availabilityByResource: Record<string, AvailabilityEntry>
}

/**
 * useAvailability
 *
 * Transforms the raw availability API response into three lookup structures
 * used by the scheduler grid:
 *  - totalAvailabilityByDate  → DateHeader (shows X/Y per column)
 *  - availabilityByParent     → building rows (shows availability per building per day)
 *  - availabilityByResource   → apartment rows (not yet populated by API)
 *
 * The API spells the field "availibility" (typo) — matched intentionally here.
 */
export function useAvailability(availability: any): UseAvailabilityResult {
  return useMemo(() => {
    const availabilityByResource: Record<string, AvailabilityEntry> = {}
    const totalAvailabilityByDate: Record<string, AvailabilityEntry> = {}
    const availabilityByParent: Record<string, AvailabilityEntry> = {}

    if (!availability) return { availabilityByResource, totalAvailabilityByDate, availabilityByParent }

    availability.total_availability?.forEach((item: any) => {
      const [available, total] = item.availibility.split('/').map(Number)
      totalAvailabilityByDate[item.date] = { available, total }
    })

    availability.building_wise_availability?.forEach((building: any) => {
      building.date_range?.forEach((dateItem: any) => {
        const [available, total] = dateItem.availibility.split('/').map(Number)
        availabilityByParent[`${building.building_id}-${dateItem.date}`] = { available, total }
      })
    })

    return { availabilityByResource, totalAvailabilityByDate, availabilityByParent }
  }, [availability])
}
