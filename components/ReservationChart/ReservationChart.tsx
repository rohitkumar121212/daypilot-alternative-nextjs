'use client';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import VirtualScheduler from './VirtualScheduler/VirtualScheduler';

const ReservationChart = ()=>{
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])

  const [resourcesLoaded, setResourcesLoaded] = useState(false)
  const [bookingsLoaded, setBookingsLoaded] = useState(false)

  /* =========================
     Create booking (local)
  ========================= */
  const handleBookingCreate = (bookingData) => {
    const newBooking = {
      id: bookings.length + 1,
      ...bookingData
    }
    setBookings(prev => [...prev, newBooking])
  }

  /* =========================
     Parallel data fetching
  ========================= */
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const resourcesRequest = fetch(
          'https://aperfectstay.ai/api/aps-pms/apts/?user=6351746143092736&start=2026-01-20'
        )

        const bookingsRequest = fetch(
          'https://aperfectstay.ai/api/aps-pms/reservations/?user=6351746143092736&start=2026-01-20&end=2026-02-20'
        )

        // 🚀 parallel execution
        const [resourcesRes, bookingsRes] = await Promise.all([
          resourcesRequest,
          bookingsRequest
        ])

        const resourcesJson = await resourcesRes.json()
        const bookingsJson = await bookingsRes.json()

        if (cancelled) return

        const normalizedBookingData =
           bookingsJson.data.reservations?.map(parent => ({
            ...parent,
            startDate: dayjs(parent.start).format('YYYY-MM-DD'),
            endDate: dayjs(parent.end).format('YYYY-MM-DD'),
            name: 'Room Booking',
            notes: 'Sample booking for Room-1',
            resourceId: parent?.booking_details?.apartment_id
          })) || []
          
        setResources(resourcesJson?.data?.apt_build_details || [])
        setResourcesLoaded(true)

        setBookings(normalizedBookingData)
        setBookingsLoaded(true)
      } catch (err) {
        console.error('Failed to load scheduler data', err)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])
    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 border-b-2 border-gray-300">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-blue-800">SimpleVirtualScheduler (Custom Implementation)</h2>
                <p className="text-sm text-blue-600">Manual virtualization without external dependencies</p>
            </div>
            <div className="h-[82vh]">
                <VirtualScheduler
                resources={resources}
                bookings={bookings}
                onBookingCreate={handleBookingCreate}
                onResourcesChange={setResources}
                daysToShow={30}
                cellWidth={100}
                rowHeight={60}
                />
            </div>
            </div> 
         </div>
    );
}

export default ReservationChart;