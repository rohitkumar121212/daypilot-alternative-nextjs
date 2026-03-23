import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { apiFetch } from '@/utils/apiRequest'
import { useDataRefresh } from '@/contexts/DataRefreshContext'

const CancelCheckInModal = ({ isOpen, booking, resources, onCancel, onClose }) => {
  const [isChecked, setIsChecked] = useState(false)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false) // 🔄 Loading state
  const { refreshData } = useDataRefresh()
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setIsChecked(false)
      setIsLoading(false) // 🔄 Reset loading state
    }
  }, [isOpen])
  
  if (!isOpen || !booking) return null

  // Find resource name from resources
  // const getResourceName = () => {
  //   for (const parent of resources || []) {
  //     const child = (parent.children || []).find(c => c.id === booking.resourceId)
  //     if (child) return child.name
  //   }
  //   return 'Unknown'
  // }

  const handleCancel = async () => {
    if (isLoading) return // 🚫 Prevent multiple clicks
    
    setIsLoading(true) // 🔄 Start loading
    
    const payload = {
      booking_id: booking?.booking_details?.booking_key,
      response_version: 'v1',
      cancel_this_reason: reason.trim()
    }

    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const url = isDevelopment
        ? '/api/proxy/cancel-checkin'
        : 'https://aperfectstay.ai/api/aperfect-pms/cancel-checkin '
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Cancel booking response:', data)
      
      if (data.success) {
        const bookingId = data.data?.reservation_id
        console.log('Cancel booking successfully for booking ID:', bookingId)
        
        // ✅ Success: Refresh data and close modal
        await refreshData()
        onClose()
      } else {
        alert(data.error || 'Failed to cancel check-in')
      }
    } catch (error) {
      console.error('Failed to cancel check-in:', error)
      alert('An error occurred while canceling check-in. Please try again.')
    } finally {
      setIsLoading(false) // 🔄 Stop loading
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
            disabled={isLoading || !reason.trim()} // 🚫 Disable when loading or no reason
            className={`flex-1 btn btn-primary-with-bg flex items-center justify-center gap-2 ${
              isLoading || !reason.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Canceling...
              </>
            ) : (
              'Cancel Check-in'
            )}
          </button>
          <button 
            onClick={onClose}
            disabled={isLoading} // 🚫 Disable close button during loading
            className={`flex-1 btn btn-primary ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancelCheckInModal