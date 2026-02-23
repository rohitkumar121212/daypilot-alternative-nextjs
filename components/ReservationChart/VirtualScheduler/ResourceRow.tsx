import { memo } from 'react'
import DateCell from './DateCell'
import BookingBlock from './BookingBlock'
import SelectionOverlay from './SelectionOverlay'

/**
 * ResourceRow - Memoized component for better performance
 * Dynamically adjusts height based on overbooking count
 */
const ResourceRow = memo(({
  resource,
  dates,
  bookings = [],
  selection,
  dragState,
  availabilityData = {},
  availabilityByParent = {},
  onCellMouseDown,
  onCellMouseEnter,
  onBookingClick,
  onBookingRightClick,
  onBookingDragStart,
  cellWidth = 100,
  rowHeight = 60
}) => {
  // Filter bookings for this resource
  const resourceBookings = bookings.filter(b => String(b.resourceId) === String(resource.id))
  
  // Separate normal and overbooked bookings
  const normalBookings = resourceBookings.filter(b => !b.isOverbooked)
  const overbookedBookings = resourceBookings.filter(b => b.isOverbooked)
  
  // Calculate dynamic height based on overbooking count
  const overbookingCount = overbookedBookings.length
  const hasOverbooking = overbookingCount > 0
  const totalRows = hasOverbooking ? 1 + overbookingCount : 1
  const actualRowHeight = resource.type === 'child' ? rowHeight * totalRows : rowHeight
  const subRowHeight = rowHeight
  
  // Check if this row has an active selection
  const hasSelection = selection && selection.resourceId === resource.id
  
  return (
    <div className="relative overflow-hidden" style={{ height: actualRowHeight }}>
      {/* Date cells */}
      <div className="flex relative overflow-hidden" style={{ height: actualRowHeight }}>
        {dates.map((date) => {
          const isDropTarget = dragState?.dropTarget?.date === date && 
                              dragState?.dropTarget?.resourceId === resource.id
          
          // Only show availability for parent rows (buildings), not child rows (apartments)
          const availability = resource.type === 'parent' 
            ? availabilityByParent[`${resource.id}-${date}`]
            : undefined
          
          return (
            <DateCell
              key={`${resource.id}-${date}`}
              date={date}
              resourceId={resource.id}
              cellWidth={cellWidth}
              cellHeight={actualRowHeight}
              isSelected={hasSelection && isDateInSelection(date, selection)}
              isDropTarget={isDropTarget}
              availability={availability}
              isParentRow={resource.type === 'parent'}
              onMouseDown={onCellMouseDown}
              onMouseEnter={onCellMouseEnter}
            />
          )
        })}
      </div>
      
      {/* Divider lines for child rows with overbooking */}
      {resource.type === 'child' && hasOverbooking && (
        Array.from({ length: overbookingCount }).map((_, index) => (
          <div 
            key={`divider-${index}`}
            className="absolute left-0 right-0 border-t border-dashed border-gray-300" 
            style={{ top: subRowHeight * (index + 1) }}
          />
        ))
      )}
      
      {/* Normal booking blocks - first row */}
      {normalBookings.map(booking => {
        const isDragging = dragState?.draggedBooking?.id === booking.id
        
        return (
          <BookingBlock
            key={booking.id}
            booking={booking}
            dates={dates}
            cellWidth={cellWidth}
            isDragging={isDragging}
            dragOffset={isDragging ? dragState.dragOffset : { x: 0, y: 0 }}
            onBookingClick={onBookingClick}
            onBookingRightClick={onBookingRightClick}
            onBookingDragStart={onBookingDragStart}
            rowIndex={0}
            subRowHeight={subRowHeight}
            isOverbooked={booking.isOverbooked || false}
          />
        )
      })}
      
      {/* Overbooked booking blocks - subsequent rows */}
      {overbookedBookings.map((booking, index) => {
        const isDragging = dragState?.draggedBooking?.id === booking.id
        
        return (
          <BookingBlock
            key={booking.id}
            booking={booking}
            dates={dates}
            cellWidth={cellWidth}
            isDragging={isDragging}
            dragOffset={isDragging ? dragState.dragOffset : { x: 0, y: 0 }}
            onBookingClick={onBookingClick}
            onBookingRightClick={onBookingRightClick}
            onBookingDragStart={onBookingDragStart}
            rowIndex={index + 1}
            subRowHeight={subRowHeight}
            isOverbooked={booking.isOverbooked || false}
          />
        )
      })}
      
      {/* Selection overlay */}
      {hasSelection && (
        <SelectionOverlay
          selection={selection}
          dates={dates}
          cellWidth={cellWidth}
        />
      )}
    </div>
  )
})

/**
 * Check if a date is within the current selection range
 */
const isDateInSelection = (date, selection) => {
  if (!selection || !selection.startDate || !selection.endDate) return false
  
  const dates = [selection.startDate, selection.endDate].sort()
  return date >= dates[0] && date <= dates[1]
}

export default ResourceRow

