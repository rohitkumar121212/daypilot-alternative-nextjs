import { useState, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import { detectOverbookings } from '@/utils/overbookingUtils'
import { apiFetch } from '@/utils/apiRequest'

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
    const [resourcesJson, bookingsJson, collaboratorJson] = await Promise.all([
      apiFetch(resourcesUrl),
      apiFetch(bookingsUrl),
      apiFetch(collaboratorUrl)
    ])

    if (isCancelled()) return

    const normalizedBookingData =
      bookingsJson.data.reservations?.map((parent: any) => ({
        ...parent,
        startDate: dayjs(parent.start).format('YYYY-MM-DD'),
        endDate: dayjs(parent.end).format('YYYY-MM-DD'),
        name: 'Room Booking',
        notes: 'Sample booking for Room-1',
        resourceId: parent?.booking_details?.apartment_id
      })).filter((booking: any) => {
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
    apiFetch(availabilityUrl)
      .then(availabilityJson => {
        if (!isCancelled()) setAvailability(availabilityJson?.data || null)
      })
      .catch(err => console.error('Failed to load availability data', err))
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

  return { resources, setResources, bookings, setBookings, collaborators, availability, isLoading, refresh }
}
