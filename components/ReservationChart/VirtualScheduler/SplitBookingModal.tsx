import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { FloatingInput } from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'

const SplitBookingModal = ({ isOpen, booking, resources, onSplit, onClose }) => {
  const [splitStartDate, setSplitStartDate] = useState('')
  const [splitEndDate, setSplitEndDate] = useState('')
  const [newApartment, setNewApartment] = useState('')

  // Set default dates when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      const defaultStartDate = dayjs(booking.startDate).add(1, 'day').format('YYYY-MM-DD')
      setSplitStartDate(defaultStartDate)
      setSplitEndDate(booking.endDate)
    }
  }, [isOpen, booking])

  if (!isOpen || !booking) return null

  const minDate = dayjs(booking.startDate).add(1, 'day').format('YYYY-MM-DD')

  const handleSplit = async () => {
    if (!splitStartDate || !splitEndDate || !newApartment) {
      alert('Please fill all required fields')
      return
    }

    const payload = {
      booking_id: booking.id,
      split_start: splitStartDate,
      split_end: splitEndDate,
      split_apartment: newApartment
    }

    // Dummy API call
    try {
      console.log('Split booking payload:', payload)
      // await fetch('/api/split-booking', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // })
      
      onSplit({
        originalBooking: booking,
        splitDate: splitStartDate,
        newApartmentId: newApartment
      })
    } catch (error) {
      console.error('Split booking failed:', error)
    }
  }


  // Get all apartments from resources in label/value format
  const apartments = resources.flatMap(parent => 
    (parent.children || []).map(apt => ({
      label: apt.name,
      value: apt.id
    }))
  )

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-[92%] md:w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Split Booking</h2>
        
        <div className="space-y-4 mb-6">
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select From Date</label>
            <input 
              type="text" 
              value={dayjs(booking.startDate).format('DD/MM/YYYY')}
              disabled
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
          </div> */}
          <FloatingInput 
            label="Select From Date" 
            type='date'
            value={splitStartDate} 
            onChange={(e) => setSplitStartDate(e.target.value)}
            min={minDate}
            max={booking.endDate}
          />
          <FloatingInput 
            label="To Date" 
            type='date'
            value={splitEndDate} 
            onChange={(e) => setSplitEndDate(e.target.value)}
          />
          <FloatingDropdown 
            label="Select New Apartment" 
            options={apartments}
            value={newApartment}
            onChange={(value) => setNewApartment(value)}
            required
          />
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSplit}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Split Booking
          </button>
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-red-700"
          >
            Close
          </button>
          
        </div>
      </div>
    </div>
  )
}

export default SplitBookingModal
