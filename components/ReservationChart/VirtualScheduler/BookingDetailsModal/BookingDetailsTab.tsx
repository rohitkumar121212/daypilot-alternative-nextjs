import FloatingLabelInput from '@/components/common/FloatingLabelInput'

interface BookingDetailsTabProps {
  booking: any
}

const BookingDetailsTab = ({ booking }: BookingDetailsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Booking Details Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Booking Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FloatingLabelInput label="Start Date" value={booking.startDate} readOnly />
          <FloatingLabelInput label="End Date" value={booking.endDate} readOnly />
          <FloatingLabelInput label="Duration" value={booking.duration || 'N/A'} readOnly />
          <FloatingLabelInput label="Adults" value={booking.adults || 'N/A'} readOnly />
          <FloatingLabelInput label="Children" value={booking.children || 'N/A'} readOnly />
          <FloatingLabelInput label="Enquiry ID" value={booking.enquiryId || 'N/A'} readOnly />
          <FloatingLabelInput label="Reserved By" value={booking.reservedBy || 'N/A'} readOnly />
        </div>
      </div>

      {/* Guest Details Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Guest Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FloatingLabelInput label="Name" value={booking.guestName || 'N/A'} readOnly />
          <FloatingLabelInput label="Phone" value={booking.phone || 'N/A'} readOnly />
          <FloatingLabelInput label="Email" value={booking.email || 'N/A'} readOnly />
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsTab
