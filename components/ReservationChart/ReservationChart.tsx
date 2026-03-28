'use client';
import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { Scheduler } from '@/components/scheduler';
import FilterContainer from './Filter/FilterContainer';
import { DataRefreshProvider } from '@/contexts/DataRefreshContext';
import { useSchedulerData } from '@/hooks/useSchedulerData';

const ReservationChart = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [bookingIdFilter, setBookingIdFilter] = useState('')
  const [enquiryIdFilter, setEnquiryIdFilter] = useState('')
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [daysToShow, setDaysToShow] = useState(30)

  const {
    resources, setResources,
    bookings, setBookings,
    collaborators,
    availability,
    isLoading,
    refresh,
  } = useSchedulerData({ startDate, daysToShow })

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
  const handleBookingCreate = useCallback((bookingData: any) => {
    const newBooking = {
      id: bookings.length + 1,
      ...bookingData
    }
    setBookings(prev => [...prev, newBooking])
  }, [bookings.length, setBookings])

  /* =========================
     Update booking on drag and drop
  ========================= */
  const handleBookingUpdate = useCallback((updatedBooking: any) => {
    setBookings(prev => prev.map(booking =>
      booking.id === updatedBooking.id ? updatedBooking : booking
    ))
  }, [setBookings])

    return (
        <DataRefreshProvider onRefresh={refresh} isRefreshing={isLoading}>
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
                  <Scheduler
                    resources={filteredResources}
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
                </div>
                </div>
             </div>
        </DataRefreshProvider>
    );
}

export default ReservationChart;