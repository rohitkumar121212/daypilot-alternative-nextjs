'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import VirtualScheduler from './VirtualScheduler/VirtualScheduler';
import NewVirtualizedContainer from './VirtualScheduler/NewVirtualizedContainer';
import FilterContainer from './Filter/FilterContainer';

// Toggle this to test the new single-container approach vs the current two-pane approach.
// Once NewVirtualizedContainer is confirmed working, delete VirtualScheduler and flip this to false.
const USE_NEW_CONTAINER = true
import { detectOverbookings } from '@/utils/overbookingUtils';
import { apiFetch } from '@/utils/apiRequest';
import { proxyFetch } from '@/utils/proxyFetch';
import { DataRefreshProvider } from '@/contexts/DataRefreshContext';

const ReservationChart = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => {
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [collaborators, setCollaborators] = useState([])
  const [availability, setAvailability] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [bookingIdFilter, setBookingIdFilter] = useState('')
  const [enquiryIdFilter, setEnquiryIdFilter] = useState('')
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [daysToShow, setDaysToShow] = useState(30)

  const [isLoading, setIsLoading] = useState(true)

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

  const bookingsByResourceId = useMemo(() => {
    const map = new Map<string, any[]>()
    bookings.forEach(booking => {
      const id = String(booking.resourceId)
      if (!map.has(id)) map.set(id, [])
      map.get(id)!.push(booking)
    })
    map.forEach((arr, id) => {
      map.set(id, [...arr].sort((a, b) =>
        new Date(a.startDate || a.start).getTime() - new Date(b.startDate || b.start).getTime()
      ))
    })
    return map
  }, [bookings])

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

  // Single source of truth for all data fetching.
  // isCancelled is a getter so both useEffect cleanup and unmount can signal early exit.
  const fetchSchedulerData = useCallback(async (isCancelled: () => boolean) => {
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

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchSchedulerData(() => cancelled).catch(err => {
      if (!cancelled) {
        console.error('Failed to load scheduler data', err)
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [fetchSchedulerData])

  const handleRefreshData = useCallback(async () => {
    setIsLoading(true)
    await fetchSchedulerData(() => false).catch(err => {
      console.error('Failed to load scheduler data', err)
      setIsLoading(false)
    })
  }, [fetchSchedulerData])
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
                <div className="flex-1 min-h-0 w-full shadow-md">
                  {USE_NEW_CONTAINER ? (
                    <NewVirtualizedContainer
                      resources={filteredResources}
                      bookings={bookings}
                      bookingsByResourceId={bookingsByResourceId}
                      availability={availability}
                      onBookingCreate={handleBookingCreate}
                      onBookingUpdate={handleBookingUpdate}
                      onResourcesChange={setResources}
                      startDate={startDate}
                      daysToShow={daysToShow}
                      cellWidth={100}
                      rowHeight={40}
                      height="80vh"
                    />
                  ) : (
                    <VirtualScheduler
                      resources={filteredResources}
                      bookings={bookings}
                      bookingsByResourceId={bookingsByResourceId}
                      availability={availability}
                      onBookingCreate={handleBookingCreate}
                      onBookingUpdate={handleBookingUpdate}
                      onResourcesChange={setResources}
                      startDate={startDate}
                      daysToShow={daysToShow}
                      cellWidth={100}
                      rowHeight={40}
                    />
                  )}
                </div>
                </div>
             </div>
        </DataRefreshProvider>
    );
}

export default ReservationChart;