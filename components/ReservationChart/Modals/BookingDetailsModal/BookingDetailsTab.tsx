import FloatingInput from '@/components/common/FloatingInput'
import { formatDateTime } from '@/utils/formatDateTime'
import BookingNotes from '@/components/common/StringToHtml'
import dayjs from 'dayjs'
import { useState } from 'react'
import CheckInModal from './CheckInModal'
import { useUser } from '@/contexts/UserContext'
import { useDataRefresh } from '@/contexts/DataRefreshContext'

interface BookingDetailsTabProps {
  booking: any
  onCancelBooking?: (booking: any) => void
  onClose?: () => void
  onOpenCheckInModal?: (booking: any) => void
}


const BookingDetailsTab = ({ booking, onCancelBooking, onClose, onOpenCheckInModal }: BookingDetailsTabProps) => {
  const user = useUser()
  const { refreshData } = useDataRefresh()
  const [isConverting, setIsConverting] = useState(false)
  
  const isTodayStart = dayjs(booking?.booking_details?.start).isSame(dayjs(), "day")
  const isTempReserve = booking?.booking_details?.booking_type === 'temp_reserve' ? true : false
  const isDoNotReserve = booking?.booking_details?.booking_type === 'do_not_reserve' ? true : false

  const handleConvertToBooking = async () => {
    if (isConverting) return
    
    setIsConverting(true)
    
    const payload = {
      booking_id: booking?.booking_details?.booking_key,
      response_version: 'v1'
    }

    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const url = isDevelopment
        ? '/api/proxy/convert-to-booking'
        : 'https://aperfectstay.ai/api/aperfect-pms/convert-to-booking'
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const data = await response.json()
      
      if (data.success) {
        await refreshData()
        onClose?.()
      } else {
        alert(data.error || 'Failed to convert to booking')
      }
    } catch (error) {
      console.error('Failed to convert to booking:', error)
      alert('An error occurred while converting to booking. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }
  return (
    <div className="space-y-6">
      {/* Booking Details Section */}
      <div>
        {console.log('bookingDetails in BookingDetailsTab:', user)}
        {console.log('Booking details data:', booking)}
        <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2 ">Booking Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FloatingInput label="Check-in" value={formatDateTime(booking?.booking_details?.start)} onChange={() => {}} readOnly />
          <FloatingInput label="Check-out" value={formatDateTime(booking?.booking_details?.end)} onChange={() => {}} readOnly />
          <FloatingInput label="Duration" value={`${booking?.booking_details?.days} nights` || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Adults" value={booking?.booking_details?.adult_count || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Children" value={booking?.booking_details?.child_count || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Enquiry No" value={booking?.booking_details?.enq_app_id || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Reserved By" value={booking?.booking_details?.booked_by || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Channex ID" value={booking?.booking_details?.channex_id || 'N/A'} onChange={() => {}} readOnly />
          {booking?.booking_details?.booking_type==='temp_reserve' && (
            <FloatingInput label="Reserve Till" value={booking?.booking_details?.reserved_till !=='N/A' ? `${(formatDateTime(booking?.booking_details.reserved_till))}` : 'N/A'} onChange={() => {}} readOnly />
          )}
        </div>
      </div>

      {/* Guest Details Section */}
      <div className='pt-4 border-t border-gray-300'>
        <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2">Guest Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FloatingInput label="Name" value={booking?.booking_details?.name || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Phone" value={booking?.booking_details?.phone || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Email" value={booking?.booking_details?.email || 'N/A'} onChange={() => {}} readOnly />
        </div>
      </div>

      {/* Other Details */}
      {/* <div className='pt-4 border-t border-gray-300'>
        <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2">Other Details</h3>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: booking?.booking_details?.booking_notes || 'No additional details available' }}
        />
      </div> */}
      {/* Other Details */}
      {/* <div className='pt-4 border-t border-gray-300'>
        <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2">Other Details</h3>
        <BookingNotes booking={booking} />
      </div> */}
      {/* CTA */}
      <div className='border-t border-gray-300 pt-4 flex flex-wrap gap-3'>
        <a
          href={`https://aperfectstay.ai/aperfect-pms/booking/${booking?.booking_details?.booking_key}/view-details`}
          target="_blank"
          rel="noopener noreferrer"
          // className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition cursor-pointer inline-block"
          className='btn btn-primary-with-bg'
        >
          View Details
        </a>
        {/* {(<button 
            onClick={()=>{}}
            className="ml-3 px-4 py-2 border text-red-500 rounded-md hover:bg-gray-100 transition cursor-pointer"
          >
            Convert to Booking
          </button>)} */}
        {isTodayStart && (!isTempReserve && !isDoNotReserve ) &&(
          <button
            onClick={() => {
              onClose?.()
              onOpenCheckInModal?.(booking)
            }}
            className="btn btn-primary"
          >
            Marked As Checked In
          </button>
        )}
        {isTempReserve && (
          <button 
            onClick={handleConvertToBooking}
            disabled={isConverting}
            className={`btn btn-primary ${
              isConverting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isConverting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Converting...
              </div>
            ) : (
              'Convert to Booking'
            )}
          </button>
        )}
        <button 
          onClick={() => onCancelBooking?.(booking)}
          className="btn text-red-500"
        >
          Cancel Booking
        </button>
        {/* <button className="ml-3 px-4 py-2 border text-red-500 rounded-md hover:bg-gray-100 transition cursor-pointer">
          Edit Booking
        </button> */}
        
        <button 
          onClick={() => onClose?.()}
          className="btn btn-primary"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default BookingDetailsTab
