const BookingDetailsModal = ({ isOpen, booking, onClose }) => {
  if (!isOpen || !booking) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Booking Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Name</label>
            <p className="text-gray-900">{booking.text || `Booking ${booking.id}`}</p>
          </div>
          
          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Start Date</label>
            <p className="text-gray-900">{booking.startDate}</p>
          </div>
          
          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">End Date</label>
            <p className="text-gray-900">{booking.endDate}</p>
          </div>
          
          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Booking ID</label>
            <p className="text-gray-900">{booking.id}</p>
          </div>
          
          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Resource ID</label>
            <p className="text-gray-900">{booking.resourceId}</p>
          </div>

          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Status</label>
            <p className="text-gray-900">{booking.status || 'Confirmed'}</p>
          </div>

          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Guest Name</label>
            <p className="text-gray-900">{booking.guestName || 'N/A'}</p>
          </div>

          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Email</label>
            <p className="text-gray-900">{booking.email || 'N/A'}</p>
          </div>

          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Phone</label>
            <p className="text-gray-900">{booking.phone || 'N/A'}</p>
          </div>

          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Guests</label>
            <p className="text-gray-900">{booking.guests || 'N/A'}</p>
          </div>

          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Total Amount</label>
            <p className="text-gray-900">{booking.amount || 'N/A'}</p>
          </div>

          <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
            <label className="text-sm font-medium text-gray-600">Notes</label>
            <p className="text-gray-900">{booking.notes || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsModal
