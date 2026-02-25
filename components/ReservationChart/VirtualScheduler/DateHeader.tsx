import { formatDateHeader } from '@/utils/dateUtils'

/**
 * DateHeader - Displays date information in the timeline header
 * @param {Object} props
 * @param {string} props.date - Date string in YYYY-MM-DD format
 * @param {number} props.cellWidth - Width of each date cell in pixels
 * @param {Object} props.totalAvailability - Total availability object with available and total
 */
const DateHeader = ({ date, cellWidth = 100, totalAvailability = null }) => {
  const formatted = formatDateHeader(date)
  
  return (
    <div
      className={`flex flex-col items-center justify-center p-2 border-r border-b border-gray-200 bg-gray-50 ${
        formatted.isToday ? 'bg-blue-50 border-blue-300' : ''
      }`}
      style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px`, flexShrink: 0 }}
    >
      <div className={`text-xs font-medium ${formatted.isToday ? 'text-blue-600' : 'text-gray-600'}`}>
        {formatted.dayName}
      </div>
      <div className={`text-lg font-semibold ${formatted.isToday ? 'text-blue-700' : 'text-gray-900'}`}>
        {formatted.dayNumber}
      </div>
      <div className={`text-xs ${formatted.isToday ? 'text-blue-600' : 'text-gray-500'}`}>
        {formatted.month}
      </div>
      {totalAvailability && (
        <>
          {/* <div className={`text-xs font-semibold mt-1 ${totalAvailability.available > 0 ? 'text-green-700' : 'text-red-700'}`}>
          {totalAvailability.available}/{totalAvailability.total}
        </div> */}
        <div className={`text-xs font-semibold mt-1 bg-gray-500 rounded-lg w-full text-center text-white p-2`}>
          {totalAvailability.available}/{totalAvailability.total}
        </div>
        </>
      )}
    </div>
  )
}

export default DateHeader