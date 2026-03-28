import React, { useCallback, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

import DateHeader from './DateHeader'
import SchedulerRow from './SchedulerRow'
import { generateDateRange } from './utils/dateUtils'
import { useSelectionState } from './hooks/useSelectionState'
import { useDragState } from './hooks/useDragState'
import { useAvailability } from './hooks/useAvailability'

/**
 * Scheduler
 *
 * Core virtualised grid — renders resources × dates with booking blocks.
 * All interaction callbacks are optional: the grid renders correctly with
 * none of them. The consumer decides what happens when the user interacts.
 *
 *   onTimeRangeSelect  — user drag-selected a date range (open a create form)
 *   onBookingClick     — user clicked a booking (open a details modal)
 *   onBookingMove      — user dropped a booking on a new cell (confirm the move)
 *   onBookingRightClick — user right-clicked a booking (show a context menu)
 *   onResourceRightClick — user right-clicked a resource label (show a menu)
 *
 * Single scroll container: ONE <div overflow-auto> handles both axes.
 * Resource labels use `position: sticky; left: 0`.
 * Date header uses `position: sticky; top: 0`.
 * Row virtualization via TanStack Virtual (vertical axis only).
 */
interface SchedulerProps {
  resources?: any[]
  bookingsByResourceId?: Map<string, any[]>
  availability?: any
  /** Pass true if the current user is a Square user — shows the no-call icon on eligible bookings */
  isSquareUser?: boolean
  onTimeRangeSelect?: (selection: { resourceId: any; startDate: string; endDate: string }) => void
  onBookingClick?: (booking: any) => void
  onBookingMove?: (moveData: { booking: any; newResourceId: string; newResourceName: string; newStartDate: string; newEndDate: string }) => void
  onBookingRightClick?: (booking: any, position: { x: number; y: number }) => void
  onResourceRightClick?: (resource: any, e: React.MouseEvent) => void
  onResourcesChange?: (resources: any[]) => void
  startDate?: string
  daysToShow?: number
  cellWidth?: number
  rowHeight?: number
  height?: string
}

const Scheduler = ({
  resources = [],
  bookingsByResourceId = new Map(),
  availability = null,
  isSquareUser = false,
  onTimeRangeSelect,
  onBookingClick,
  onBookingMove,
  onBookingRightClick,
  onResourceRightClick,
  onResourcesChange,
  startDate = undefined,
  daysToShow = 30,
  cellWidth = 100,
  rowHeight = 60,
  height = '100%'
}: SchedulerProps) => {

  // ─── Dates ────────────────────────────────────────────────────────────────
  const dates = useMemo(() => generateDateRange(daysToShow, startDate), [daysToShow, startDate])

  // O(1) date→index lookup — built once, passed to every BookingBlock via ResourceRow
  const dateIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    dates.forEach((date, i) => map.set(date, i))
    return map
  }, [dates])

  // ─── Availability ─────────────────────────────────────────────────────────
  const { totalAvailabilityByDate, availabilityByParent } = useAvailability(availability)

  // ─── Drag — move a booking to a new date / resource ───────────────────────
  const { dragState, handleBookingDragStart } = useDragState({ dateIndexMap, resources, onBookingMove })

  // ─── Single scroll container ───────────────────────────────────────────────
  const scrollContainerRef = useRef(null)

  // ─── Flatten resources into rows ──────────────────────────────────────────
  const visibleRows = useMemo(() => {
    return resources.flatMap(parent => {
      const parentRow = { ...parent, type: 'parent', isParent: true }
      if (!parent.expanded) return [parentRow]
      const childRows = (parent.children || []).map((child: any) => ({
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

  // ─── TanStack Virtual ─────────────────────────────────────────────────────
  const rowVirtualizer = useVirtualizer({
    count: visibleRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => rowHeightsMap.get(visibleRows[index]?.id) ?? rowHeight,
    overscan: 5,
  })

  // ─── Selection — click-drag to create a booking ───────────────────────────
  const { selection, handleCellMouseDown, handleCellMouseEnter } = useSelectionState({
    visibleRows,
    dates,
    bookingsByResourceId,
    onTimeRangeSelect,
  })

  // ─── Expand / collapse ────────────────────────────────────────────────────
  const handleToggleExpand = useCallback((parentId: any) => {
    const updated = resources.map(parent =>
      parent.id === parentId ? { ...parent, expanded: !parent.expanded } : parent
    )
    onResourcesChange?.(updated)
  }, [resources, onResourcesChange])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={scrollContainerRef}
      style={{ width: '100%', height, overflow: 'auto' }}
      className="bg-white select-none"
    >
      <div style={{ minWidth: 256 + dates.length * cellWidth }}>

        {/* ── Sticky date header ──────────────────────────────────────────── */}
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

        {/* ── Virtualised rows ────────────────────────────────────────────── */}
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
                availabilityByParent={availabilityByParent}
                cellWidth={cellWidth}
                rowHeight={rowHeight}
                isSquareUser={isSquareUser}
                onResourceRightClick={onResourceRightClick ?? (() => {})}
                onToggleExpand={handleToggleExpand}
                onCellMouseDown={handleCellMouseDown}
                onCellMouseEnter={handleCellMouseEnter}
                onBookingClick={onBookingClick ?? (() => {})}
                onBookingRightClick={onBookingRightClick ?? (() => {})}
                onBookingDragStart={handleBookingDragStart}
              />
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default Scheduler
