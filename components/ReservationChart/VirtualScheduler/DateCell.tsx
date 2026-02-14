import { memo } from 'react'

/**
 * DateCell - Individual date cell in the scheduler grid
 * Memoized to prevent unnecessary re-renders
 */
const DateCell = memo(({
  date,
  resourceId,
  cellWidth = 100,
  isSelected = false,
  isDropTarget = false,
  availability = null,
  onMouseDown,
  onMouseEnter
}) => {
  const handleMouseDown = (e) => {
    e.preventDefault()
    onMouseDown?.(date, resourceId, e)
  }
  
  const handleMouseEnter = (e) => {
    onMouseEnter?.(date, resourceId, e)
  }
  
  return (
    <div
      className={`border-r border-b border-gray-200 bg-white cursor-crosshair select-none relative flex items-center justify-center ${
        isSelected ? 'bg-blue-100 ring-1 ring-blue-300' : 
        isDropTarget ? 'bg-green-100 ring-2 ring-green-400' :
        'hover:bg-gray-50'
      }`}
      style={{ width: cellWidth, minWidth: cellWidth, height: 60 }}
      data-date={date}
      data-resource-id={resourceId}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
    >
      {availability !== null && availability !== undefined && (
        <div className={`text-xs font-semibold ${availability.available > 0 ? 'text-green-700' : 'text-red-700'}`}>
          {availability.available}/{availability.total}
        </div>
      )}
    </div>
  )
})

export default DateCell