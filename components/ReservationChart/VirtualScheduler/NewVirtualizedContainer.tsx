import React, { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'

import DateHeader from './DateHeader'
import ResourceRow from './ResourceRow'
import { generateDateRange, getDateIndex } from '@/utils/dateUtils'

// Same lazy-loaded modals as VirtualScheduler
const CreateBookingModal = dynamic(() => import('@/components/ReservationChart/Modals/CreateBookingModal/CreateBookingModal'), { ssr: false, loading: () => null })
const BookingDetailsModal = dynamic(() => import('@/components/ReservationChart/VirtualScheduler/BookingDetailsModal'), { ssr: false, loading: () => null })
const BookingContextMenu = dynamic(() => import('@/components/ReservationChart/VirtualScheduler/BookingContextMenu'), { ssr: false, loading: () => null })
const ResourceContextMenu = dynamic(() => import('@/components/ReservationChart/VirtualScheduler/ResourceContextMenu'), { ssr: false, loading: () => null })
const BookingChangeConfirmModal = dynamic(() => import('@/components/ReservationChart/VirtualScheduler/BookingChangeConfirmModal'), { ssr: false, loading: () => null })
const SplitBookingModal = dynamic(() => import('@/components/ReservationChart/VirtualScheduler/SplitBookingModal'), { ssr: false, loading: () => null })
const SkipCheckInModal = dynamic(() => import('@/components/ReservationChart/VirtualScheduler/SkipCheckInModal'), { ssr: false, loading: () => null })
const CheckInModal = dynamic(() => import('@/components/ReservationChart/VirtualScheduler/BookingDetailsModal/CheckInModal'), { ssr: false, loading: () => null })
const CancelCheckInModal = dynamic(() => import('@/components/ReservationChart/VirtualScheduler/CancelCheckInModal'), { ssr: false, loading: () => null })

/**
 * NewVirtualizedContainer
 *
 * Drop-in replacement for VirtualScheduler using a single scroll container
 * instead of two synced panes. Key differences vs VirtualScheduler:
 *
 *  - ONE <div overflow-auto> handles both horizontal and vertical scroll
 *  - Resource label column uses CSS `position: sticky; left: 0` — no JS sync
 *  - Date header row uses CSS `position: sticky; top: 0` — no JS sync
 *  - Virtual scrolling uses top/bottom spacer divs instead of absolute positioning
 *    so that CSS sticky works correctly inside the scroll container
 *  - Removes: headerScrollRef, timelineScrollRef, isScrollingRef,
 *             handleHeaderScroll, handleTimelineScroll (~40 lines)
 *
 * Props are identical to VirtualScheduler so ReservationChart can swap between
 * the two components without any other changes.
 */
const NewVirtualizedContainer = ({
  resources = [],
  bookings = [],
  bookingsByResourceId = new Map(),
  availability = null,
  onBookingCreate,
  onBookingUpdate,
  onResourcesChange,
  startDate = null,
  daysToShow = 30,
  cellWidth = 100,
  rowHeight = 60,
  height = '100%'
}) => {

  // ─── Dates ────────────────────────────────────────────────────────────────
  const dates = useMemo(() => generateDateRange(daysToShow, startDate), [daysToShow, startDate])

  // O(1) date→index lookup — built once, passed to every BookingBlock via ResourceRow
  const dateIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    dates.forEach((date, i) => map.set(date, i))
    return map
  }, [dates])

  // ─── Availability ─────────────────────────────────────────────────────────
  const { availabilityByResource, totalAvailabilityByDate, availabilityByParent } = useMemo(() => {
    const byResource = {}
    const byDate = {}
    const byParent = {}

    if (!availability) return { availabilityByResource: byResource, totalAvailabilityByDate: byDate, availabilityByParent: byParent }

    availability.total_availability?.forEach(item => {
      const [available, total] = item.availibility.split('/').map(Number)
      byDate[item.date] = { available, total }
    })

    availability.building_wise_availability?.forEach(building => {
      building.date_range?.forEach(dateItem => {
        const [available, total] = dateItem.availibility.split('/').map(Number)
        byParent[`${building.building_id}-${dateItem.date}`] = { available, total }
      })
    })

    return { availabilityByResource: byResource, totalAvailabilityByDate: byDate, availabilityByParent: byParent }
  }, [availability])

  // ─── Interaction state (identical to VirtualScheduler) ────────────────────
  const [selection, setSelection] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailsModalInitialTab, setDetailsModalInitialTab] = useState('details')

  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, booking: null })
  const [resourceContextMenu, setResourceContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, resource: null })

  const [dragState, setDragState] = useState<{ draggedBooking: any; startX: number; startY: number; currentX: number; currentY: number } | null>(null)
  const [changeConfirmation, setChangeConfirmation] = useState({ isOpen: false, data: null })

  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [bookingToSplit, setBookingToSplit] = useState(null)

  const [skipCheckInModalOpen, setSkipCheckInModalOpen] = useState(false)
  const [bookingToSkip, setBookingToSkip] = useState(null)

  const [checkInModalOpen, setCheckInModalOpen] = useState(false)
  const [bookingToCheckIn, setBookingToCheckIn] = useState(null)

  const [cancelCheckInModalOpen, setCancelCheckInModalOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState(null)

  const mouseDownRef = useRef(false)
  const startDateRef = useRef(null)
  const startResourceIdRef = useRef(null)

  // ─── Single scroll container ───────────────────────────────────────────────
  // TanStack Virtual reads the scroll element directly — no manual scrollTop
  // tracking, no ResizeObserver, no spacer math needed.
  const scrollContainerRef = useRef(null)

  // ─── Flatten resources into rows ──────────────────────────────────────────
  const visibleRows = useMemo(() => {
    return resources.flatMap(parent => {
      const parentRow = { ...parent, type: 'parent', isParent: true }
      if (!parent.expanded) return [parentRow]
      const childRows = (parent.children || []).map(child => ({
        ...child,
        parentId: parent.id,
        parentName: parent.name,
        type: 'child',
        isParent: false
      }))
      return [parentRow, ...childRows]
    })
  }, [resources])

  // ─── Row heights (overbooking aware) ─────────────────────────────────────
  const rowHeightsMap = useMemo(() => {
    const heightsMap = new Map()
    visibleRows.forEach(row => {
      if (row.type === 'child') {
        const resourceBookings = bookingsByResourceId.get(String(row.id)) || []
        const overbookingCount = resourceBookings.filter((b, index) => index > 0 && b.isOverbooked).length
        heightsMap.set(row.id, rowHeight * (1 + overbookingCount))
      } else {
        heightsMap.set(row.id, rowHeight)
      }
    })
    return heightsMap
  }, [visibleRows, bookingsByResourceId, rowHeight])

  // ─── TanStack Virtual — vertical row virtualization only ──────────────────
  // Virtualizes ROW rendering (vertical axis) only.
  // Date columns are never virtualized — all dates always exist in the DOM so
  // booking blocks that span many days always render at full width.
  // overscan: 5 renders 5 extra rows above/below the viewport, eliminating
  // blank content during fast scrolling (the main failure of DIY virtualization).
  const rowVirtualizer = useVirtualizer({
    count: visibleRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => rowHeightsMap.get(visibleRows[index]?.id) ?? rowHeight,
    overscan: 5,
  })

  // ─── Selection handlers (identical to VirtualScheduler) ───────────────────
  const handleCellMouseDown = useCallback((date, resourceId, e) => {
    e.preventDefault()
    const resource = visibleRows.find(r => r.id === resourceId)
    if (resource?.type === 'parent') return

    mouseDownRef.current = true
    startDateRef.current = date
    startResourceIdRef.current = resourceId

    setIsSelecting(true)
    setSelection({
      resourceId,
      startDate: date,
      endDate: dayjs(date).add(1, 'day').format('YYYY-MM-DD')
    })
  }, [visibleRows])

  const handleCellMouseEnter = useCallback((date, resourceId) => {
    if (!mouseDownRef.current || !isSelecting) return
    if (resourceId !== startResourceIdRef.current) return
    setSelection(prev => prev ? { ...prev, endDate: date } : null)
  }, [isSelecting])

  useEffect(() => {
    const handleMouseUp = () => {
      if (mouseDownRef.current && isSelecting && selection) {
        mouseDownRef.current = false
        setIsSelecting(false)

        const startIndex = getDateIndex(selection.startDate, dates)
        const endIndex = getDateIndex(selection.endDate, dates)
        const finalStartDate = startIndex <= endIndex ? selection.startDate : selection.endDate
        const finalEndDate = startIndex <= endIndex ? selection.endDate : selection.startDate

        setSelection({ ...selection, startDate: finalStartDate, endDate: finalEndDate })
        setTimeout(() => setModalOpen(true), 100)
      }
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isSelecting, selection, dates])

  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelection(null)
    mouseDownRef.current = false
    setIsSelecting(false)
  }, [])

  const handleBookingConfirm = useCallback((bookingData) => {
    onBookingCreate?.(bookingData)
    handleModalClose()
  }, [onBookingCreate, handleModalClose])

  // ─── Booking detail handlers ───────────────────────────────────────────────
  const handleBookingClick = useCallback((booking) => {
    setSelectedBooking(booking)
    setDetailsModalOpen(true)
  }, [])

  const handleDetailsModalClose = useCallback(() => {
    setDetailsModalOpen(false)
    setSelectedBooking(null)
    setDetailsModalInitialTab('details')
  }, [])

  // ─── Context menu handlers ─────────────────────────────────────────────────
  const handleBookingRightClick = useCallback((booking, position) => {
    setContextMenu({ isOpen: true, position, booking })
  }, [])

  const handleContextMenuAction = useCallback((action) => {
    const booking = contextMenu.booking
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, booking: null })

    if (action === 'logs') {
      window.open(`https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/logs`, '_blank', 'noopener,noreferrer')
    } else if (action === 'view') {
      window.open(`https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/view-details`, '_blank', 'noopener,noreferrer')
    } else if (action === 'split') {
      setBookingToSplit(booking)
      setSplitModalOpen(true)
    } else if (action === 'skip') {
      setBookingToSkip(booking)
      setSkipCheckInModalOpen(true)
    } else if (action === 'cancel-check-in') {
      setBookingToCancel(booking)
      setCancelCheckInModalOpen(true)
    } else if (action === 'new-task') {
      setSelectedBooking(booking)
      setDetailsModalOpen(true)
      setDetailsModalInitialTab('task')
    } else if (action === 'new-case') {
      setSelectedBooking(booking)
      setDetailsModalOpen(true)
      setDetailsModalInitialTab('case')
    }
  }, [contextMenu.booking])

  const handleResourceRightClick = useCallback((resource, e) => {
    e.preventDefault()
    e.stopPropagation()
    setResourceContextMenu({ isOpen: false, position: { x: 0, y: 0 }, resource: null })
    setTimeout(() => {
      setResourceContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY }, resource })
    }, 10)
  }, [])

  const handleResourceContextMenuAction = useCallback((action) => {
    setResourceContextMenu({ isOpen: false, position: { x: 0, y: 0 }, resource: null })
  }, [])

  // ─── Drag handlers (identical to VirtualScheduler) ────────────────────────
  const handleBookingDragStart = useCallback((booking, e) => {
    setDragState({ draggedBooking: booking, startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY })
  }, [])

  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e) => {
      setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null)
    }

    const handleMouseUp = (e) => {
      const target = document.elementFromPoint(e.clientX, e.clientY)
      const dateCell = target?.closest('[data-date]')

      if (dateCell && dragState.draggedBooking) {
        const newStartDate = dateCell.getAttribute('data-date')
        const newResourceId = dateCell.getAttribute('data-resource-id')

        if (newStartDate && newResourceId) {
          const startIndex = getDateIndex(dragState.draggedBooking.startDate, dates)
          const endIndex = getDateIndex(dragState.draggedBooking.endDate, dates)
          const duration = endIndex - startIndex
          const newEndDate = dayjs(newStartDate).add(duration, 'day').format('YYYY-MM-DD')

          let newResourceName = newResourceId
          for (const parent of resources) {
            const child = (parent.children || []).find(c => c.id === newResourceId)
            if (child) { newResourceName = child.name; break }
          }

          setChangeConfirmation({
            isOpen: true,
            data: {
              booking: { ...dragState.draggedBooking, startDate: newStartDate, endDate: newEndDate, resourceId: newResourceId },
              newResourceId,
              newResourceName,
              newStartDate,
              newEndDate,
              user: 'Aperfect Stay'
            }
          })
        }
      }
      setDragState(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, dates, resources])

  const handleConfirmChange = useCallback(() => {
    if (changeConfirmation.data?.booking) onBookingUpdate?.(changeConfirmation.data.booking)
    setChangeConfirmation({ isOpen: false, data: null })
  }, [changeConfirmation.data, onBookingUpdate])

  const handleCancelChange = useCallback(() => {
    setChangeConfirmation({ isOpen: false, data: null })
  }, [])

  // ─── Split / check-in handlers ────────────────────────────────────────────
  const handleSplitBooking = useCallback((splitData) => {
    const { originalBooking, splitDate, newApartmentId } = splitData
    const booking1 = { ...originalBooking, id: Date.now(), startDate: originalBooking.startDate, endDate: splitDate, resourceId: newApartmentId, backColor: '#5BCAC8' }
    const booking2 = { ...originalBooking, startDate: dayjs(splitDate).add(1, 'day').format('YYYY-MM-DD'), endDate: originalBooking.endDate, backColor: '#5BCAC8' }
    onBookingUpdate?.(booking2)
    onBookingCreate?.(booking1)
    setSplitModalOpen(false)
    setBookingToSplit(null)
  }, [onBookingUpdate, onBookingCreate])

  const handleSkipCheckIn = useCallback(() => {
    setSkipCheckInModalOpen(false)
    setBookingToSkip(null)
  }, [])

  const handleCheckIn = useCallback(() => {
    setCheckInModalOpen(false)
    setBookingToCheckIn(null)
  }, [])

  const handleCancelCheckIn = useCallback(() => {
    setCancelCheckInModalOpen(false)
    setBookingToCancel(null)
  }, [])

  // ─── Expand / collapse ────────────────────────────────────────────────────
  const handleToggleExpand = useCallback((parentId) => {
    const updated = resources.map(parent =>
      parent.id === parentId ? { ...parent, expanded: !parent.expanded } : parent
    )
    onResourcesChange?.(updated)
  }, [resources, onResourcesChange])

  // ─── Selected resource for CreateBookingModal ─────────────────────────────
  const selectedResource = useMemo(() => {
    if (!selection) return null
    const visibleRow = visibleRows.find(r => r.id === selection.resourceId)
    if (visibleRow) return visibleRow
    for (const parent of resources) {
      if (parent.id === selection.resourceId) return parent
      const child = (parent.children || []).find(c => c.id === selection.resourceId)
      if (child) return child
    }
    return null
  }, [selection, visibleRows, resources])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    /*
      SINGLE scroll container — handles both horizontal and vertical scroll.
      height prop controls the component's visible area (e.g. "80vh", "600px").
      TanStack Virtual reads scrollTop directly from this element via getScrollElement.
    */
    <>
    <div
      ref={scrollContainerRef}
      style={{ width: '100%', height, overflow: 'auto' }}
      className="bg-white select-none"
    >
      {/* Inner wrapper sets the total scrollable width */}
      <div style={{ minWidth: 256 + dates.length * cellWidth }}>

        {/* ── Sticky date header row ──────────────────────────────────────
            sticky top: stays visible when scrolling vertically.
            The "Apartments" corner cell is also sticky left so it stays
            visible when scrolling horizontally.
        */}
        <div className="sticky top-0 z-30 flex bg-gray-50 border-b border-gray-300 shadow-sm">
          <div className="w-64 min-w-64 sticky left-0 z-40 bg-gray-50 border-r border-gray-200 flex items-center justify-center font-semibold text-gray-700">
            Apartments
          </div>
          <div className="flex">
            {dates.map(date => (
              <DateHeader
                key={date}
                date={date}
                cellWidth={cellWidth}
                totalAvailability={totalAvailabilityByDate[date] || null}
              />
            ))}
          </div>
        </div>

        {/*
          TanStack Virtual row container.
          getTotalSize() sets the container height to the sum of all row heights
          so the scrollbar reflects the full dataset even though only a subset
          of rows is rendered. Each virtual row is absolutely positioned via
          transform: translateY so the browser never has to re-flow the whole list.
        */}
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = visibleRows[virtualRow.index]
            if (!row) return null
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="flex border-b border-gray-200" style={{ height: '100%' }}>
                  {/*
                    Resource label cell.
                    sticky left: stays visible when scrolling horizontally.
                    z-30 keeps it above booking blocks (z-20) in the timeline cell.
                  */}
                  <div
                    className={`w-64 min-w-64 sticky left-0 z-30 border-r border-gray-200 flex items-center hover:bg-gray-50 ${
                      row.type === 'parent'
                        ? 'font-semibold bg-gray-100'
                        : 'pl-8 text-gray-700 bg-white'
                    }`}
                    {...(row.type === 'child' && { onContextMenu: (e) => handleResourceRightClick(row, e) })}
                  >
                    {row.type === 'parent' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleExpand(row.id) }}
                        className="mr-2 p-1 hover:bg-gray-200 rounded shrink-0"
                      >
                        <svg
                          className={`w-4 h-4 text-gray-600 transform ${row.expanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                    {row.type === 'child' && <span className="w-6 shrink-0" />}
                    <span className="flex-1 truncate text-sm">{row.name}</span>
                  </div>

                  {/*
                    Timeline cell — date cells + booking blocks for this row.
                    ResourceRow handles its own internal layout (DateCell grid + BookingBlock overlays).
                  */}
                  <div className="relative" style={{ width: dates.length * cellWidth }}>
                    <ResourceRow
                      resource={row}
                      dates={dates}
                      dateIndexMap={dateIndexMap}
                      resourceBookings={bookingsByResourceId.get(String(row.id)) || []}
                      selection={selection}
                      dragState={dragState}
                      availabilityData={availabilityByResource}
                      availabilityByParent={availabilityByParent}
                      onCellMouseDown={handleCellMouseDown}
                      onCellMouseEnter={handleCellMouseEnter}
                      onBookingClick={handleBookingClick}
                      onBookingRightClick={handleBookingRightClick}
                      onBookingDragStart={handleBookingDragStart}
                      cellWidth={cellWidth}
                      rowHeight={rowHeight}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>

      {/* ── Modals (identical to VirtualScheduler) ──────────────────────── */}
      {modalOpen && (
        <Suspense fallback={null}>
          <CreateBookingModal
            isOpen={modalOpen}
            selection={selection}
            resource={selectedResource}
            onClose={handleModalClose}
            onConfirm={handleBookingConfirm}
          />
        </Suspense>
      )}

      {detailsModalOpen && (
        <Suspense fallback={null}>
          <BookingDetailsModal
            isOpen={detailsModalOpen}
            booking={selectedBooking}
            onClose={handleDetailsModalClose}
            initialTab={detailsModalInitialTab}
            onCancelBooking={(booking) => {
              setBookingToCancel(booking)
              setCancelCheckInModalOpen(true)
              setDetailsModalOpen(false)
            }}
            onOpenCheckInModal={(booking) => {
              setBookingToCheckIn(booking)
              setCheckInModalOpen(true)
            }}
          />
        </Suspense>
      )}

      {contextMenu.isOpen && (
        <Suspense fallback={null}>
          <BookingContextMenu
            isOpen={contextMenu.isOpen}
            position={contextMenu.position}
            onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, booking: null })}
            onAction={handleContextMenuAction}
          />
        </Suspense>
      )}

      {resourceContextMenu.isOpen && (
        <Suspense fallback={null}>
          <ResourceContextMenu
            isOpen={resourceContextMenu.isOpen}
            position={resourceContextMenu.position}
            resource={resourceContextMenu.resource}
            onClose={() => setResourceContextMenu({ isOpen: false, position: { x: 0, y: 0 }, resource: null })}
            onAction={handleResourceContextMenuAction}
          />
        </Suspense>
      )}

      {changeConfirmation.isOpen && (
        <Suspense fallback={null}>
          <BookingChangeConfirmModal
            isOpen={changeConfirmation.isOpen}
            changeData={changeConfirmation.data}
            onConfirm={handleConfirmChange}
            onCancel={handleCancelChange}
          />
        </Suspense>
      )}

      {splitModalOpen && (
        <Suspense fallback={null}>
          <SplitBookingModal
            isOpen={splitModalOpen}
            booking={bookingToSplit}
            resources={resources}
            onSplit={handleSplitBooking}
            onClose={() => { setSplitModalOpen(false); setBookingToSplit(null) }}
          />
        </Suspense>
      )}

      {skipCheckInModalOpen && (
        <Suspense fallback={null}>
          <SkipCheckInModal
            isOpen={skipCheckInModalOpen}
            booking={bookingToSkip}
            resources={resources}
            onSkip={handleSkipCheckIn}
            onClose={() => { setSkipCheckInModalOpen(false); setBookingToSkip(null) }}
          />
        </Suspense>
      )}

      {checkInModalOpen && (
        <Suspense fallback={null}>
          <CheckInModal
            isOpen={checkInModalOpen}
            booking={bookingToCheckIn}
            onCheckIn={handleCheckIn}
            onClose={() => { setCheckInModalOpen(false); setBookingToCheckIn(null) }}
          />
        </Suspense>
      )}

      {cancelCheckInModalOpen && (
        <Suspense fallback={null}>
          <CancelCheckInModal
            isOpen={cancelCheckInModalOpen}
            booking={bookingToCancel}
            resources={resources}
            onCancel={handleCancelCheckIn}
            onClose={() => { setCancelCheckInModalOpen(false); setBookingToCancel(null) }}
          />
        </Suspense>
      )}
    </>
  )
}

export default NewVirtualizedContainer
