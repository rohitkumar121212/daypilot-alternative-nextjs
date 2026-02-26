import FloatingInput from '@/components/common/FloatingInput'
import { formatDateTime } from '@/utils/formatDateTime'
import BookingNotes from '@/components/common/StringToHtml'

interface BookingDetailsTabProps {
  booking: any
  onCancelBooking?: (booking: any) => void
  onClose?: () => void
}

const BookingDetailsTab = ({ booking, onCancelBooking, onClose }: BookingDetailsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Booking Details Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2 ">Booking Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FloatingInput label="Start Date" value={formatDateTime(booking?.booking_details?.start)} onChange={() => {}} readOnly />
          <FloatingInput label="End Date" value={formatDateTime(booking?.booking_details?.end)} onChange={() => {}} readOnly />
          <FloatingInput label="Duration" value={`${booking?.booking_details?.days} nights` || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Adults" value={booking?.booking_details?.adult_count || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Children" value={booking?.booking_details?.child_count || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Enquiry No" value={booking?.booking_details?.enq_app_id || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Reserved By" value={booking?.booking_details?.booked_by || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Channex ID" value={booking?.booking_details?.channex_id || 'N/A'} onChange={() => {}} readOnly />

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
      <div className='pt-4 border-t border-gray-300'>
        <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2">Other Details</h3>
        <BookingNotes booking={booking} />
      </div>
        {/* CTA */}
        <div className='border-t border-gray-300 pt-4'>
          <button className=" px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition cursor-pointer">
            View Details 
          </button>
          <button 
            onClick={() => onCancelBooking?.(booking)}
            className="ml-3 px-4 py-2 border text-red-500 rounded hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel Booking
          </button>
          <button className="ml-3 px-4 py-2 border text-red-500 rounded hover:bg-gray-100 transition cursor-pointer">
            Edit Booking
          </button>
          
          <button 
            onClick={() => onClose?.()}
            className="ml-3 px-4 py-2 border text-red-500 rounded hover:bg-gray-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
    </div>
  )
}

export default BookingDetailsTab
