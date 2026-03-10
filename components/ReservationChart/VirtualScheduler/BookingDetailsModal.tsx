import { useState, useEffect } from 'react'
import Tabs from '@/components/common/Tabs'
import BookingDetailsTab from './BookingDetailsModal/BookingDetailsTab'
import CreateCaseTab from './BookingDetailsModal/CreateCaseTab'
import CreateTaskTab from './BookingDetailsModal/CreateTaskTab'
import AddPaymentTab from './BookingDetailsModal/AddPaymentTab'
import SharePaymentLinkTab from './BookingDetailsModal/SharePaymentLinkTab'

import {formatBookingType} from '@/utils/common'

const BookingDetailsModal = ({ isOpen, booking, onClose, initialTab = 'details', onCancelBooking }) => {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [reservationConstants, setReservationConstants] = useState(null)
  console.log("booking in BookingDetailsModal:", booking)
  
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      
      // Fetch reservation constants
      fetch('https://aperfectstay.ai/aps-api/v1/constants/reservation', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => setReservationConstants(data?.data))
        .catch(err => console.error('Failed to fetch reservation constants:', err))
    }
  }, [isOpen, initialTab])
  
  if (!isOpen || !booking) return null

  const bookingType = booking?.booking_details?.booking_type
  
  // Define tabs based on booking type
  const allTabs = [
    { id: 'details', label: 'Booking Details', types: ['reserve', 'temp_reserve', 'do_not_reserve'] },
    { id: 'case', label: 'Create New Case', types: ['reserve', 'do_not_reserve'] },
    { id: 'task', label: 'Create New Task', types: ['reserve', 'do_not_reserve'] },
    { id: 'payment', label: 'Add Payment', types: ['reserve'] },
    { id: 'share', label: 'Share Payment Link', types: ['reserve'] }
  ]
  
  const tabs = allTabs.filter(tab => tab.types.includes(bookingType))

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <BookingDetailsTab booking={booking} onCancelBooking={onCancelBooking} onClose={onClose} />
      case 'case':
        return <CreateCaseTab reservationConstants={reservationConstants} bookingDetails={booking?.booking_details}/>
      case 'task':
        return <CreateTaskTab reservationConstants={reservationConstants} bookingDetails={booking?.booking_details} />
      case 'payment':
        return <AddPaymentTab bookingId={booking?.booking_id} onClose={onClose} acceptedBy={booking?.booking_details?.booked_by} reservationConstants={reservationConstants} bookingDetails={booking?.booking_details}/>
      case 'share':
        return <SharePaymentLinkTab 
                  totalAmount={Number(booking?.booking_details?.price)} 
                  paid={Number(booking?.booking_details?.paid)} 
                  bookingId={booking?.booking_id}
                  email={booking?.booking_details?.email} 
                  paidAmount={Number(booking?.booking_details?.paid)}
                />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6">
          {/* <h2 className="text-xl font-semibold">{`${booking?.resource} - Reservation Details - ${(formatBookingType(booking?.booking_details?.booking_type))}`}</h2> */}
          <h2 className="text-xl">
            <span className='font-semibold'>{booking?.resource} {" "}</span>
            {"- "}Reservation Details - {" "}
            <span style={{color: booking?.backColor}} className='font-semibold'>
              {formatBookingType(booking?.booking_details?.booking_type)}
            </span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* {console.log('Booking in Modal:', booking)} */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsModal
