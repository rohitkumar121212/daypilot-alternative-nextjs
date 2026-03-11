'use client'

import { useState } from 'react'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { PAYMENT_METHODS_LIST } from '@/constants/constant'
import { createAddPayment } from '@/apiData/services/pms/bookings'

interface AddPaymentTabProps {
  bookingId: Number | string | null
  onClose?: () => void
  reservationConstants: any
  bookingDetails: any
}

const AddPaymentTab = ({ bookingId, onClose, reservationConstants, bookingDetails }: AddPaymentTabProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    referenceNo: '',
    receipt: null as File | null,
    notes: '',
    response_version: 'v1',
    acceptedBy: bookingDetails?.booked_by || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})


  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    console.log("booking_key--", bookingId)
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required'
    else if (parseFloat(formData.amount) < 0) newErrors.amount = 'Amount cannot be negative'
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required'
    if (!formData?.acceptedBy?.trim()) newErrors.acceptedBy = 'Accepted by is required'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    // const payload = new FormData()
    // payload.append('amount', formData.amount)
    // payload.append('mode', formData.paymentMethod)
    // payload.append('refernce', formData.referenceNo)
    // payload.append('accepted_by', formData.acceptedBy)
    // payload.append('notes', formData.notes)
    // payload.append('enq_id_payment', bookingId?.toString() || '') // TODO: Replace with actual booking ID
    // if (formData.receipt) payload.append('receipt_img', formData.receipt)

    // try {
    //   const response = await addNewBookingPayment(payload)
    //   console.log('Payment added successfully:', response.data)
    //   // TODO: Show success message and reset form
    // } catch (error) {
    //   console.error('Failed to add payment:', error)
    //   // TODO: Show error message
    // }
    const formPayload = new FormData()
    formPayload.append('enq_id_payment', bookingDetails?.booking_key || '')
    formPayload.append('amount', formData.amount)
    formPayload.append('mode', formData.paymentMethod)
    formPayload.append('refernce', formData.referenceNo)
    formPayload.append('accepted_by', formData.acceptedBy)
    formPayload.append('notes', formData.notes)
    formPayload.append('payment_method', 'Add Payment')
    formPayload.append('response_version', 'v1')
    if (formData.receipt) formPayload.append('receipt_img', formData.receipt)
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const url = isDevelopment
        ? '/api/proxy/add-payment'
        : 'https://aperfectstay.ai/api/aperfect-pms/add-new-booking-payment'
      
      const response = await fetch(url, {
        method: 'POST',
        body: formPayload,
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Payment added successfully:', data)
      
      if (data.success) {
        alert('Payment added successfully!')
        onClose?.()
      } else {
        alert(data.error || 'Failed to add payment')
      }
    } catch (error) {
      console.error('Failed to add payment:', error)
      alert('Failed to add payment')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log('Selected file:', e.target.files[0])
      setFormData({ ...formData, receipt: e.target.files[0] })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingInput 
          label="Amount" 
          type="number"
          value={formData.amount}
          onChange={(e) => {
            setFormData({ ...formData, amount: e.target.value })
            if (errors.amount) setErrors({ ...errors, amount: '' })
          }}
          error={errors.amount}
          required
        />
        <FloatingDropdown 
          label="Payment Method" 
          options={reservationConstants?.paymentMethods}
          value={formData.paymentMethod}
          onChange={(value) => {
            setFormData({ ...formData, paymentMethod: value })
            if (errors.paymentMethod) setErrors({ ...errors, paymentMethod: '' })
          }}
          error={errors.paymentMethod}
          required
        />
        <FloatingInput 
          label="Reference No." 
          value={formData.referenceNo}
          onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
        />
        <FloatingInput 
          label="Accepted By" 
          value={formData.acceptedBy} 
          onChange={() => {}}
          error={errors.acceptedBy}
          readOnly 
          required
        />
        <FloatingInput 
        label="Receipt" 
        type="file" 
        onChange={handleFileChange}
      />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <FloatingLabelTextarea 
        label="Notes" 
        rows={3} 
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleSubmit}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Add Payment
        </button>
        <button onClick={onClose} className="border border-gray-300 text-red-500 px-4 py-2 rounded hover:bg-gray-50">Close</button>
      </div>
    </div>
  )
}

export default AddPaymentTab
