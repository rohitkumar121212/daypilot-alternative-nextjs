'use client'

import { useState } from 'react'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingInputWithPrefix from '@/components/common/FloatingLabelInputWithPrefix'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { proxyFetch } from '@/utils/proxyFetch'
import { createFormData, logFormData } from '@/utils/formDataUtils'
import LoadingOverlay from '@/components/ReservationChart/Modals/CreateBookingModal/components/LoadingOverlay'
import { useUser } from '@/contexts/UserContext'

interface SharePaymentLinkTabProps {
  totalAmount?: number
  bookingKey?: string
  paidAmount: number
  paid?: number
  email?: string
  bookingId?: string | number
  onClose: () => void
}

const SharePaymentLinkTab = ({ 
  totalAmount = 0.00, 
  paidAmount,
  paid = 0.000,
  email = 'guest@example.com',
  bookingId,
  bookingKey,
  onClose
}: SharePaymentLinkTabProps) => {
  // const CURRENCY = '₹'
  console.log("totalAmount, paid, email, bookingId--", totalAmount, paid, email, bookingId)
  const balance = totalAmount - paid
  console.log("balance--", balance)
  const { user } = useUser()
  const CURRENCY = user?.admin_details?.selected_currency || 'GDP'

  const [formData, setFormData] = useState({
    paymentAmount: '',
    email: email,
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSendLink = async() => {
    const newErrors: Record<string, string> = {}

    if (!formData.paymentAmount.trim()) newErrors.paymentAmount = 'Payment amount is required'
    else if (parseFloat(formData.paymentAmount) <= 0) newErrors.paymentAmount = 'Payment amount must be greater than 0'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    console.log('Send payment link:', formData)
    
    try {
      // Prepare the data for FormData
      const paymentLinkData = {
        enq_id_payment: '',
        payment_booking_id: bookingId,
        total_booking_amount: totalAmount.toString(),
        booking_amount_paid: paidAmount.toString(),  
        booking_amount_balance: balance.toString(),
        payment_amount: formData.paymentAmount,
        send_email: formData.email,
        payment_notes: formData.notes,
        send_payment_link: 'Send Payment Link',
        // bookingId: bookingId,
        // amount: formData.paymentAmount,
        // email: formData.email,
        // notes: formData.notes,
        // response_version: 'v1'
      }

      // Create FormData using the utility function
      const formDataPayload = createFormData(paymentLinkData, {
        excludeEmpty: false, // Keep empty strings if needed by API
        excludeNull: true,   // Remove null values
        excludeUndefined: true // Remove undefined values
      })

      // Log FormData for debugging (can be removed in production)
      logFormData(formDataPayload, 'Share Payment Link FormData')

      const response = await proxyFetch('/api/aperfect-pms/share-payment-link', {
        method: 'POST',
        body: formDataPayload // Send FormData directly
      })
      
      console.log('Payment link sent successfully:', response)
    } catch(error){
      console.error('Failed to send payment link:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 relative h-full">
      <LoadingOverlay isLoading={isLoading} />
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
      <div className="flex gap-3">
        <button 
          onClick={handleSendLink}
          className="btn btn-primary-with-bg"
        >
          Send Payment Link
        </button>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default SharePaymentLinkTab
