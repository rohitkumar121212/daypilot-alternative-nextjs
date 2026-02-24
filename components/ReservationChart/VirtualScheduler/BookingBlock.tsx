import dayjs from 'dayjs'
import { useState } from 'react'
import { getDateIndex, daysBetween } from '@/utils/dateUtils'
import BookingTooltip from './BookingTooltip'

/**
 * BookingBlock - Renders an existing booking as an absolute-positioned block
 * @param {Object} props
 * @param {Object} props.booking - Booking object with id, resourceId, startDate, endDate
 * @param {Array<string>} props.dates - Array of all dates in the timeline
 * @param {number} props.cellWidth - Width of each date cell
 * @param {Function} props.onBookingClick - Handler for booking click events
 * @param {Function} props.onBookingDragStart - Handler for booking drag start
 * @param {boolean} props.isDragging - Whether this booking is being dragged
 * @param {Object} props.dragOffset - Drag offset {x, y}
 */
const BookingBlock = ({ 
  booking, 
  dates, 
  cellWidth = 100, 
  onBookingClick, 
  onBookingRightClick,
  onBookingDragStart,
  isDragging = false,
  dragOffset = { x: 0, y: 0 },
  rowIndex = 0,
  subRowHeight,
  isOverbooked = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  // Subtract 1 day from endDate since checkout date should not be included
  const displayEndDate = dayjs(booking.endDate).subtract(1, 'day').format('YYYY-MM-DD')
  
  const startIndex = getDateIndex(booking.startDate, dates)
  const endIndex = getDateIndex(displayEndDate, dates)
  
  // Only hide if booking doesn't overlap with visible range at all
  // Show booking if: starts in range OR ends in range OR spans entire range
  const bookingStartsBeforeRange = startIndex === -1 && booking.startDate < dates[0]
  const bookingEndsAfterRange = endIndex === -1 && displayEndDate > dates[dates.length - 1]
  const bookingSpansEntireRange = bookingStartsBeforeRange && bookingEndsAfterRange
  const bookingOverlapsRange = startIndex !== -1 || endIndex !== -1 || bookingSpansEntireRange
  
  if (!bookingOverlapsRange) return null
  
  // Calculate position and width for visible portion
  const visibleStartIndex = Math.max(0, startIndex === -1 ? 0 : startIndex)
  const visibleEndIndex = Math.min(dates.length - 1, endIndex === -1 ? dates.length - 1 : endIndex)
  
  const left = visibleStartIndex * cellWidth
  const span = visibleEndIndex - visibleStartIndex + 1
  const width = span * cellWidth
  
  const handleMouseDown = (e) => {
    if (e.button === 2) return // Ignore right-click for drag
    e.preventDefault()
    e.stopPropagation()
    
    // Start drag after a small delay to distinguish from click
    const startTime = Date.now()
    const startPos = { x: e.clientX, y: e.clientY }
    
    const handleMouseMove = (moveEvent) => {
      const timeDiff = Date.now() - startTime
      const distance = Math.sqrt(
        Math.pow(moveEvent.clientX - startPos.x, 2) + 
        Math.pow(moveEvent.clientY - startPos.y, 2)
      )
      
      // Start drag if moved more than 5px or held for more than 200ms
      if (distance > 5 || timeDiff > 200) {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        onBookingDragStart?.(booking, e)
      }
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      // If no drag started, treat as click
      const timeDiff = Date.now() - startTime
      if (timeDiff < 200) {
        onBookingClick?.(booking)
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  const handleContextMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowTooltip(false)
    onBookingRightClick?.(booking, { x: e.clientX, y: e.clientY })
  }
  
  const handleMouseEnter = (e) => {
    setShowTooltip(true)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseLeave = () => {
    setShowTooltip(false)
  }
  
  // Get background color from booking data or use default
  const backgroundColor = isOverbooked 
    ? 'rgb(109, 46, 70)' 
    : (booking.backColor || '#40c970')
  const borderColor = isOverbooked 
    ? 'rgb(109, 46, 70)' 
    : (booking.backColor || '#40c970')
  
  // Parse bubbleHtml to check for Lead_Source and is_left
  let bubbleData = {}
  try {
    if (booking.bubbleHtml) {
      // Convert Python dict string to JSON format
      const jsonStr = booking.bubbleHtml.replace(/'/g, '"')
      bubbleData = JSON.parse(jsonStr)
    }
  } catch (e) {
    // If parsing fails, bubbleData remains empty object
  }
  
  // Determine if we should show Lead_Source icon and its position
  const shouldShowIcon = booking.Lead_Source_icon === "true" && bubbleData.Lead_Source
  const showOnLeft = bubbleData.is_left === "true" || bubbleData.is_left === true
  
  // Calculate vertical position based on row index
  const topPosition = subRowHeight ? (rowIndex * subRowHeight) + 1 : 1
  const blockHeight = subRowHeight ? subRowHeight - 2 : 50
  
  return (
    <>
      <div
        className={`absolute top-1 bottom-1 border rounded-xl text-white text-xs flex items-center justify-start font-medium shadow-md z-20 cursor-pointer transition-all ${
          isDragging 
            ? 'opacity-75 shadow-lg transform scale-105' 
            : 'hover:shadow-lg'
        }`}
        style={{
          left: `${left + dragOffset.x}px`,
          top: `${topPosition + dragOffset.y}px`,
          width: `${width}px`,
          height: `${blockHeight}px`,
          backgroundColor: isDragging ? `${backgroundColor}99` : backgroundColor,
          borderColor: borderColor,
          transform: isDragging ? 'rotate(2deg)' : 'none',
          pointerEvents: isDragging ? 'none' : 'auto'
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {shouldShowIcon && showOnLeft && (
          <img src={bubbleData.Lead_Source} alt="Lead Source" className="w-4 h-4 mx-1" />
        )}
        <span className="truncate px-2">{booking?.text || `Booking ${booking.id}`}</span>
        {shouldShowIcon && !showOnLeft && (
          <img src={bubbleData.Lead_Source} alt="Lead Source" className="w-4 h-4 mx-1" />
        )}
      </div>
      
      {showTooltip && !isDragging && (
        <BookingTooltip booking={booking} position={tooltipPosition} />
      )}
    </>
  )
}

export default BookingBlock

