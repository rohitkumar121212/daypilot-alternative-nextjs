import { useState } from 'react'
import dayjs from 'dayjs'

const SplitBookingModal = ({ isOpen, booking, resources, onSplit, onClose }) => {
  const [splitDate, setSplitDate] = useState('')
  const [newApartment, setNewApartment] = useState('')

  if (!isOpen || !booking) return null

  const handleSplit = () => {
    if (!splitDate || !newApartment) {
      alert('Please select both split date and new apartment')
      return
    }

    onSplit({
      originalBooking: booking,
      splitDate,
      newApartmentId: newApartment
    })
  }

  // Get all apartments from resources
  const apartments = resources.flatMap(parent => parent.children || [])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-[92%] md:w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Split Booking</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select From Date</label>
            <input 
              type="text" 
              value={dayjs(booking.startDate).format('DD/MM/YYYY')}
              disabled
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input 
              type="date"
              value={splitDate}
              onChange={(e) => setSplitDate(e.target.value)}
              min={booking.startDate}
              max={booking.endDate}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="dd/mm/yyyy"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select New Apartment</label>
            <select 
              value={newApartment}
              onChange={(e) => setNewApartment(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select New Apartment</option>
              {apartments.map(apt => (
                <option key={apt.id} value={apt.id}>{apt.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
          >
            Close
          </button>
          <button 
            onClick={handleSplit}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Split Booking
          </button>
        </div>
      </div>
    </div>
  )
}

export default SplitBookingModal
