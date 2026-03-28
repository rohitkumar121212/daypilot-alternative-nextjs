import React, { useState, useCallback, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import dayjs from 'dayjs'

import DateHeader from './DateHeader'
import SchedulerRow from './SchedulerRow'
import ModalManager from './ModalManager'
import { generateDateRange } from '@/utils/dateUtils'
import { useModalState } from '@/hooks/useModalState'
import { useSelectionState } from '@/hooks/useSelectionState'
import { useDragState } from '@/hooks/useDragState'

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

  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, booking: null })
  const [resourceContextMenu, setResourceContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, resource: null })

  // ─── Drag — move a booking to a new date / resource ───────────────────────
  // RAF throttle is applied inside the hook — mousemove updates are capped at
  // 60fps instead of firing on every pixel.
  const {
    dragState,
    changeConfirmation,
    handleBookingDragStart,
    handleConfirmChange,
    handleCancelChange,
  } = useDragState({ dateIndexMap, resources, onBookingUpdate })

  // All booking-action modals (details, split, skip-check-in, check-in, cancel-check-in)
  // are managed as a single activeModal object — one modal open at a time.
  const { activeModal, openModal, closeModal } = useModalState()

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

  // ─── Selection — click-drag to create a booking ───────────────────────────
  const {
    selection,
    modalOpen,
    selectedResource,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleModalClose,
    handleBookingConfirm,
  } = useSelectionState({ visibleRows, dates, onBookingCreate })

  // ─── Booking detail handlers ───────────────────────────────────────────────
  const handleBookingClick = useCallback((booking) => {
    openModal('details', booking)
  }, [openModal])

  const handleDetailsModalClose = useCallback(() => {
    closeModal()
  }, [closeModal])

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
      openModal('split', booking)
    } else if (action === 'skip') {
      openModal('skip-check-in', booking)
    } else if (action === 'cancel-check-in') {
      openModal('cancel-check-in', booking)
    } else if (action === 'new-task') {
      openModal('details', booking, 'task')
    } else if (action === 'new-case') {
      openModal('details', booking, 'case')
    }
  }, [contextMenu.booking, openModal])

  const handleResourceRightClick = useCallback((resource, e) => {
    e.preventDefault()
    e.stopPropagation()
    setResourceContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY }, resource })
  }, [])

  const handleResourceContextMenuAction = useCallback((action) => {
    setResourceContextMenu({ isOpen: false, position: { x: 0, y: 0 }, resource: null })
  }, [])

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, booking: null })
  }, [])

  const handleResourceContextMenuClose = useCallback(() => {
    setResourceContextMenu({ isOpen: false, position: { x: 0, y: 0 }, resource: null })
  }, [])

  // ─── Split / check-in handlers ────────────────────────────────────────────
  const handleSplitBooking = useCallback((splitData) => {
    const { originalBooking, splitDate, newApartmentId } = splitData
    const booking1 = { ...originalBooking, id: Date.now(), startDate: originalBooking.startDate, endDate: splitDate, resourceId: newApartmentId, backColor: '#5BCAC8' }
    const booking2 = { ...originalBooking, startDate: dayjs(splitDate).add(1, 'day').format('YYYY-MM-DD'), endDate: originalBooking.endDate, backColor: '#5BCAC8' }
    onBookingUpdate?.(booking2)
    onBookingCreate?.(booking1)
    closeModal()
  }, [onBookingUpdate, onBookingCreate, closeModal])

  // ─── Expand / collapse ────────────────────────────────────────────────────
  const handleToggleExpand = useCallback((parentId) => {
    const updated = resources.map(parent =>
      parent.id === parentId ? { ...parent, expanded: !parent.expanded } : parent
    )
    onResourcesChange?.(updated)
  }, [resources, onResourcesChange])

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
              <SchedulerRow
                key={virtualRow.key}
                virtualRow={virtualRow}
                row={row}
                dates={dates}
                dateIndexMap={dateIndexMap}
                bookingsByResourceId={bookingsByResourceId}
                selection={selection}
                dragState={dragState}
                availabilityByResource={availabilityByResource}
                availabilityByParent={availabilityByParent}
                cellWidth={cellWidth}
                rowHeight={rowHeight}
                onResourceRightClick={handleResourceRightClick}
                onToggleExpand={handleToggleExpand}
                onCellMouseDown={handleCellMouseDown}
                onCellMouseEnter={handleCellMouseEnter}
                onBookingClick={handleBookingClick}
                onBookingRightClick={handleBookingRightClick}
                onBookingDragStart={handleBookingDragStart}
              />
            )
          })}
        </div>

      </div>
    </div>

      {/* ── All overlays: modals + context menus ────────────────────────── */}
      <ModalManager
        createBookingOpen={modalOpen}
        selection={selection}
        selectedResource={selectedResource}
        onCreateBookingClose={handleModalClose}
        onCreateBookingConfirm={handleBookingConfirm}
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
  )
}

export default NewVirtualizedContainer
