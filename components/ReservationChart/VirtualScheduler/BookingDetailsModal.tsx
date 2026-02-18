import { useState, useEffect } from 'react'
import Tabs from '@/components/common/Tabs'
import BookingDetailsTab from './BookingDetailsModal/BookingDetailsTab'
import CreateCaseTab from './BookingDetailsModal/CreateCaseTab'
import CreateTaskTab from './BookingDetailsModal/CreateTaskTab'
import AddPaymentTab from './BookingDetailsModal/AddPaymentTab'
import SharePaymentLinkTab from './BookingDetailsModal/SharePaymentLinkTab'

const BookingDetailsModal = ({ isOpen, booking, onClose, initialTab = 'details' }) => {
  const [activeTab, setActiveTab] = useState(initialTab)
  
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])
  
  if (!isOpen || !booking) return null

  const tabs = [
    { id: 'details', label: 'Booking Details' },
    { id: 'case', label: 'Create New Case' },
    { id: 'task', label: 'Create New Task' },
    { id: 'payment', label: 'Add Payment' },
    { id: 'share', label: 'Share Payment Link' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <BookingDetailsTab booking={booking} />
      case 'case':
        return <CreateCaseTab />
      case 'task':
        return <CreateTaskTab />
      case 'payment':
        return <AddPaymentTab />
      case 'share':
        return <SharePaymentLinkTab />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold">Booking Management</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsModal
