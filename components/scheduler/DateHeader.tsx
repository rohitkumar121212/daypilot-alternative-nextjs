import { memo } from 'react'
import { formatDateHeader } from './utils/dateUtils'

interface DateHeaderProps {
  date: string
  cellWidth?: number
  totalAvailability?: { available: number; total: number } | null
  frontendAvailability?: { available: number; total: number } | null
}

const DateHeader = memo(({ date, cellWidth = 100, totalAvailability = null, frontendAvailability = null }: DateHeaderProps) => {
  const formatted = formatDateHeader(date)

  const occupancyRatioFrontend = frontendAvailability && frontendAvailability.total > 0
    ? (frontendAvailability.available) / frontendAvailability.total
    : 0

  const occupancyPercentageFrontend = Math.round(occupancyRatioFrontend * 100)

  const isHighOccupancyFrontend = occupancyRatioFrontend >= 0.5
  const occupancyRatio =
  totalAvailability && totalAvailability.total > 0
    ? (totalAvailability.available) / totalAvailability.total
    : 0

  const occupancyPercentage = Math.round(occupancyRatio * 100)

  // More occupancy = GOOD → green
  // Less occupancy = BAD → red
  const isHighOccupancy = occupancyRatio > 0.5
  return (
    <div
      className={`flex flex-col items-center justify-center p-2 border-r border-b border-gray-200 bg-gray-50 ${
        formatted.isToday ? 'bg-blue-50 border-blue-300' : ''
      }`}
      style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px`, flexShrink: 0 }}
    >
      <div className={`text-xs ${formatted.isToday ? 'text-blue-600' : 'text-gray-500'}`}>
        {formatted.month}
      </div>
      <div className={`text-xs font-medium ${formatted.isToday ? 'text-blue-600' : 'text-gray-600'}`}>
        {formatted.dayName} {" "} {formatted.dayNumber}
      </div>
      {/* {totalAvailability && (
        <div className="relative group w-full">
          <div
            className={`text-xs font-semibold mt-1 rounded-lg text-center text-white p-1 ${
              isHighOccupancy ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {totalAvailability.available}/{totalAvailability.total}
          </div>

          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-gray-100 text-sm font-semibold px-2 py-1 rounded whitespace-nowrap">
            {`O: ${occupancyPercentage}%`}
          </div>
        </div>
      )} */}
      {frontendAvailability && (
        <>
        <div className="relative group w-full">
          <div
            className={`text-xs font-semibold mt-1 rounded-lg text-center text-white p-1 ${
              isHighOccupancyFrontend ? 'bg-red-500':'bg-green-500'
            }`}
          >
            {frontendAvailability.available}/{frontendAvailability.total}
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-gray-100 text-sm font-semibold px-2 py-1 rounded whitespace-nowrap">
            {`A: ${occupancyPercentageFrontend}%`}
          </div>
        </div>
        {/* <div className="w-full mt-1">
          <div className="text-xs font-semibold rounded-lg text-center text-white p-1 bg-blue-500">
            FE: {frontendAvailability.available}/{frontendAvailability.total}
          </div>
        </div> */}
        </>
      )}
      
    </div>
  )
})

DateHeader.displayName = 'DateHeader'

export default DateHeader