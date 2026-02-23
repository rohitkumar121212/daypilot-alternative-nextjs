'use client'

import { useState } from 'react'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingInputWithPrefix from '@/components/common/FloatingLabelInputWithPrefix'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { sharePaymentLink } from '@/apiData/services/pms/booking-details-tabs'

interface SharePaymentLinkTabProps {
  totalAmount?: number
  paidAmount: number
  paid?: number
  email?: string
  bookingId?: string | number
}

const SharePaymentLinkTab = ({ 
  totalAmount = 0.00, 
  paidAmount,
  paid = 0.000,
  email = 'guest@example.com',
  bookingId
}: SharePaymentLinkTabProps) => {
  const CURRENCY = '₹'
  console.log("totalAmount, paid, email, bookingId--", totalAmount, paid, email, bookingId)
  const balance = totalAmount - paid
  console.log("balance--", balance)

  const [formData, setFormData] = useState({
    paymentAmount: '',
    email: email,
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSendLink = async() => {
    const newErrors: Record<string, string> = {}

    if (!formData.paymentAmount.trim()) newErrors.paymentAmount = 'Payment amount is required'
    else if (parseFloat(formData.paymentAmount) <= 0) newErrors.paymentAmount = 'Payment amount must be greater than 0'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    console.log('Send payment link:', formData)
    try{
      const response = await sharePaymentLink({
        enq_id_payment: '328748324',
        payment_booking_id: bookingId,
        total_booking_amount: totalAmount.toString(),
        booking_amount_paid: paidAmount.toString(),  
        booking_amount_balance: balance.toString(),
        payment_amount: parseFloat(formData.paymentAmount),
        send_email: formData.email,
        payment_notes: formData.notes,
        send_payment_link: 'Send Payment Link',

        bookingId: bookingId, // Use the actual booking ID passed in props
        amount: parseFloat(formData.paymentAmount),
        email: formData.email,
        notes: formData.notes
      })
      console.log('Payment link sent successfully:', response.data)
    } catch(error){
      console.error('Failed to send payment link:', error)
    }
    // TODO: Call API
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingInput 
          label="Total Amount" 
          value={`${CURRENCY} ${totalAmount}`} 
          onChange={() => {}}
          readOnly 
        />
        <FloatingInput 
          label="Paid" 
          value={`${CURRENCY} ${paidAmount}`} 
          onChange={() => {}}
          readOnly 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingInput 
          label="Balance" 
          value={`${CURRENCY} ${balance}`} 
          onChange={() => {}}
          readOnly 
        />
        <FloatingInputWithPrefix 
          label="Payment Amount" 
          prefix={CURRENCY}
          type="number" 
          value={formData.paymentAmount}
          onChange={(e) => {
            setFormData({ ...formData, paymentAmount: e.target.value })
            if (errors.paymentAmount) setErrors({ ...errors, paymentAmount: '' })
          }}
          error={errors.paymentAmount}
          required
        />
      </div>
      <FloatingInput 
        label="Email" 
        type="email"
        value={formData.email}
        onChange={(e) => {
          setFormData({ ...formData, email: e.target.value })
          if (errors.email) setErrors({ ...errors, email: '' })
        }}
        error={errors.email}
        required
      />
      <FloatingLabelTextarea 
        label="Notes" 
        rows={3} 
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      <div className="flex gap-2">
        <button 
          onClick={handleSendLink}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Send Payment Link
        </button>
        <button className="border border-gray-300 text-red-500 px-4 py-2 rounded hover:bg-gray-50">Close</button>
      </div>
    </div>
  )
}

export default SharePaymentLinkTab
