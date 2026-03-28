import { memo } from 'react'

/**
 * DateCell - Individual date cell in the scheduler grid
 * Memoized to prevent unnecessary re-renders
 */
interface DateCellProps {
  date: string
  resourceId: string
  cellWidth?: number
  cellHeight?: number
  isSelected?: boolean
  isDropTarget?: boolean
  availability?: { available: number; total: number } | null
  isParentRow?: boolean
  onMouseDown?: (date: string, resourceId: string, e: React.MouseEvent) => void
  onMouseEnter?: (date: string, resourceId: string, e: React.MouseEvent) => void
}

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
}: DateCellProps) => {
  const handleMouseDown = (e) => {
    if (isParentRow) return // Don't allow interaction on parent rows
    e.preventDefault()
    onMouseDown?.(date, resourceId, e)
  }
  
  const handleMouseEnter = (e) => {
    if (isParentRow) return // Don't allow interaction on parent rows
    onMouseEnter?.(date, resourceId, e)
  }
  
  // Calculate occupancy percentage and determine color
  const getOccupancyInfo = () => {
    if (!availability || availability.total === 0) {
      return { occupiedCount: 0, totalCount: 0, percentage: 0, color: 'text-gray-500' }
    }
    
    const occupiedCount = availability.available
    const totalCount = availability.total
    const percentage = Math.round((occupiedCount / totalCount) * 100)
    const color = percentage > 50 ? 'text-green-700' : 'text-red-700'
    
    return { occupiedCount, totalCount, percentage, color }
  }
  
  const occupancyInfo = getOccupancyInfo()
  
  return (
    <div
      className={`border-r border-b border-gray-200 bg-white select-none relative flex items-center justify-center ${
        isParentRow ? 'cursor-default' : 'cursor-pointer'
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
      title={availability ? `O: ${occupancyInfo.percentage}% )` : ''}
    >
      {availability !== null && availability !== undefined && (
        <div className={`text-xs font-semibold ${occupancyInfo.color}`}>
          {occupancyInfo.occupiedCount}/{occupancyInfo.totalCount}
        </div>
      )}
    </div>
  )
})

export default DateCell