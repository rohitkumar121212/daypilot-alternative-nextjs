const BookingChangeConfirmModal = ({ isOpen, changeData, onConfirm, onCancel }) => {
  if (!isOpen || !changeData) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }} onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-[92%] md:w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Confirm Booking Change</h2>
        
        <p className="text-gray-700 mb-4">Are you sure you want to change the property?</p>
        
        <div className="space-y-3 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-600">New Property</label>
            <p className="text-gray-900">{changeData.newResourceName || changeData.newResourceId}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Start Date</label>
            <p className="text-gray-900">{changeData.newStartDate}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">End Date</label>
            <p className="text-gray-900">{changeData.newEndDate}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">User</label>
            <p className="text-gray-900">{changeData.user || 'Aperfect Stay'}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingChangeConfirmModal
