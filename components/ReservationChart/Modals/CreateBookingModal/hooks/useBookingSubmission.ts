import { useState } from 'react'
import { buildBookingPayload } from '../utils/payloadBuilder'
import { fetchUtils } from '@/utils/fetchUtils'

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
      const { data } = await fetchUtils.post('/api/proxy/add-reservation', payload)
      console.log('Booking created successfully:', data)
      
      if (data.success) {
        const bookingId = data.data?.reservation_id
        if (bookingId) {
          // window.location.href = `/aperfect-pms/booking/${bookingId}/view-details`
          window.location.href = `https://aperfectstay.ai/aperfect-pms/booking/${data.data?.reservation_id}/view-details`

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