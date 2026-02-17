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
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
            <input type="text" value={booking.startDate} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
            <input type="text" value={booking.endDate} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
            <input type="text" value={booking.duration || 'N/A'} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Adults</label>
            <input type="text" value={booking.adults || 'N/A'} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Children</label>
            <input type="text" value={booking.children || 'N/A'} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Enquiry ID</label>
            <input type="text" value={booking.enquiryId || 'N/A'} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Reserved By</label>
            <input type="text" value={booking.reservedBy || 'N/A'} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
        </div>
      </div>

      {/* Guest Details Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Guest Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input type="text" value={booking.guestName || 'N/A'} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input type="text" value={booking.phone || 'N/A'} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input type="text" value={booking.email || 'N/A'} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsTab
