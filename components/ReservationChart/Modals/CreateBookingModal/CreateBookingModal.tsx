import React, { useState, useEffect } from 'react'
import { daysBetween } from '@/utils/dateUtils'
import BookForm from './BookForm'
import HoldForm from './HoldForm'
import BlockForm from './BlockForm'
import { createReservation, createHold, createBlock } from '@/apiData/services/pms/bookings'

/**
 * CreateBookingModal - Modal dialog for creating/editing bookings
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.selection - Selection object with resourceId, startDate, endDate
 * @param {Object} props.booking - Existing booking object (for editing)
 * @param {Object} props.resource - Resource object for the selected resource
 * @param {Function} props.onClose - Handler to close the modal
 * @param {Function} props.onConfirm - Handler to confirm booking creation/update
 */

const reservationMap: Record<string, string> = {
  book: 'reserve',
  hold: 'temp_reserve',
  block: 'do_not_reserve',
}


const CreateBookingModal = ({ isOpen, selection, booking, resource, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    bookingName: '',
    title: '',
    guestName: '',
    email: '',
    phone: '',
    adults: '',
    children: '',
    checkIn: '',
    checkOut: '',
    totalPrice: '',
    account: '',
    tax: '',
    idNumber: '',
    nationality: '',
    commission: '',
    dnrReason: '',
    enquiryAppId: '',
    holdBookingTill: '',
    status: '',
    dnrNotes: '',
    bookingType: 'block'
  })
  
  const isEditing = !!booking
  const modalData = booking || selection
  
  useEffect(() => {
    if (isOpen && booking) {
      setFormData({
        bookingName: booking.text || booking.name || '',
        title: booking.title || '',
        guestName: booking.guestName || '',
        email: booking.email || '',
        phone: booking.phone || '',
        adults: booking.adults || '',
        children: booking.children || '',
        checkIn: booking.startDate || '',
        checkOut: booking.endDate || '',
        totalPrice: booking.totalPrice || '',
        account: booking.account || '',
        tax: booking.tax || '',
        idNumber: booking.idNumber || '',
        nationality: booking.nationality || '',
        commission: booking.commission || '',
        dnrReason: booking.dnrReason || '',
        enquiryAppId: booking.enquiryAppId || '',
        holdBookingTill: booking.holdBookingTill || '',
        status: booking.status || '',
        dnrNotes: booking.dnrNotes || '',
        bookingType: booking.bookingType || 'book'
      })
    } else if (isOpen) {
      setFormData({
        bookingName: '',
        title: '',
        guestName: '',
        email: '',
        phone: '',
        adults: '1',
        children: '0',
        checkIn: modalData?.startDate || '',
        checkOut: modalData?.endDate || '',
        totalPrice: '',
        account: '',
        tax: '',
        idNumber: '',
        nationality: '',
        commission: '',
        dnrReason: '',
        enquiryAppId: '',
        holdBookingTill: '',
        status: '',
        dnrNotes: '',
        bookingType: 'book'
      })
    }
  }, [isOpen, booking, modalData])
  
  if (!isOpen || !modalData || !resource) return null
  
  const dayCount = daysBetween(modalData.startDate, modalData.endDate)
  
  const handleConfirm = async () => {
    const reservationType = reservationMap[formData.bookingType] || ''

    const payload = {
      prop_abbr_id: resource?.id,
      new_start_date: modalData.startDate,
      new_end_date: modalData.endDate,
      duration: `${dayCount} Nights`,
      adult_count: formData.adults || '1',
      child_count: formData.children || '0',
      room_count: '1',
      title: formData.title || '',
      rate: formData.totalPrice || '',
      first_name: formData.guestName || '',
      phone: formData.phone || '',
      email: formData.email || '',
      account_name: formData.account || '',
      total_amount: formData.totalPrice || '',
      total_vat: formData.tax || '',
      hold_till_date: formData.holdBookingTill?.split('T')[0] || '',
      hold_till_time: formData.holdBookingTill?.split('T')[1]?.substring(0, 5) || '',
      enquiry_app_id: formData.enquiryAppId || '',
      total_commission: formData.commission || '0',
      dnr_type: formData.dnrReason || '',
      dnr_reason: formData.dnrNotes || '',
      dnr_close_calendar: 'yes',
      reservation_type: reservationType,
      new_entry: 'Save'
    }

    try {
      let response
      if (formData.bookingType === 'book') {
        response = await createReservation(payload)
      } else if (formData.bookingType === 'hold') {
        response = await createHold(payload)
      } else if (formData.bookingType === 'block') {
        response = await createBlock(payload)
      }
      
      console.log('Booking created successfully:', response?.data)
      
      onConfirm({
        ...(booking || {}),
        resourceId: modalData.resourceId,
        startDate: modalData.startDate,
        endDate: modalData.endDate,
        text: formData.bookingName,
        ...formData
      })
      onClose()
    } catch (error) {
      console.error('Failed to create booking:', error)
      // TODO: Show error message to user
    }
  }
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {console.log('Resource in Modal:', resource)}
            {resource?.name} - Add Reservation
          </h2>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">

          {/* Dynamic Form Based on Booking Type */}
          {formData.bookingType === 'book' && (
            <BookForm formData={formData} handleChange={handleChange} dayCount={dayCount} setFormData={setFormData}/>
          )}
          {formData.bookingType === 'hold' && (
            <HoldForm formData={formData} handleChange={handleChange} dayCount={dayCount} setFormData={setFormData}/>
          )}
          {formData.bookingType === 'block' && (
            <BlockForm formData={formData} handleChange={handleChange} dayCount={dayCount} setFormData={setFormData}/>
          )}

          {/* Booking Type Section - At Top */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">Booking Type</label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  value="book"
                  checked={formData.bookingType === 'book'}
                  onChange={(e) => handleChange('bookingType', e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Book</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  value="hold"
                  checked={formData.bookingType === 'hold'}
                  onChange={(e) => handleChange('bookingType', e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Hold</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  value="block"
                  checked={formData.bookingType === 'block'}
                  onChange={(e) => handleChange('bookingType', e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Block</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-start gap-3">
            <button
              onClick={handleConfirm}
              className="px-6 py-2 text-white bg-red-500 rounded-md hover:bg-red-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBookingModal
