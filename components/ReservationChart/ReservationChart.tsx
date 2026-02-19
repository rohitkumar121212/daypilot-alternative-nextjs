'use client';
import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import VirtualScheduler from './VirtualScheduler/VirtualScheduler';
import FilterContainer from './Filter/FilterContainer';

const ReservationChart = ()=>{
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [availability, setAvailability] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [bookingIdFilter, setBookingIdFilter] = useState('')
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [daysToShow, setDaysToShow] = useState(30)

  const [resourcesLoaded, setResourcesLoaded] = useState(false)
  const [bookingsLoaded, setBookingsLoaded] = useState(false)

  // Force landscape on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const style = document.createElement('style')
      style.innerHTML = `
        @media screen and (max-width: 767px) {
          body { transform: rotate(90deg); transform-origin: left top; width: 100vh; height: 100vw; overflow-x: hidden; position: absolute; top: 100%; left: 0; }
        }
      `
      document.head.appendChild(style)
      return () => document.head.removeChild(style)
    }
  }, [])

  /* =========================
     Filter resources by search term and booking ID
  ========================= */
  const filteredResources = useMemo(() => {
    let resourcesResult = resources;
    
    // Filter by booking ID first - show only apartments that have the booking
    if (bookingIdFilter.trim()) {
      const matchingBookings = bookings.filter(booking => 
        booking.booking_id?.toString().includes(bookingIdFilter) ||
        booking.id?.toString().includes(bookingIdFilter)
      );
      
      const matchingApartmentIds = new Set(matchingBookings.map(booking => booking.resourceId));
      
      resourcesResult = resources.map(parent => {
        const matchingChildren = (parent.children || []).filter(child => 
          matchingApartmentIds.has(child.id)
        );
        
        if (matchingChildren.length > 0) {
          return { ...parent, children: matchingChildren };
        }
        
        return null;
      }).filter(Boolean);
    }
    
    // Then filter by search term
    if (searchTerm.trim()) {
      resourcesResult = resourcesResult.map(parent => {
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
    }
    
    return resourcesResult;
  }, [resources, searchTerm, bookingIdFilter, bookings]);

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
     Update booking on drag and drop
  ========================= */
  const handleBookingUpdate = (updatedBooking) => {
    setBookings(prev => prev.map(booking => 
      booking.id === updatedBooking.id ? updatedBooking : booking
    ))
  }

  /* =========================
     Parallel data fetching
  ========================= */
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const endDate = dayjs(startDate).add(daysToShow, 'day').format('YYYY-MM-DD')
        const resourcesUrl = `https://aperfectstay.ai/api/aps-pms/apts/?user=4789839916433408&start=${startDate}`
        const bookingsUrl = `https://aperfectstay.ai/api/aps-pms/reservations/?user=4789839916433408&start=${startDate}&end=${endDate}`
        const availabilityUrl = `https://aperfectstay.ai/api/aps-pms/buildings/avail?user=4789839916433408&start=${startDate}&end=${endDate}`
        const resourcesRequest = fetch(resourcesUrl,{
          next: { revalidate: 600 } // revalidate every 60 seconds
        })

        const bookingsRequest = fetch(bookingsUrl,{
          next: { revalidate: 600 } // revalidate every 60 seconds
        })

        const availabilityRequest = fetch(availabilityUrl,{
          next: { revalidate: 600 } // revalidate every 60 seconds
        })

        // 🚀 parallel execution
        const [resourcesRes, bookingsRes, availabilityRes] = await Promise.all([
          resourcesRequest,
          bookingsRequest, 
          availabilityRequest
        ])

        const resourcesJson = await resourcesRes.json()
        const bookingsJson = await bookingsRes.json()
        const availabilityJson = await availabilityRes.json()

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
        
        setAvailability(availabilityJson?.data || null)
      } catch (err) {
        console.error('Failed to load scheduler data', err)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [startDate, daysToShow])
    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 border-b-2 border-gray-300">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-blue-800">SimpleVirtualScheduler (Custom Implementation)</h2>
                <p className="text-sm text-blue-600">Manual virtualization without external dependencies</p>
            </div>
            <FilterContainer 
              onSearchChange={setSearchTerm}
              onBookingIdChange={setBookingIdFilter}
              onDateChange={setStartDate}
              onDaysChange={setDaysToShow}
              bookings={bookings}
            />
            <div className="h-screen overflow-auto">
                <VirtualScheduler
                resources={filteredResources}
                bookings={bookings}
                availability={availability}
                onBookingCreate={handleBookingCreate}
                onBookingUpdate={handleBookingUpdate}
                onResourcesChange={setResources}
                startDate={startDate}
                daysToShow={daysToShow}
                cellWidth={100}
                rowHeight={60}
                />
            </div>
            </div> 
         </div>
    );
}

export default ReservationChart;