import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'

const CancelCheckInModal = ({ isOpen, booking, resources, onCancel, onClose }) => {
  const [isChecked, setIsChecked] = useState(false)
  const [reason, setReason] = useState('')
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setIsChecked(false)
    }
  }, [isOpen])
  
  if (!isOpen || !booking) return null

  // Find resource name from resources
  const getResourceName = () => {
    for (const parent of resources || []) {
      const child = (parent.children || []).find(c => c.id === booking.resourceId)
      if (child) return child.name
    }
    return 'Unknown'
  }

  const handleCancel = async () => {
    const payload = {
      booking_id: booking?.booking_details?.booking_key,
      action: 'cancel_checkin',
      cancel_this_reason: reason.trim()
    }

    try {
      console.log('Cancel check-in payload:', payload)
      // await fetch('/api/aperfect-pms/cancel-checkin', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // })
      
      onCancel(payload)
    } catch (error) {
      console.error('Cancel check-in failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-[92%] md:w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Cancel Check-in</h2>
        
        <div className='grid grid-cols-1 gap-4'>
          <FloatingInput 
            label="Guest Name" 
            type="text"
            value={booking?.booking_details?.name || booking?.text} 
            onChange={() => {}}
            readOnly
          />

          <FloatingInput 
            label="Booking Id" 
            type="text"
            value={booking?.booking_details?.booking_key} 
            onChange={() => {}}
            readOnly
          />
          
          <FloatingInput 
            label="Check-in" 
            type="date"
            value={booking.startDate ? dayjs(booking.startDate).format('YYYY-MM-DD') : ''}
            onChange={() => {}}
            readOnly
          />
          
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 gap-4 pt-4">
            <FloatingLabelTextarea
              label="Reason for cancellation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleCancel}
            className="flex-1 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Cancel Check-in
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

export default CancelCheckInModal