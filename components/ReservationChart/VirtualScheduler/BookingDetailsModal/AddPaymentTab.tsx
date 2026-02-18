'use client'

import { useState } from 'react'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { PAYMENT_METHODS_LIST } from '@/constants/constant'

interface AddPaymentTabProps {
  acceptedBy?: string
}

const AddPaymentTab = ({ acceptedBy = 'John Doe' }: AddPaymentTabProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    referenceNo: '',
    receipt: null as File | null,
    notes: ''
  })

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      acceptedBy
    }
    console.log('Payment payload:', payload)
    // TODO: Call API with payload
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
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
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
        <FloatingDropdown 
          label="Payment Method" 
          options={PAYMENT_METHODS_LIST}
          value={formData.paymentMethod}
          onChange={(value) => setFormData({ ...formData, paymentMethod: value })}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingInput 
          label="Reference No." 
          value={formData.referenceNo}
          onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
        />
        <FloatingInput 
          label="Accepted By" 
          value={acceptedBy} 
          onChange={() => {}}
          readOnly 
        />
      </div>
      <FloatingInput 
        label="Receipt" 
        type="file" 
        onChange={handleFileChange}
      />
      <FloatingLabelTextarea 
        label="Notes" 
        rows={3} 
        required={true}
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      <div className="flex gap-2">
        <button 
          onClick={handleSubmit}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Add Payment
        </button>
        <button className="border border-gray-300 text-red-500 px-4 py-2 rounded hover:bg-gray-50">Close</button>
      </div>
    </div>
  )
}

export default AddPaymentTab
