'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import LoadingOverlay from '@/components/ReservationChart/Modals/CreateBookingModal/components/LoadingOverlay'

interface CreateCaseTabProps {
  reservationConstants: any,
  bookingDetails?: any,
  assignToUsers?: any[]
  onClose: () => void
}

const CreateCaseTab = ({ reservationConstants, bookingDetails, assignToUsers, onClose }: CreateCaseTabProps) => {
  const [formData, setFormData] = useState({

    caseTitle: '',
    issueType: 'guest',
    reason: '',
    subReason: '',
    origin: '',
    priority: '',
    assignTo: '',
    image: null as File | null,
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleCreateCase = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.caseTitle.trim()) newErrors.caseTitle = 'Case title is required'
    if (!formData.reason) newErrors.reason = 'Reason is required'
    if (!formData.subReason) newErrors.subReason = 'Sub reason is required'
    if (!formData.origin) newErrors.origin = 'Origin is required'
    if (!formData.priority) newErrors.priority = 'Priority is required'
    // if (!formData.assignTo) newErrors.assignTo = 'Assign case to is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)

    const formPayload = new FormData()
    formPayload.append('response_version', 'v1')
    formPayload.append('SelectedIssueType1', 'guest_and_booking')
    formPayload.append('curr_apartment_case2', bookingDetails?.apartment || '')
    formPayload.append('title', formData.caseTitle)
    formPayload.append('reason', formData.reason)
    formPayload.append('sub_reason', formData.subReason)
    formPayload.append('origin', formData.origin)
    formPayload.append('priority', formData.priority)
    formPayload.append('booking', bookingDetails?.booking_key || '')
    formPayload.append('prop', bookingDetails?.apartment_id || '')
    formPayload.append('guest', bookingDetails?.guest_key || '')
    formPayload.append('account', '')
    formPayload.append('user_id_unassigned', formData.assignTo || '')
    // formPayload.append('user_id_unassigned', '557982301238062')
    formPayload.append('description', formData.description)
    // formPayload.append('save', 'Create Task')
    if (formData.image) formPayload.append('images', formData.image)
    console.log('Form payload:', Object.fromEntries(formPayload.entries()))
    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const url = isDevelopment
        ? '/api/proxy/create-case'
        : 'https://aperfectstay.ai/api/aperfect10/pms/create-new-case'
      
      const response = await fetch(url, {
        method: 'POST',
        body: formPayload,
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Case created successfully:', data)
      
      if (data.success) {
        const bookingId = data.data?.reservation_id
        if (bookingId) {
          router.push(`/aperfect-pms/booking/${bookingId}/view-details`)
          // window.location.href = `/aperfect-pms/booking/${bookingId}/view-details`
          // window.location.href = `https://aperfectstay.ai/aperfect-pms/booking/${bookingDetails?.booking_key}/view-details`
        } else {
          // onConfirm({
          //   ...(booking || {}),
          //   resourceId: modalData.resourceId,
          //   startDate: modalData.startDate,
          //   endDate: modalData.endDate,
          //   text: formData.bookingName,
          //   ...formData
          // })
          onClose()
        }
      } else {
        alert(data.error || 'Failed to create case')
      }
    } catch (error) {
      console.error('Failed to create case:', error)
      alert('Failed to create case')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] })
    }
  }
  
  return (
    <div className="space-y-4 relative h-full">
      <LoadingOverlay isLoading={isLoading} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingInput 
          label="Apartment Name" 
          value={bookingDetails?.apartment} 
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
          options={reservationConstants?.reasonListForCaseTab}
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
          options={reservationConstants?.subReasonListForCaseTab}
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
          options={reservationConstants?.originListForCaseTab}
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
          options={reservationConstants?.priorityList}
          value={formData.priority}
          onChange={(value) => {
            setFormData({ ...formData, priority: value })
            if (errors.priority) setErrors({ ...errors, priority: '' })
          }}
          error={errors.priority}
          required
        />
        {
          assignToUsers && assignToUsers.length > 0 && (<FloatingDropdown 
          label="Assign Case To" 
          options={assignToUsers}
          value={formData.assignTo}
          onChange={(value) => {
            setFormData({ ...formData, assignTo: value })
            if (errors.assignTo) setErrors({ ...errors, assignTo: '' })
          }}
          error={errors.assignTo}
          // required
        />)
        }
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
      <div className="flex gap-3">
        <button 
          onClick={handleCreateCase}
          className="btn btn-primary-with-bg"
        >
          Create Case
        </button>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default CreateCaseTab
