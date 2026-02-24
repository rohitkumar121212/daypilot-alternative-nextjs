'use client'

import { useState } from 'react'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { REASON_LIST_FOR_CASE_TAB, SUB_REASON_LIST_FOR_CASE_TAB, ORIGIN_LIST_FOR_CASE_TAB, PRIORITY_LIST_FOR_CREATE_TASK, ASSIGN_CASE_TO_LIST } from '@/constants/constant'
import { createTask } from '@/apiData/services/pms/bookings'

interface CreateCaseTabProps {
  apartmentName?: string
  bookingId?: string
  propertyId?: string
  guestId?: string
}

const CreateCaseTab = ({ apartmentName = 'Apartment 101', bookingId = '', propertyId = '', guestId = '' }: CreateCaseTabProps) => {
  const [formData, setFormData] = useState({
    caseTitle: '',
    issueType: 'guest',
    reason: '',
    subReason: '',
    origin: '',
    priority: '',
    assignTo: '',
    image: null as File | null,
    description: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCreateCase = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.caseTitle.trim()) newErrors.caseTitle = 'Case title is required'
    if (!formData.reason) newErrors.reason = 'Reason is required'
    if (!formData.subReason) newErrors.subReason = 'Sub reason is required'
    if (!formData.origin) newErrors.origin = 'Origin is required'
    if (!formData.priority) newErrors.priority = 'Priority is required'
    if (!formData.assignTo) newErrors.assignTo = 'Assign case to is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    const payload = {
      curr_apartment_case2: apartmentName,
      title: formData.caseTitle,
      source: formData.origin,
      priority: formData.priority,
      due_date: new Date().toISOString().split('T')[0],
      name: formData.assignTo,
      phone: '',
      email: '',
      booking: bookingId,
      prop: propertyId,
      guest: guestId,
      account: '',
      description: formData.description,
      save: 'Create Task'
    }

    try {
      const response = await createTask(payload)
      console.log('Task created successfully:', response.data)
      // TODO: Show success message and reset form
    } catch (error) {
      console.error('Failed to create task:', error)
      // TODO: Show error message
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingInput 
          label="Apartment Name" 
          value={apartmentName} 
          onChange={() => {}}
          readOnly 
        />
        <FloatingInput
          label="Case Title"
          value={formData.caseTitle}
          onChange={(e) => {
            setFormData({ ...formData, caseTitle: e.target.value })
            if (errors.caseTitle) setErrors({ ...errors, caseTitle: '' })
          }}
          error={errors.caseTitle}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingDropdown 
          label="Reason" 
          options={REASON_LIST_FOR_CASE_TAB}
          value={formData.reason}
          onChange={(value) => {
            setFormData({ ...formData, reason: value })
            if (errors.reason) setErrors({ ...errors, reason: '' })
          }}
          error={errors.reason}
          required
        />
        <FloatingDropdown 
          label="Sub Reason" 
          options={SUB_REASON_LIST_FOR_CASE_TAB}
          value={formData.subReason}
          onChange={(value) => {
            setFormData({ ...formData, subReason: value })
            if (errors.subReason) setErrors({ ...errors, subReason: '' })
          }}
          error={errors.subReason}
          required
        />
        <FloatingDropdown 
          label="Origin" 
          options={ORIGIN_LIST_FOR_CASE_TAB}
          value={formData.origin}
          onChange={(value) => {
            setFormData({ ...formData, origin: value })
            if (errors.origin) setErrors({ ...errors, origin: '' })
          }}
          error={errors.origin}
          required
        />
        <FloatingDropdown 
          label="Priority" 
          options={PRIORITY_LIST_FOR_CREATE_TASK}
          value={formData.priority}
          onChange={(value) => {
            setFormData({ ...formData, priority: value })
            if (errors.priority) setErrors({ ...errors, priority: '' })
          }}
          error={errors.priority}
          required
        />
        <FloatingDropdown 
          label="Assign Case To" 
          options={ASSIGN_CASE_TO_LIST}
          value={formData.assignTo}
          onChange={(value) => {
            setFormData({ ...formData, assignTo: value })
            if (errors.assignTo) setErrors({ ...errors, assignTo: '' })
          }}
          error={errors.assignTo}
          required
        />
        <FloatingInput 
          label="Attach Image" 
          type="file" 
          onChange={handleImageChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="issueType"
              value="guest"
              checked={formData.issueType === 'guest'}
              onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Guest related issue (case will be associated with booking)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="issueType"
              value="apartment"
              checked={formData.issueType === 'apartment'}
              onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Apartment related issue (case will be associated with apartment)</span>
          </label>
        </div>
      </div>
      <FloatingLabelTextarea 
        label="Description" 
        rows={3} 
        value={formData.description}
        required={true}
        onChange={(e) => {
          setFormData({ ...formData, description: e.target.value })
          if (errors.description) setErrors({ ...errors, description: '' })
        }}
        error={errors.description}
      />
      <div className="flex gap-2">
        <button 
          onClick={handleCreateCase}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Create Case
        </button>
        <button className="border border-gray-300 text-red-500 px-4 py-2 rounded hover:bg-gray-50">Close</button>
      </div>
    </div>
  )
}

export default CreateCaseTab
