'use client'

import { useEffect, useState } from 'react'
import { fetchUtils } from '@/utils/fetchUtils'
import CreateTaskTab from '@/components/ReservationChart/Modals/BookingDetailsModal/CreateTaskTab'

interface CreateNewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  bookingDetails: any
}

const CreateNewTaskModal = ({ isOpen, onClose, bookingDetails }: CreateNewTaskModalProps) => {
  const [reservationConstants, setReservationConstants] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    fetchUtils
      .get('https://aperfectstay.ai/aps-api/v1/constants/reservation')
      .then(({ data }) => setReservationConstants(data?.data))
      .catch((err) => console.error('Failed to fetch task modal data:', err))
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const original = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">Create New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <CreateTaskTab
            reservationConstants={reservationConstants}
            bookingDetails={bookingDetails}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateNewTaskModal
