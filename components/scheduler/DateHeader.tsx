import { formatDateHeader } from './utils/dateUtils'

/**
 * DateHeader - Displays date information in the timeline header
 * @param {Object} props
 * @param {string} props.date - Date string in YYYY-MM-DD format
 * @param {number} props.cellWidth - Width of each date cell in pixels
 * @param {Object} props.totalAvailability - Total availability object with available and total
 */
const DateHeader = ({ date, cellWidth = 100, totalAvailability = null }) => {
  const formatted = formatDateHeader(date)

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
      {/* <div className={`text-lg font-semibold ${formatted.isToday ? 'text-blue-700' : 'text-gray-900'}`}>
        {formatted.dayNumber}
      </div> */}
      {totalAvailability && (
        <div className="relative group w-full">
          <div
            className={`text-xs font-semibold mt-1 rounded-lg text-center text-white p-2 ${
              isHighOccupancy ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {totalAvailability.available}/{totalAvailability.total}
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-gray-100 text-sm font-semibold px-2 py-1 rounded whitespace-nowrap">
            {`O: ${occupancyPercentage}%`}
          </div>
        </div>
      )}
      
    </div>
  )
}

export default DateHeader