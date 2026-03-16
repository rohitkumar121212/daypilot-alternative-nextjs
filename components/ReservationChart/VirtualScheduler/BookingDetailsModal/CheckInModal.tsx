'use client'

import { useState } from 'react'

interface CheckInModalProps {
  isOpen: boolean
  onClose: () => void
  booking: any
  onCheckIn?: (data: any) => void
}

const CheckInModal = ({ isOpen, onClose, booking, onCheckIn }: CheckInModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setIsLoading(true)

    const payload = {
      response_version: 'v1',
      booking_id: booking.booking_details?.booking_key,
      action: 'checkin',
    }


    console.log('Checking in booking:', payload)

     try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const url = isDevelopment
        ? '/api/proxy/pms-mark-guest-as-inhouse'
        : 'https://aperfectstay.ai/api/pms-mark-guest-as-inhouse'
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Guest Marked as Inhouse successfully:', data)
      
      if (data.success) {
        const bookingId = data.data?.reservation_id
        console.log('Redirecting to booking details page for booking ID:', bookingId)
        if (bookingId) {
          window.location.href = `/aperfect-pms/booking/${bookingId}/view-details`
        } else {
          // onConfirm({
          //   ...(booking || {}),
          //   resourceId: modalData.resourceId,
          //   startDate: modalData.startDate,
          //   endDate: modalData.endDate,
          //   text: formData.bookingName,
          //   ...formData
          // })
          onClose()
        }
      } else {
        alert(data.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Failed to create booking:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-full max-w-lg rounded shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 border-b py-4">
          <span className="text-red-500 text-lg">🪪</span>
          <h2 className="text-lg font-semibold text-gray-800">
            Mark Guest As Inhouse
          </h2>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-4">

          {/* Guest Name */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">
              Guest Name :
            </label>
            <input
              value={booking?.booking_details?.name || ''}
              readOnly
              className="flex-1 border bg-gray-100 px-3 py-1 rounded text-sm"
            />
          </div>

          {/* Apartment */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">
              Apartment :
            </label>
            <input
              value={booking?.resource || ''}
              readOnly
              className="flex-1 border bg-gray-100 px-3 py-1 rounded text-sm"
            />
          </div>

          {/* Checkin */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">
              Check-In :
            </label>
            <input
              value={booking?.booking_details?.start || ''}
              readOnly
              className="flex-1 border bg-gray-100 px-3 py-1 rounded text-sm"
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Check-In Guest</span>
          </div>

          {/* Info text */}
          <p className="text-xs text-gray-600 text-center mt-4">
            Incase checkin is skipped, this booking will{" "}
            <span className="font-semibold">"NOT"</span> appear in Checkin List
            on the day of guest arrival.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 border-t py-4">
          <button
            onClick={handleSave}
            disabled={isLoading || checked === false}
            className={`btn
              ${isLoading || !checked
                ? "bg-gray-300 cursor-not-allowed"
                : "btn-primary-with-bg"
              }`}
          >
            SAVE
          </button>

          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckInModal