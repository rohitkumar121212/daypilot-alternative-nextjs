import { useState } from 'react'
import dayjs from 'dayjs'
import FloatingInput from '@/components/common/FloatingInput'

const SkipCheckInModal = ({ isOpen, booking, resources, onSkip, onClose }) => {
  const [isChecked, setIsChecked] = useState(false)
  

  if (!isOpen || !booking) return null
  console.log("booking in skip modal:", booking)

  // Find resource name from resources
  const getResourceName = () => {
    for (const parent of resources || []) {
      const child = (parent.children || []).find(c => c.id === booking.resourceId)
      if (child) return child.name
    }
    return 'Unknown'
  }

  const handleSkip = async () => {
    if (!isChecked) return
    
    const payload = {
      booking_id: booking.id,
      action: 'skip_checkin'
    }

    try {
      console.log('Skip check-in payload:', payload)
      // await fetch('/api/pms-mark-guest-as-inhouse', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // })
      
      onSkip(payload)
    } catch (error) {
      console.error('Skip check-in failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-[92%] md:w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Skip Check-in</h2>
        
        <div className='grid grid-cols-1 gap-4'>
          <FloatingInput 
            label="Guest Name" 
            type="text"
            value={booking?.booking_details?.name || booking?.text} 
            onChange={() => {}}
            readOnly
          />

          <FloatingInput 
            label="Apartment" 
            type="text"
            // value={getResourceName()} 
            value={booking.resource }
            onChange={() => {}}
            readOnly
          />
          <FloatingInput 
            label="Check-in" 
            type="date"
            // value={dayjs(booking.startDate).format('YYYY-MM-DD HH:mm')}
            value={booking.startDate ? dayjs(booking.startDate).format('YYYY-MM-DD') : ''}
            onChange={() => {}}
            readOnly
          />
          <div>
            <input 
              type="checkbox" 
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <label className="ml-2 text-sm text-gray-700">
              <span className="font-semibold text-red-600">Please Note</span> - Use this option for same guest with different booking.
            </label>
          </div>
        </div>
        

        <div className="space-y-4 mb-6">
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
            {/* <p className="text-sm text-red-700 mb-2">
              <strong>Please Note</strong> - Use this option for same guest with different booking.
            </p> */}
            <p className="text-sm text-red-700">
              Incase checkin is skipped, this booking will <strong>"NOT"</strong> appear in Checkin List on the day of guest arrival.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSkip}
            disabled={!isChecked}
            className={`flex-1 px-4 py-2 rounded ${
              isChecked 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Skip Check-in
          </button>
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default SkipCheckInModal