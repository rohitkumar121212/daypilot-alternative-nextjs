import FloatingInput from '@/components/common/FloatingInput'

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
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Guest Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FloatingInput label="Name" value={booking.guestName || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Phone" value={booking.phone || 'N/A'} onChange={() => {}} readOnly />
          <FloatingInput label="Email" value={booking.email || 'N/A'} onChange={() => {}} readOnly />
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsTab
