'use client'

import { useState } from 'react'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingInputWithPrefix from '@/components/common/FloatingLabelInputWithPrefix'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'

interface SharePaymentLinkTabProps {
  totalAmount?: number
  paid?: number
  email?: string
}

const SharePaymentLinkTab = ({ 
  totalAmount = 10000, 
  paid = 5000,
  email = 'guest@example.com'
}: SharePaymentLinkTabProps) => {
  const CURRENCY = '₹'
  const balance = totalAmount - paid

  const [formData, setFormData] = useState({
    paymentAmount: '',
    email: email,
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSendLink = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.paymentAmount.trim()) newErrors.paymentAmount = 'Payment amount is required'
    else if (parseFloat(formData.paymentAmount) <= 0) newErrors.paymentAmount = 'Payment amount must be greater than 0'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    console.log('Send payment link:', formData)
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
          value={`${CURRENCY} ${paid}`} 
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
