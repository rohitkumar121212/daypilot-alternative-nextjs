'use client';
import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import VirtualScheduler from './VirtualScheduler/VirtualScheduler';
import FilterContainer from './Filter/FilterContainer';

const ReservationChart = ()=>{
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [resourcesLoaded, setResourcesLoaded] = useState(false)
  const [bookingsLoaded, setBookingsLoaded] = useState(false)

  /* =========================
     Filter resources by search term
  ========================= */
  const filteredResources = useMemo(() => {
    if (!searchTerm.trim()) return resources;
    
    return resources.map(parent => {
      const parentMatches = parent.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchingChildren = (parent.children || []).filter(child => 
        child.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (parentMatches) {
        return parent; // Show all children if parent matches
      } else if (matchingChildren.length > 0) {
        return { ...parent, children: matchingChildren }; // Show only matching children
      }
      
      return null; // Hide this parent entirely
    }).filter(Boolean);
  }, [resources, searchTerm]);

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
            <FilterContainer onSearchChange={setSearchTerm} />
            <div className="h-[82vh]">
                <VirtualScheduler
                resources={filteredResources}
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