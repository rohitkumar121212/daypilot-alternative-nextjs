import { useState } from 'react'
import { buildBookingPayload } from '../utils/payloadBuilder'

export const useBookingSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitBooking = async (
    formData: any, 
    resource: any, 
    modalData: any, 
    booking: any, 
    onConfirm: Function, 
    onClose: Function
  ) => {
    const payload = buildBookingPayload(formData, resource, modalData)

    console.log('Prepared payload for booking creation:', payload)
    
    try {
      setIsSubmitting(true)
      const isDevelopment = process.env.NODE_ENV === 'development'
      const url = isDevelopment
        ? '/api/proxy/add-reservation'
        : 'https://aperfectstay.ai/api/aperfect-pms/add-new-reservation'
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Booking created successfully:', data)
      
      if (data.success) {
        const bookingId = data.data?.reservation_id
        if (bookingId) {
          window.location.href = `/aperfect-pms/booking/${bookingId}/view-details`
        } else {
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
      } else {
        alert(data.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Failed to create booking:', error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submitBooking,
    isSubmitting
  }
}