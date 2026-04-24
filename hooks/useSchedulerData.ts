import { useState, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import { detectOverbookings } from '@/utils/overbookingUtils'
import { fetchUtils } from '@/utils/fetchUtils'
import type { SSEReservationEvent } from './useSSEBookings'

interface UseSchedulerDataParams {
  startDate: string
  daysToShow: number
}

interface UseSchedulerDataResult {
  resources: any[]
  setResources: React.Dispatch<React.SetStateAction<any[]>>
  bookings: any[]
  setBookings: React.Dispatch<React.SetStateAction<any[]>>
  collaborators: any[]
  availability: any
  isLoading: boolean
  refresh: () => Promise<void>
  applySSEEvent: (event: SSEReservationEvent) => void
}

function normalizeBooking(raw: any) {
  return {
    ...raw,
    startDate: dayjs(raw.start).format('YYYY-MM-DD'),
    endDate: dayjs(raw.end).format('YYYY-MM-DD'),
    name: 'Room Booking',
    notes: 'Sample booking for Room-1',
    resourceId: raw?.booking_details?.apartment_id,
  }
}

export function useSchedulerData({ startDate, daysToShow }: UseSchedulerDataParams): UseSchedulerDataResult {
  const [resources, setResources] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [availability, setAvailability] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async (isCancelled: () => boolean) => {
    const endDate = dayjs(startDate).add(daysToShow, 'day').format('YYYY-MM-DD')

    const resourcesUrl = `https://aperfectstay.ai/api/aps-pms/apts/private`
    const bookingsUrl = `https://aperfectstay.ai/api/aps-pms/reservations/private?start=${startDate}&end=${endDate}`
    const availabilityUrl = `https://aperfectstay.ai/api/aps-pms/buildings/avail/private?start=${startDate}&end=${endDate}`
    const collaboratorUrl = 'https://aperfectstay.ai/aps-api/v1/collaborators/'

    // ⚡ Fast requests first — show data before availability loads
    const [{ data: resourcesJson }, { data: bookingsJson }, { data: collaboratorJson }] = await Promise.all([
      fetchUtils.get(resourcesUrl),
      fetchUtils.get(bookingsUrl),
      fetchUtils.get(collaboratorUrl)
    ])

    if (isCancelled()) return

    const normalizedBookingData =
      bookingsJson.data.reservations?.map(normalizeBooking).filter((booking: any) => {
        const start = dayjs(booking.startDate)
        const end = dayjs(booking.endDate)
        return start.isValid() && end.isValid() && !end.isBefore(start)
      }) || []

    const uniqueBookings = Array.from(
      new Map(normalizedBookingData.map((b: any) => [b.id || b.booking_id, b])).values()
    )

    const bookingsWithOverbooking = detectOverbookings(uniqueBookings)

    setCollaborators(collaboratorJson?.data || [])
    setResources(resourcesJson?.data?.apt_build_details || [])
    setBookings(bookingsWithOverbooking)
    setIsLoading(false)

    // 🔄 Fetch availability in background after main data is shown
    fetchUtils.get(availabilityUrl)
      .then(({ data: availabilityJson }) => {
        if (!isCancelled()) setAvailability(availabilityJson?.data || null)
      })
      .catch((err: any) => console.error('Failed to load availability data', err))
  }, [startDate, daysToShow])

  // Auto-fetch when startDate or daysToShow changes
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchData(() => cancelled).catch(err => {
      if (!cancelled) {
        console.error('Failed to load scheduler data', err)
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [fetchData])

  // Manual refresh — never cancellable, always runs to completion
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchData(() => false).catch(err => {
      console.error('Failed to load scheduler data', err)
      setIsLoading(false)
    })
  }, [fetchData])

  const applySSEEvent = useCallback((event: SSEReservationEvent) => {
    setBookings(prev => {
      let updated: any[]

      if (event.type === 'reservation.created') {
        const normalized = normalizeBooking(event.data)
        const alreadyExists = prev.some(b => b.id === normalized.id || b.booking_id === normalized.booking_id)
        if (alreadyExists) return prev
        updated = [...prev, normalized]
        console.log('[SSE] Applied create for booking', normalized.id ?? normalized.booking_id)
      } else if (event.type === 'reservation.updated') {
        const normalized = normalizeBooking(event.data)
        updated = prev.map(b =>
          (b.id === normalized.id || b.booking_id === normalized.booking_id) ? normalized : b
        )
        console.log('[SSE] Applied update for booking', normalized.id ?? normalized.booking_id)
      } else if (event.type === 'reservation.deleted') {
        const id = event.data?.id ?? event.data?.booking_id
        updated = prev.filter(b => b.id !== id && b.booking_id !== id)
        console.log('[SSE] Applied delete for booking', id)
      } else {
        return prev
      }

      return detectOverbookings(updated)
    })
  }, [])

  return { resources, setResources, bookings, setBookings, collaborators, availability, isLoading, refresh, applySSEEvent }
}
