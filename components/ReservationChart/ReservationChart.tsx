'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import VirtualScheduler from './VirtualScheduler/VirtualScheduler';
import FilterContainer from './Filter/FilterContainer';
import { detectOverbookings } from '@/utils/overbookingUtils';
import { apiFetch } from '@/utils/apiRequest';
import { proxyFetch } from '@/utils/proxyFetch';
import { DataRefreshProvider } from '@/contexts/DataRefreshContext';

const ReservationChart = ({ 
  className = '', 
  style = {}, 
  height = '68%' 
}: { 
  className?: string; 
  style?: React.CSSProperties;
  height?: string;
}) => {
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [collaborators, setCollaborators] = useState([])
  const [availability, setAvailability] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [bookingIdFilter, setBookingIdFilter] = useState('')
  const [enquiryIdFilter, setEnquiryIdFilter] = useState('')
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [daysToShow, setDaysToShow] = useState(30)

  const [resourcesLoaded, setResourcesLoaded] = useState(false)
  const [bookingsLoaded, setBookingsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Force landscape on mobile
  // useEffect(() => {
  //   if (typeof window !== 'undefined' && window.innerWidth < 768) {
  //     const style = document.createElement('style')
  //     style.innerHTML = `
  //       @media screen and (max-width: 767px) {
  //         body { transform: rotate(90deg); transform-origin: left top; width: 100vh; height: 100vw; overflow-x: hidden; position: absolute; top: 100%; left: 0; }
  //       }
  //     `
  //     document.head.appendChild(style)
  //     return () => document.head.removeChild(style)
  //   }
  // }, [])

  /* =========================
     Filter resources by search term, booking ID, and enquiry ID
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
    
    // Filter by enquiry ID - show only apartments that have bookings with the enquiry ID
    if (enquiryIdFilter.trim()) {
      const matchingBookings = bookings.filter(booking => 
        booking.booking_details?.enq_app_id?.toString().includes(enquiryIdFilter)
      );
      
      const matchingApartmentIds = new Set(matchingBookings.map(booking => booking.resourceId));
      
      resourcesResult = resourcesResult.map(parent => {
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
  }, [resources, searchTerm, bookingIdFilter, enquiryIdFilter, bookings]);

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

  useEffect(() => {
  let cancelled = false

  async function loadData() {
    try {
      const endDate = dayjs(startDate).add(daysToShow, 'day').format('YYYY-MM-DD')
      
      const resourcesUrl = `https://aperfectstay.ai/api/aps-pms/apts/private`
      const bookingsUrl = `https://aperfectstay.ai/api/aps-pms/reservations/private?start=${startDate}&end=${endDate}`
      const availabilityUrl = `https://aperfectstay.ai/api/aps-pms/buildings/avail/private?start=${startDate}&end=${endDate}`
      const collaboratorUrl = 'https://aperfectstay.ai/aps-api/v1/collaborators/'
      // ⚡ Fast requests first
      const [resourcesJson, bookingsJson, collaboratorJson] = await Promise.all([
        apiFetch(resourcesUrl),
        apiFetch(bookingsUrl),
        apiFetch(collaboratorUrl)
      ])

      if (cancelled) return

      // Process and show data immediately
      const normalizedBookingData =
        bookingsJson.data.reservations?.map(parent => ({
          ...parent,
          startDate: dayjs(parent.start).format('YYYY-MM-DD'),
          endDate: dayjs(parent.end).format('YYYY-MM-DD'),
          name: 'Room Booking',
          notes: 'Sample booking for Room-1',
          resourceId: parent?.booking_details?.apartment_id
        })).filter(booking => {
          const start = dayjs(booking.startDate)
          const end = dayjs(booking.endDate)
          return start.isValid() && end.isValid() && !end.isBefore(start)
        }) || []
      
      const uniqueBookings = Array.from(
        new Map(normalizedBookingData.map(b => [b.id || b.booking_id, b])).values()
      )
      
      const bookingsWithOverbooking = detectOverbookings(uniqueBookings)
        
      // ✅ Show resources and bookings immediately
      setCollaborators(collaboratorJson?.data || [])
      setResources(resourcesJson?.data?.apt_build_details || [])
      setResourcesLoaded(true)
      setBookings(bookingsWithOverbooking)
      setBookingsLoaded(true)
      setIsLoading(false)

      // 🔄 Fetch availability in background
      apiFetch(availabilityUrl)
        .then(availabilityJson => {
          if (!cancelled) {
            setAvailability(availabilityJson?.data || null)
          }
        })
        .catch(err => {
          console.error('Failed to load availability data', err)
        })
    } catch (err) {
      console.error('Failed to load scheduler data', err)
      setIsLoading(false)
    }
  }

  loadData()

  return () => {
    cancelled = true
  }
}, [startDate, daysToShow])

  // Create a memoized loadData function that can be called externally
  const loadDataFunction = useCallback(async () => {
    let cancelled = false
    setIsLoading(true)

    try {
      const endDate = dayjs(startDate).add(daysToShow, 'day').format('YYYY-MM-DD')
      
      const resourcesUrl = `https://aperfectstay.ai/api/aps-pms/apts/private`
      const bookingsUrl = `https://aperfectstay.ai/api/aps-pms/reservations/private?start=${startDate}&end=${endDate}`
      const availabilityUrl = `https://aperfectstay.ai/api/aps-pms/buildings/avail/private?start=${startDate}&end=${endDate}`
      const collaboratorUrl = 'https://aperfectstay.ai/aps-api/v1/collaborators/'
      
      // ⚡ Fast requests first
      const [resourcesJson, bookingsJson, collaboratorJson] = await Promise.all([
        apiFetch(resourcesUrl),
        apiFetch(bookingsUrl),
        apiFetch(collaboratorUrl)
      ])

      if (cancelled) return

      // Process and show data immediately
      const normalizedBookingData =
        bookingsJson.data.reservations?.map(parent => ({
          ...parent,
          startDate: dayjs(parent.start).format('YYYY-MM-DD'),
          endDate: dayjs(parent.end).format('YYYY-MM-DD'),
          name: 'Room Booking',
          notes: 'Sample booking for Room-1',
          resourceId: parent?.booking_details?.apartment_id
        })).filter(booking => {
          const start = dayjs(booking.startDate)
          const end = dayjs(booking.endDate)
          return start.isValid() && end.isValid() && !end.isBefore(start)
        }) || []
      
      const uniqueBookings = Array.from(
        new Map(normalizedBookingData.map(b => [b.id || b.booking_id, b])).values()
      )
      
      const bookingsWithOverbooking = detectOverbookings(uniqueBookings)
        
      // ✅ Show resources and bookings immediately
      setCollaborators(collaboratorJson?.data || [])
      setResources(resourcesJson?.data?.apt_build_details || [])
      setResourcesLoaded(true)
      setBookings(bookingsWithOverbooking)
      setBookingsLoaded(true)
      setIsLoading(false)

      // 🔄 Fetch availability in background
      apiFetch(availabilityUrl)
        .then(availabilityJson => {
          if (!cancelled) {
            setAvailability(availabilityJson?.data || null)
          }
        })
        .catch(err => {
          console.error('Failed to load availability data', err)
        })
    } catch (err) {
      console.error('Failed to load scheduler data', err)
      setIsLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [startDate, daysToShow])

  // Handle refresh data function
  const handleRefreshData = useCallback(async () => {
    console.log('ReservationChart: Refreshing data...')
    await loadDataFunction()
  }, [loadDataFunction])
    return (
        <DataRefreshProvider onRefresh={handleRefreshData} isRefreshing={isLoading}>
            <div className={`w-full h-full overflow-hidden flex flex-col relative ${className}`} style={style}>
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-700 font-medium text-lg">Loading reservations...</p>
                    </div>
                  </div>
                )}
                <div className="flex-1 min-h-0 border-b-2 border-gray-300 flex flex-col">
                <FilterContainer
                  onSearchChange={setSearchTerm}
                  onBookingIdChange={setBookingIdFilter}
                  onEnquiryIdChange={setEnquiryIdFilter}
                  onDateChange={setStartDate}
                  onDaysChange={setDaysToShow}
                  bookings={bookings}
                  collaborators={collaborators}
                />
                <div className="flex-1 min-h-0 w-full" style={{ height }}>
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
                      rowHeight={40}
                      containerHeight={height}
                      />
                </div>
                </div>
             </div>
        </DataRefreshProvider>
    );
}

export default ReservationChart;



  /* =========================
     Parallel data fetching
  ========================= */
  // useEffect(() => {
  //   let cancelled = false

  //   async function loadData() {
  //     try {
  //       const endDate = dayjs(startDate).add(daysToShow, 'day').format('YYYY-MM-DD')
  //       // const resourcesUrl = `https://aperfectstay.ai/api/aps-pms/apts/?user=6552614495846400&start=${startDate}`
  //       const resourcesUrl = `https://aperfectstay.ai/api/aps-pms/apts/private`

  //       const bookingsUrl = `https://aperfectstay.ai/api/aps-pms/reservations/private?start=${startDate}&end=${endDate}`
  //       const availabilityUrl = `https://aperfectstay.ai/api/aps-pms/buildings/avail/private?start=${startDate}&end=${endDate}`
  //       const resourcesRequest = fetch(resourcesUrl,{
  //         credentials: "include", // include cookies for authentication
  //         next: { revalidate: 600 } // revalidate every 60 seconds
  //       })

  //       const bookingsRequest = fetch(bookingsUrl,{
  //         credentials: "include", // include cookies for authentication
  //         next: { revalidate: 600 } // revalidate every 60 seconds
  //       })

  //       const availabilityRequest = fetch(availabilityUrl,{
  //         credentials: "include", // include cookies for authentication
  //         next: { revalidate: 600 } // revalidate every 60 seconds
  //       })

  //       // 🚀 parallel execution
  //       const [resourcesRes, bookingsRes, availabilityRes] = await Promise.all([
  //         resourcesRequest,
  //         bookingsRequest, 
  //         availabilityRequest
  //       ])

  //       const resourcesJson = await resourcesRes.json()
  //       const bookingsJson = await bookingsRes.json()
  //       const availabilityJson = await availabilityRes.json()

  //       if (cancelled) return

  //       const normalizedBookingData =
  //          bookingsJson.data.reservations?.map(parent => ({
  //           ...parent,
  //           startDate: dayjs(parent.start).format('YYYY-MM-DD'),
  //           endDate: dayjs(parent.end).format('YYYY-MM-DD'),
  //           name: 'Room Booking',
  //           notes: 'Sample booking for Room-1',
  //           resourceId: parent?.booking_details?.apartment_id
  //         })).filter(booking => {
  //           // Filter out invalid bookings where end date is before start date
  //           const start = dayjs(booking.startDate)
  //           const end = dayjs(booking.endDate)
  //           return start.isValid() && end.isValid() && !end.isBefore(start)
  //         }) || []
        
  //       // Remove duplicate bookings by ID
  //       const uniqueBookings = Array.from(
  //         new Map(normalizedBookingData.map(b => [b.id || b.booking_id, b])).values()
  //       )
        
  //       // Detect and mark overbookings
  //       const bookingsWithOverbooking = detectOverbookings(uniqueBookings)
          
  //       setResources(resourcesJson?.data?.apt_build_details || [])
  //       setResourcesLoaded(true)

  //       setBookings(bookingsWithOverbooking)
  //       setBookingsLoaded(true)
        
  //       setAvailability(availabilityJson?.data || null)
  //     } catch (err) {
  //       console.error('Failed to load scheduler data', err)
  //     }
  //   }

  //   loadData()

  //   return () => {
  //     cancelled = true
  //   }
  // }, [startDate, daysToShow])