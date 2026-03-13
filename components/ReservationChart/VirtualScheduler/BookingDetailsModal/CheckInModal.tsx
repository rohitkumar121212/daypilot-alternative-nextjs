// 'use client'

// import { useState } from 'react'

// interface CheckInModalProps {
//   isOpen: boolean
//   onClose: () => void
//   booking: any
//   onCheckIn?: (data: any) => void
// }

// const CheckInModal = ({ isOpen, onClose, booking, onCheckIn }: CheckInModalProps) => {
//   const [isLoading, setIsLoading] = useState(false)

//   if (!isOpen) return null

//   const handleCheckIn = async () => {
//     setIsLoading(true)
//     // Add your check-in logic here
//     console.log('Checking in booking:', booking)
    
//     // Simulate API call
//     setTimeout(() => {
//       setIsLoading(false)
//       onCheckIn?.(booking)
//       onClose()
//     }, 1000)
//   }

//   const handleBackdropClick = (e: React.MouseEvent) => {
//     if (e.target === e.currentTarget) {
//       onClose()
//     }
//   }

//   return (
//     <div
//       className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//       onClick={handleBackdropClick}
//     >
//       <div
//         className="bg-white rounded-lg shadow-2xl w-full max-w-md relative"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Loading Overlay */}
//         {isLoading && (
//           <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
//             <div className="flex flex-col items-center gap-3">
//               <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//               <p className="text-gray-700 font-medium">Processing check-in...</p>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-900">
//             Check-In Confirmation
//           </h2>
//         </div>

//         {/* Content */}
//         <div className="px-6 py-4">
//           <p className="text-gray-700 mb-4">
//             Are you sure you want to mark this booking as checked in?
//           </p>
          
//           <div className="bg-gray-50 p-4 rounded-lg mb-4">
//             <h3 className="font-medium text-gray-900 mb-2">Booking Details:</h3>
//             <p className="text-sm text-gray-600">Guest: {booking?.booking_details?.name}</p>
//             <p className="text-sm text-gray-600">Room: {booking?.apartment}</p>
//             <p className="text-sm text-gray-600">Check-in: {booking?.booking_details?.start}</p>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//             disabled={isLoading}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleCheckIn}
//             className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
//             disabled={isLoading}
//           >
//             Confirm Check-In
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CheckInModal

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
    setTimeout(() => {
      setIsLoading(false)
      // onCheckIn?.(booking)
      // onClose()
    }, 1000)
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
            className={`px-6 py-2 rounded-md text-white transition
              ${isLoading || !checked
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 cursor-pointer"
              }`}
          >
            SAVE
          </button>

          <button
            onClick={onClose}
            className="border px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckInModal