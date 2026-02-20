import FloatingInput from '@/components/common/FloatingInput'

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
          <FloatingInput label="Start Date" value={booking.startDate} onChange={() => {}} readOnly />
          <FloatingInput label="End Date" value={booking.endDate} onChange={() => {}} readOnly />
          <FloatingInput label="Duration" value={booking.duration || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Adults" value={booking.adults || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Children" value={booking.children || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Enquiry ID" value={booking.enquiryId || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Reserved By" value={booking.reservedBy || 'N/A'} onChange={() => {}} readOnly />
        </div>
      </div>

      {/* Guest Details Section */}
      <div className='pt-4 border-t border-gray-300'>
        <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2">Guest Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FloatingInput label="Name" value={booking.guestName || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Phone" value={booking.phone || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Email" value={booking.email || 'N/A'} onChange={() => {}} readOnly />
        </div>
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
