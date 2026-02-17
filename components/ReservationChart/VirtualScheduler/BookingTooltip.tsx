import React from 'react'
import dayjs from 'dayjs'

interface BookingTooltipProps {
  booking: any
  position: { x: number; y: number }
}

const BookingTooltip = ({ booking, position }: BookingTooltipProps) => {
  const details = booking.booking_details || {}
  
  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px] max-w-[320px]"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y + 10}px`,
        pointerEvents: 'none'
      }}
    >
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
    </div>
  )
}

export default BookingTooltip
