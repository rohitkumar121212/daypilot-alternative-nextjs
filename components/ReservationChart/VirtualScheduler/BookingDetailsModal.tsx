import { useState, useEffect } from 'react'

import Tabs from '@/components/common/Tabs'
import BookingDetailsTab from './BookingDetailsModal/BookingDetailsTab'
import CreateCaseTab from './BookingDetailsModal/CreateCaseTab'
import CreateTaskTab from './BookingDetailsModal/CreateTaskTab'
import AddPaymentTab from './BookingDetailsModal/AddPaymentTab'
import SharePaymentLinkTab from './BookingDetailsModal/SharePaymentLinkTab'

import {formatBookingType} from '@/utils/common'
import { apiFetch } from '@/utils/apiRequest'

interface BookingDetailsModalProps {
  isOpen: boolean
  booking: any
  onClose: () => void
  initialTab?: string
  onCancelBooking?: (booking: any) => void
  onOpenCheckInModal?: (booking: any) => void
}

const BookingDetailsModal = ({ isOpen, booking, onClose, initialTab = 'details', onCancelBooking, onOpenCheckInModal }: BookingDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [reservationConstants, setReservationConstants] = useState(null)
  const [assignToUsers, setAssignToUsers] = useState([])

  useEffect(() => {
    if (!isOpen) return

    setActiveTab(initialTab)

    Promise.all([
      apiFetch('/aps-api/v1/cases/users'),
      fetch('https://aperfectstay.ai/aps-api/v1/constants/reservation', {
        credentials: 'include'
      }).then(res => res.json())
    ])
      .then(([assignToUsersData, reservationConstantsData]) => {
        // if needed later
        // setUsers(usersData?.data)
        console.log('Assign to users data:', assignToUsersData)
        const ModifiedAssignToUser=assignToUsersData?.data?.map((user: any) => ({
          value: user.id,
          label: `${user.name} (${user.email})`
        }))
        setAssignToUsers(ModifiedAssignToUser || [])
        setReservationConstants(reservationConstantsData?.data)
      })
      .catch(err => {
        console.error('Failed to fetch modal data:', err)
      })

  }, [isOpen, initialTab])

  if (!isOpen || !booking) return null

  const bookingType = booking?.booking_details?.booking_type
  
  // Define tabs based on booking type
  const allTabs = [
    { id: 'details', label: 'Booking Details', types: ['reserve', 'temp_reserve', 'do_not_reserve', 'old_reserve'] },
    { id: 'case', label: 'Create New Case', types: ['reserve', 'do_not_reserve', 'old_reserve'] },
    { id: 'task', label: 'Create New Task', types: ['reserve', 'do_not_reserve', 'old_reserve'] },
    { id: 'payment', label: 'Add Payment', types: ['reserve', 'old_reserve'] },
    { id: 'share', label: 'Share Payment Link', types: ['reserve', 'old_reserve'] }
  ]
  
  const tabs = allTabs.filter(tab => tab.types.includes(bookingType))

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <BookingDetailsTab 
          booking={booking} 
          onCancelBooking={onCancelBooking} 
          onClose={onClose} 
          onOpenCheckInModal={onOpenCheckInModal}
        />
      case 'case':
        return <CreateCaseTab reservationConstants={reservationConstants} bookingDetails={booking?.booking_details} assignToUsers={assignToUsers} onClose={onClose}/>
      case 'task':
        return <CreateTaskTab reservationConstants={reservationConstants} bookingDetails={booking?.booking_details} onClose={onClose}/>
      case 'payment':
        return <AddPaymentTab bookingId={booking?.booking_id} onClose={onClose} reservationConstants={reservationConstants} bookingDetails={booking?.booking_details}/>
      case 'share':
        return <SharePaymentLinkTab 
                  totalAmount={Number(booking?.booking_details?.price)} 
                  paid={Number(booking?.booking_details?.paid)} 
                  bookingId={booking?.booking_id}
                  email={booking?.booking_details?.email} 
                  paidAmount={Number(booking?.booking_details?.paid)}
                  onClose={onClose}
                />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      {/* <div className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-4xl max-h-[90vh] min-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}> */}
      <div className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-4xl h-[87vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6">
          {/* <h2 className="text-xl font-semibold">{`${booking?.resource} - Reservation Details - ${(formatBookingType(booking?.booking_details?.booking_type))}`}</h2> */}
          <h2 className="text-xl">
            <span className='font-semibold'>{booking?.resource} {" "}</span>
            {"- "}Reservation Details - {" "}
            <span style={{color: booking?.backColor}} className='font-semibold'>
              {formatBookingType(booking?.booking_details?.booking_type)}
            </span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:cursor-pointer">
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
