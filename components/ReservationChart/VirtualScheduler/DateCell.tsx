import { memo } from 'react'

/**
 * DateCell - Individual date cell in the scheduler grid
 * Memoized to prevent unnecessary re-renders
 */
const DateCell = memo(({
  date,
  resourceId,
  cellWidth = 100,
  cellHeight = 60,
  isSelected = false,
  isDropTarget = false,
  availability = null,
  isParentRow = false,
  onMouseDown,
  onMouseEnter
}) => {
  const handleMouseDown = (e) => {
    if (isParentRow) return // Don't allow interaction on parent rows
    e.preventDefault()
    onMouseDown?.(date, resourceId, e)
  }
  
  const handleMouseEnter = (e) => {
    if (isParentRow) return // Don't allow interaction on parent rows
    onMouseEnter?.(date, resourceId, e)
  }
  
  return (
    <div
      className={`border-r border-b border-gray-200 bg-white select-none relative flex items-center justify-center ${
        isParentRow ? 'cursor-default' : 'cursor-crosshair'
      } ${
        isSelected ? 'bg-blue-100 ring-1 ring-blue-300' : 
        isDropTarget ? 'bg-green-100 ring-2 ring-green-400' :
        isParentRow ? '' : 'hover:bg-gray-50'
      }`}
      style={{ width: cellWidth, minWidth: cellWidth, height: cellHeight }}
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