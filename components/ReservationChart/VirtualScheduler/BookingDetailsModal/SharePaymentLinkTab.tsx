'use client'

import { useState } from 'react'
import FloatingLabelInput from '@/components/common/FloatingLabelInput'
import FloatingLabelInputWithPrefix from '@/components/common/FloatingLabelInputWithPrefix'
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

  const handleSendLink = () => {
    console.log('Send payment link:', formData)
    // TODO: Call API
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingLabelInput 
          label="Total Amount" 
          value={`${CURRENCY} ${totalAmount}`} 
          readOnly 
        />
        <FloatingLabelInput 
          label="Paid" 
          value={`${CURRENCY} ${paid}`} 
          readOnly 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingLabelInput 
          label="Balance" 
          value={`${CURRENCY} ${balance}`} 
          readOnly 
        />
        <FloatingLabelInputWithPrefix 
          label="Payment Amount" 
          prefix={CURRENCY}
          type="number" 
          placeholder=" " 
          value={formData.paymentAmount}
          onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
        />
      </div>
      <FloatingLabelInput 
        label="Email" 
        type="email" 
        placeholder=" " 
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
