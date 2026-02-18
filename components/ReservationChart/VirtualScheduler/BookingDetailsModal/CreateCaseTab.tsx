'use client'

import { useState } from 'react'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingLabelInput from '@/components/common/FloatingLabelInput'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { REASON_LIST_FOR_CASE_TAB, SUB_REASON_LIST_FOR_CASE_TAB, ORIGIN_LIST_FOR_CASE_TAB, PRIORITY_LIST_FOR_CREATE_TASK, ASSIGN_CASE_TO_LIST } from '@/constants/constant'

interface CreateCaseTabProps {
  apartmentName?: string
}

const CreateCaseTab = ({ apartmentName = 'Apartment 101' }: CreateCaseTabProps) => {
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

  const handleCreateCase = () => {
    const payload = {
      ...formData,
      apartmentName
    }
    console.log('Create case payload:', payload)
    // TODO: Call API
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
          onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingDropdown 
          label="Reason" 
          options={REASON_LIST_FOR_CASE_TAB}
          value={formData.reason}
          onChange={(value) => setFormData({ ...formData, reason: value })}
          required
        />
        <FloatingDropdown 
          label="Sub Reason" 
          options={SUB_REASON_LIST_FOR_CASE_TAB}
          value={formData.subReason}
          onChange={(value) => setFormData({ ...formData, subReason: value })}
          required
        />
        <FloatingDropdown 
          label="Origin" 
          options={ORIGIN_LIST_FOR_CASE_TAB}
          value={formData.origin}
          onChange={(value) => setFormData({ ...formData, origin: value })}
          required
        />
        <FloatingDropdown 
          label="Priority" 
          options={PRIORITY_LIST_FOR_CREATE_TASK}
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value })}
          required
        />
        <FloatingDropdown 
          label="Assign Case To" 
          options={ASSIGN_CASE_TO_LIST}
          value={formData.assignTo}
          onChange={(value) => setFormData({ ...formData, assignTo: value })}
          required
        />
        <FloatingLabelInput 
          label="Attach Image" 
          type="file" 
          placeholder="" 
          onChange={handleImageChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type *</label>
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
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
