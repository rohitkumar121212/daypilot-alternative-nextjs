import React, { memo } from 'react'
import ResourceRow from './ResourceRow'

interface SchedulerRowProps {
  virtualRow: { key: React.Key; size: number; start: number }
  row: any
  dates: string[]
  dateIndexMap: Map<string, number>
  bookingsByResourceId: Map<string, any[]>
  selection: any
  dragState: any
  availabilityByParent: any
  cellWidth: number
  rowHeight: number
  onResourceRightClick: (row: any, e: React.MouseEvent) => void
  onToggleExpand: (parentId: any) => void
  onCellMouseDown: (date: string, resourceId: any, e: React.MouseEvent) => void
  onCellMouseEnter: (date: string, resourceId: any) => void
  onBookingClick: (booking: any) => void
  onBookingRightClick: (booking: any, position: any) => void
  onBookingDragStart: (booking: any, e: React.MouseEvent) => void
}

/**
 * SchedulerRow
 *
 * Renders a single virtualised row in the scheduler grid. Responsible for:
 *  - TanStack Virtual absolute positioning (translateY)
 *  - Resource label cell (sticky left — stays visible on horizontal scroll)
 *  - Expand / collapse button for parent (building) rows
 *  - Timeline cell containing ResourceRow (date cells + booking blocks)
 */
const SchedulerRow = memo(({
  virtualRow,
  row,
  dates,
  dateIndexMap,
  bookingsByResourceId,
  selection,
  dragState,
  availabilityByParent,
  cellWidth,
  rowHeight,
  onResourceRightClick,
  onToggleExpand,
  onCellMouseDown,
  onCellMouseEnter,
  onBookingClick,
  onBookingRightClick,
  onBookingDragStart,
}: SchedulerRowProps) => {
  return (
    <div
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
          {...(row.type === 'child' && { onContextMenu: (e) => onResourceRightClick(row, e) })}
        >
          {row.type === 'parent' && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleExpand(row.id) }}
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
            availabilityByParent={availabilityByParent}
            onCellMouseDown={onCellMouseDown}
            onCellMouseEnter={onCellMouseEnter}
            onBookingClick={onBookingClick}
            onBookingRightClick={onBookingRightClick}
            onBookingDragStart={onBookingDragStart}
            cellWidth={cellWidth}
            rowHeight={rowHeight}
          />
        </div>

      </div>
    </div>
  )
})

SchedulerRow.displayName = 'SchedulerRow'

export default SchedulerRow
