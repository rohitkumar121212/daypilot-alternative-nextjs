import React, { useState, useEffect } from 'react'
import { daysBetween } from '@/utils/dateUtils'
import guestsData from '@/mocks/data/guests-data.json'
import { TITLES } from '@/constants/constant'

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
    paidAmount: '',
    status: '',
    notes: '',
    bookingType: 'book'
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredGuests, setFilteredGuests] = useState([])
  
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
        paidAmount: booking.paidAmount || '',
        status: booking.status || '',
        notes: booking.notes || ''
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
        paidAmount: '',
        status: '',
        notes: '',
        bookingType: 'book'
      })
    }
  }, [isOpen, booking, modalData])
  
  if (!isOpen || !modalData || !resource) return null
  
  const dayCount = daysBetween(modalData.startDate, modalData.endDate)
  
  const handleConfirm = () => {
    if (formData.bookingName.trim()) {
      onConfirm({
        ...(booking || {}),
        resourceId: modalData.resourceId,
        startDate: modalData.startDate,
        endDate: modalData.endDate,
        text: formData.bookingName,
        ...formData
      })
      onClose()
    }
  }
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  console.log("guest data--- ", guestsData)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'guestName') {
      if (value.trim()) {
        const filtered = guestsData.guest_list.filter(guest => 
          guest.guest_name.toLowerCase().includes(value.toLowerCase())
        )
        console.log('Filtered guests:', filtered.length)
        setFilteredGuests(filtered || [])
        setShowSuggestions(filtered.length > 0)
      } else {
        setShowSuggestions(false)
        setFilteredGuests([])
      }
    }
  }

  const handleSelectGuest = (guest) => {
    setFormData(prev => ({
      ...prev,
      guestName: guest.guest_name,
      email: guest.guest_email !== 'None' ? guest.guest_email : '',
      phone: guest.guest_contact !== 'None' ? guest.guest_contact : ''
    }))
    setShowSuggestions(false)
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
            {/* {isEditing ? 'Edit Booking' : 'Create Booking'} */}
            {resource?.name} - Add Reservation
          </h2>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          {/* Resource and Date Info */}
          {/* <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                <div className="text-gray-900 font-medium">{resource.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="text-gray-900">
                  {modalData.startDate} to {modalData.endDate}
                  <span className="text-gray-500 ml-2">({dayCount} {dayCount === 1 ? 'day' : 'days'})</span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleChange('checkIn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleChange('checkOut', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
              <input
                type="number"
                value={dayCount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.bookingName}
                onChange={(e) => handleChange('bookingName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter booking name"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <select
                value={formData.adults}
                onChange={(e) => handleChange('adults', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <select
                value={formData.children}
                onChange={(e) => handleChange('children', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">0</option>
                {[...Array(5)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <select
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select title</option>
                {Object.values(TITLES).map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.guestName}
                onChange={(e) => handleChange('guestName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter guest name"
                autoComplete="off"
              />
              {showSuggestions && filteredGuests.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredGuests.map((guest, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectGuest(guest)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{guest.guest_name}</div>
                      <div className="text-sm text-gray-500">
                        {guest.guest_email !== 'None' && guest.guest_email !== '' && guest.guest_email} {guest.guest_email !== 'None' && guest.guest_email !== '' && guest.guest_contact !== 'None' && guest.guest_contact !== '' && '•'} {guest.guest_contact !== 'None' && guest.guest_contact !== '' && guest.guest_contact}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone"
              />
            </div>

            

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
              <input
                type="number"
                value={formData.totalPrice}
                onChange={(e) => handleChange('totalPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter total price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => handleChange('paidAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter paid amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>

          {/* Booking Type Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">Booking Type</label>
            <div className="flex gap-6">
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBookingModal

