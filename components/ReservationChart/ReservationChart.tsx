'use client';
import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { Scheduler } from '@/components/scheduler';
import FilterContainer from './Filter/FilterContainer';
import ModalManager from './Overlays/ModalManager';
import { DataRefreshProvider } from '@/contexts/DataRefreshContext';
import { useSchedulerData } from '@/hooks/useSchedulerData';
import { useModalState } from '@/hooks/useModalState';
import { useContextMenuState } from '@/hooks/useContextMenuState';
import { useUser } from '@/hooks/useUser'
import { generateDateRange } from '@/components/scheduler/utils/dateUtils';

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

  const { isSquareUser } = useUser()

  // ─── Modal + context menu state ───────────────────────────────────────────
  const { activeModal, openModal, closeModal } = useModalState()
  const [pendingSelection, setPendingSelection] = useState<any>(null)
  const [changeConfirmation, setChangeConfirmation] = useState<{ isOpen: boolean; data: any }>({ isOpen: false, data: null })

  const {
    contextMenu, resourceContextMenu,
    handleBookingRightClick, handleContextMenuAction, handleContextMenuClose,
    handleResourceRightClick, handleResourceContextMenuAction, handleResourceContextMenuClose,
  } = useContextMenuState({ openModal })

  /* =========================
     Filter resources
  ========================= */
  const filteredResources = useMemo(() => {
    let resourcesResult = resources;

    if (bookingIdFilter.trim()) {
      const matchingBookings = bookings.filter(booking =>
        booking.booking_id?.toString().includes(bookingIdFilter) ||
        booking.id?.toString().includes(bookingIdFilter)
      );
      const matchingApartmentIds = new Set(matchingBookings.map(booking => booking.resourceId));
      resourcesResult = resources.map(parent => {
        const matchingChildren = (parent.children || []).filter((child: any) => matchingApartmentIds.has(child.id));
        return matchingChildren.length > 0 ? { ...parent, children: matchingChildren } : null;
      }).filter(Boolean);
    }

    if (enquiryIdFilter.trim()) {
      const matchingBookings = bookings.filter(booking =>
        booking.booking_details?.enq_app_id?.toString().includes(enquiryIdFilter)
      );
      const matchingApartmentIds = new Set(matchingBookings.map(booking => booking.resourceId));
      resourcesResult = resourcesResult.map(parent => {
        const matchingChildren = (parent.children || []).filter((child: any) => matchingApartmentIds.has(child.id));
        return matchingChildren.length > 0 ? { ...parent, children: matchingChildren } : null;
      }).filter(Boolean);
    }

    if (searchTerm.trim()) {
      resourcesResult = resourcesResult.map(parent => {
        const parentMatches = parent.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchingChildren = (parent.children || []).filter((child: any) =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (parentMatches) return parent;
        if (matchingChildren.length > 0) return { ...parent, children: matchingChildren };
        return null;
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

  // ─── Frontend occupancy using unfiltered resources ────────────────────────
  const frontendOccupancyByDate = useMemo(() => {
    const allChildren = resources.flatMap(parent => parent.children || [])
    const total = allChildren.length
    const dates = generateDateRange(daysToShow, startDate)
    const result: Record<string, { available: number; total: number }> = {}
    dates.forEach(date => {
      const occupied = allChildren.filter(child => {
        const childBookings = bookingsByResourceId.get(String(child.id)) || []
        return childBookings.some((b: any) => b.startDate <= date && b.endDate > date)
      }).length
      result[date] = { available: total - occupied, total }
    })
    return result
  }, [resources, bookingsByResourceId, daysToShow, startDate])

  /* =========================
     Booking mutations
  ========================= */
  const handleBookingCreate = useCallback((bookingData: any) => {
    const newBooking = { id: bookings.length + 1, ...bookingData }
    setBookings(prev => [...prev, newBooking])
  }, [bookings.length, setBookings])

  const handleBookingUpdate = useCallback((updatedBooking: any) => {
    setBookings(prev => prev.map(booking =>
      booking.id === updatedBooking.id ? updatedBooking : booking
    ))
  }, [setBookings])

  /* =========================
     Scheduler event handlers
  ========================= */

  // Drag-and-drop: consumer receives move data, shows confirm dialog
  const handleBookingMove = useCallback((moveData: any) => {
    setChangeConfirmation({ isOpen: true, data: moveData })
  }, [])

  const handleConfirmChange = useCallback(() => {
    if (changeConfirmation.data?.booking) handleBookingUpdate(changeConfirmation.data.booking)
    setChangeConfirmation({ isOpen: false, data: null })
  }, [changeConfirmation.data, handleBookingUpdate])

  const handleCancelChange = useCallback(() => {
    setChangeConfirmation({ isOpen: false, data: null })
  }, [])

  // Details modal
  const handleDetailsModalClose = useCallback(() => closeModal(), [closeModal])

  // Split booking
  const handleSplitBooking = useCallback((splitData: any) => {
    const { originalBooking, splitDate, newApartmentId } = splitData
    const booking1 = { ...originalBooking, id: Date.now(), startDate: originalBooking.startDate, endDate: splitDate, resourceId: newApartmentId, backColor: '#5BCAC8' }
    const booking2 = { ...originalBooking, startDate: dayjs(splitDate).add(1, 'day').format('YYYY-MM-DD'), endDate: originalBooking.endDate, backColor: '#5BCAC8' }
    handleBookingUpdate(booking2)
    handleBookingCreate(booking1)
    closeModal()
  }, [handleBookingUpdate, handleBookingCreate, closeModal])

  // Resolve the resource object from a pending selection's resourceId
  const selectedResource = useMemo(() => {
    if (!pendingSelection) return null
    for (const parent of resources) {
      if (String(parent.id) === String(pendingSelection.resourceId)) return parent
      const child = (parent.children || []).find((c: any) => String(c.id) === String(pendingSelection.resourceId))
      if (child) return child
    }
    return null
  }, [pendingSelection, resources])

  return (
    <DataRefreshProvider onRefresh={refresh} isRefreshing={isLoading}>
      <>
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
                frontendOccupancyByDate={frontendOccupancyByDate}
                isSquareUser={isSquareUser}
                onTimeRangeSelect={setPendingSelection}
                onBookingClick={(booking) => openModal('details', booking)}
                onBookingMove={handleBookingMove}
                onBookingRightClick={handleBookingRightClick}
                onResourceRightClick={handleResourceRightClick}
                onResourcesChange={setResources}
                startDate={startDate}
                daysToShow={daysToShow}
                cellWidth={70}
                rowHeight={40}
                height="80vh"
              />
            </div>
          </div>
        </div>

        {/* ── All APS overlays rendered outside the scheduler ────────────── */}
        <ModalManager
          createBookingOpen={!!pendingSelection}
          selection={pendingSelection}
          selectedResource={selectedResource}
          onCreateBookingClose={() => setPendingSelection(null)}
          onCreateBookingConfirm={(bookingData) => { handleBookingCreate(bookingData); setPendingSelection(null) }}
          activeModal={activeModal}
          openModal={openModal}
          closeModal={closeModal}
          onDetailsClose={handleDetailsModalClose}
          onSplitBooking={handleSplitBooking}
          contextMenu={contextMenu}
          onContextMenuClose={handleContextMenuClose}
          onContextMenuAction={handleContextMenuAction}
          resourceContextMenu={resourceContextMenu}
          onResourceContextMenuClose={handleResourceContextMenuClose}
          onResourceContextMenuAction={handleResourceContextMenuAction}
          changeConfirmation={changeConfirmation}
          onConfirmChange={handleConfirmChange}
          onCancelChange={handleCancelChange}
          resources={resources}
        />
      </>
    </DataRefreshProvider>
  );
}

export default ReservationChart;
