import dayjs from 'dayjs'
import { getDateIndex } from '@/utils/dateUtils'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

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
  const displayEndDate = dayjs(booking.endDate).subtract(1, 'day').format('YYYY-MM-DD')
  
  const startIndex = getDateIndex(booking.startDate, dates)
  const endIndex = getDateIndex(displayEndDate, dates)
  
  const bookingStartsBeforeRange = startIndex === -1 && booking.startDate < dates[0]
  const bookingEndsAfterRange = endIndex === -1 && displayEndDate > dates[dates.length - 1]
  const bookingSpansEntireRange = bookingStartsBeforeRange && bookingEndsAfterRange
  const bookingOverlapsRange = startIndex !== -1 || endIndex !== -1 || bookingSpansEntireRange
  
  if (!bookingOverlapsRange) return null
  
  const visibleStartIndex = Math.max(0, startIndex === -1 ? 0 : startIndex)
  const visibleEndIndex = Math.min(dates.length - 1, endIndex === -1 ? dates.length - 1 : endIndex)
  
  const left = visibleStartIndex * cellWidth
  const span = visibleEndIndex - visibleStartIndex + 1
  const width = span * cellWidth
  
  const handleMouseDown = (e) => {
    if (e.button === 2) return
    e.preventDefault()
    e.stopPropagation()
    
    const startTime = Date.now()
    const startPos = { x: e.clientX, y: e.clientY }
    
    const handleMouseMove = (moveEvent) => {
      const timeDiff = Date.now() - startTime
      const distance = Math.sqrt(
        Math.pow(moveEvent.clientX - startPos.x, 2) + 
        Math.pow(moveEvent.clientY - startPos.y, 2)
      )
      
      if (distance > 5 || timeDiff > 200) {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        onBookingDragStart?.(booking, e)
      }
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
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
    onBookingRightClick?.(booking, { x: e.clientX, y: e.clientY })
  }
  
  const backgroundColor = isOverbooked ? 'rgb(109, 46, 70)' : (booking.backColor || '#40c970')
  const borderColor = isOverbooked ? 'rgb(109, 46, 70)' : (booking.backColor || '#40c970')
  const details = booking.booking_details || {}
  
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
  
  const topPosition = subRowHeight ? (rowIndex * subRowHeight) + 1 : 1
  const blockHeight = subRowHeight ? subRowHeight - 2 : 50
  
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className={`absolute top-1 bottom-1 border rounded-xl text-white text-xs flex items-center justify-start font-medium shadow-md z-20 cursor-pointer transition-all ${
            isDragging ? 'opacity-75 shadow-lg transform scale-105' : 'hover:shadow-lg'
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
        >
          {shouldShowIcon && showOnLeft && (
            <img src={bubbleData.Lead_Source} alt="Lead Source" className="w-4 h-4 mx-1" />
          )}
          <span className="truncate px-2">{booking?.text || `Booking ${booking.id}`}</span>
          {shouldShowIcon && !showOnLeft && (
            <img src={bubbleData.Lead_Source} alt="Lead Source" className="w-4 h-4 mx-1" />
          )}
        </div>
      </HoverCardTrigger>
      {!isDragging && (
        <HoverCardContent side="top" align="center" className="w-80 z-50" sideOffset={5} collisionPadding={20}>
        <div className="space-y-2">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-gray-900 text-sm">{details.name || 'Guest'}</h3>
            <p className="text-xs text-gray-500">{details.apartment || 'Apartment'}</p>
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-medium text-gray-900">{dayjs(booking.startDate).format('MMM DD, YYYY')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium text-gray-900">{dayjs(booking.endDate).format('MMM DD, YYYY')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nights:</span>
              <span className="font-medium text-gray-900">{details.days || 0}</span>
            </div>
          </div>
          
          {details.phone && (
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{details.phone}</span>
              </div>
            </div>
          )}
          
          {details.email && (
            <div className="text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900 truncate ml-2">{details.email}</span>
              </div>
            </div>
          )}
          
          {details.nightly_rate && (
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Rate/Night:</span>
                <span className="font-medium text-green-700">{details.nightly_rate} INR</span>
              </div>
            </div>
          )}
        </div>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}

export default BookingBlock

