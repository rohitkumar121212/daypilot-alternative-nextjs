import { useState, useEffect } from 'react'

interface FormData {
  bookingName: string
  title: string
  guestName: string
  email: string
  phone: string
  adults: string
  children: string
  checkIn: string
  checkOut: string
  totalPrice: string
  account: string
  accountLabel: string
  tax: string
  taxLabel: string
  idNumber: string
  nationality: string
  commission: string
  dnrReason: string
  enquiryAppId: string
  holdBookingTill: string
  status: string
  dnrNotes: string
  bookingType: string
  sendInstantMail: boolean
}

const initialFormData: FormData = {
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
  accountLabel: '',
  tax: '',
  taxLabel: '',
  idNumber: '',
  nationality: '',
  commission: '',
  dnrReason: '',
  enquiryAppId: '',
  holdBookingTill: '',
  status: '',
  dnrNotes: '',
  bookingType: 'block',
  sendInstantMail: false
}

export const useBookingForm = (isOpen: boolean, booking: any, modalData: any) => {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState({})

  const isEditing = !!booking

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
        accountLabel: booking.accountLabel || '',
        tax: booking.tax || '',
        taxLabel: booking.taxLabel || '',
        idNumber: booking.idNumber || '',
        nationality: booking.nationality || '',
        commission: booking.commission || '',
        dnrReason: booking.dnrReason || '',
        enquiryAppId: booking.enquiryAppId || '',
        holdBookingTill: booking.holdBookingTill || '',
        status: booking.status || '',
        dnrNotes: booking.dnrNotes || '',
        bookingType: booking.bookingType || 'book',
        sendInstantMail: booking.sendInstantMail || false
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
        accountLabel: '',
        tax: '',
        taxLabel: '',
        idNumber: '',
        nationality: '',
        commission: '',
        dnrReason: '',
        enquiryAppId: '',
        holdBookingTill: '',
        status: '',
        dnrNotes: '',
        bookingType: 'book',
        sendInstantMail: false
      })
    }
  }, [isOpen, booking, modalData])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    // Validate based on booking type
    if (formData.bookingType === 'block') {
      if (!formData.dnrReason) newErrors.dnrReason = 'Reason is required'
      if (!formData.dnrNotes) newErrors.dnrNotes = 'Notes are required'
    } else if (formData.bookingType === 'hold') {
      if (!formData.checkIn) newErrors.checkIn = 'Check-in is required'
      if (!formData.checkOut) newErrors.checkOut = 'Check-out is required'
      if (!formData.holdBookingTill) newErrors.holdBookingTill = 'Hold booking till is required'
    } else if (formData.bookingType === 'book') {
      if (!formData.checkIn) newErrors.checkIn = 'Check-in is required'
      if (!formData.checkOut) newErrors.checkOut = 'Check-out is required'
      if (!formData.guestName) newErrors.guestName = 'Name is required'
      if (!formData.phone) newErrors.phone = 'Phone is required'
      if (!formData.totalPrice) newErrors.totalPrice = 'Rent per night is required'
      if (!formData.commission) newErrors.commission = 'Commission is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return {
    formData,
    errors,
    setFormData,
    setErrors,
    handleChange,
    validateForm,
    isEditing
  }
}