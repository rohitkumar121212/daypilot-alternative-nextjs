'use client'

import { useState } from 'react'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import LoadingOverlay from '@/components/ReservationChart/Modals/CreateBookingModal/components/LoadingOverlay'

interface CreateTaskTabProps {
  bookingDetails?: any,
  reservationConstants?: any
  onClose: ()=> void
}

const CreateTaskTab = ({ bookingDetails, reservationConstants, onClose }: CreateTaskTabProps) => {
  const [formData, setFormData] = useState({
    apartmentName: bookingDetails?.apartment || '',
    taskTitle: '',
    source: '',
    priority: '',
    dueDate: '',
    assignedTo: '',
    sourceName: '',
    sourceEmail: '',
    sourcePhone: '',
    image: null as File | null,
    description: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateTask = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.taskTitle.trim()) newErrors.taskTitle = 'Task title is required'
    if (!formData.source) newErrors.source = 'Source is required'
    if (!formData.priority) newErrors.priority = 'Priority is required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)

    const formPayload = new FormData()
    formPayload.append('curr_apartment_case2', formData.apartmentName || '')
    formPayload.append('title', formData.taskTitle)
    formPayload.append('source', formData.source)
    formPayload.append('priority', formData.priority)
    formPayload.append('due_date', formData.dueDate)
    formPayload.append('name', formData.sourceName)
    formPayload.append('email', formData.sourceEmail)
    formPayload.append('phone', formData.sourcePhone)
    formPayload.append('description', formData.description)
    formPayload.append('booking', bookingDetails?.booking_key || '')
    formPayload.append('prop', bookingDetails?.apartment_id || '')
    formPayload.append('guest', bookingDetails?.guest_key || '')
    formPayload.append('save', 'Create Task')
    formPayload.append('response_version', 'v1')
    if (formData.image) formPayload.append('images', formData.image)
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const url = isDevelopment
        ? '/api/proxy/create-task'
        : 'https://aperfectstay.ai/api/aperfect10/pms/create-new-task'
      
      const response = await fetch(url, {
        method: 'POST',
        body: formPayload,
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Task created successfully:', data)
      
      // if (data.success) {
      //   alert('Task created successfully!')
      // } else {
      //   alert(data.error || 'Failed to create task')
      // }
      if (data.success) {
        const bookingId = data.data?.reservation_id
        if (bookingId) {
          window.location.href = `/aperfect-pms/booking/${bookingId}/view-details`
          // window.location.href = `https://aperfectstay.ai/aperfect-pms/booking/${booking?.booking_details?.booking_key}/view-details`

        } else {
          // onConfirm({
          //   ...(booking || {}),
          //   resourceId: modalData.resourceId,
          //   startDate: modalData.startDate,
          //   endDate: modalData.endDate,
          //   text: formData.bookingName,
          //   ...formData
          // })
          // onClose()
        }
      } else {
        alert(data.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      alert('Failed to create task')
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <FloatingInput 
          label="Apartment Name" 
          value={formData?.apartmentName} 
          onChange={() => {}}
          readOnly 
        />
        <FloatingInput 
          label="Task Title" 
          value={formData.taskTitle}
          onChange={(e) => {
            setFormData({ ...formData, taskTitle: e.target.value })
            if (errors.taskTitle) setErrors({ ...errors, taskTitle: '' })
          }}
          error={errors.taskTitle}
          required
        />
        <FloatingDropdown 
          label="Source" 
          options={reservationConstants?.sourceList}
          value={formData.source}
          onChange={(value) => {
            setFormData({ ...formData, source: value })
            if (errors.source) setErrors({ ...errors, source: '' })
          }}
          error={errors.source}
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
        <FloatingInput 
          label="Due Date" 
          type="date" 
          value={formData.dueDate}
          onChange={(e) => {
            setFormData({ ...formData, dueDate: e.target.value })
            if (errors.dueDate) setErrors({ ...errors, dueDate: '' })
          }}
          error={errors.dueDate}
          required
        />
        {/* <FloatingInput 
          label="Assigned To" 
          value={formData.assignedTo}
          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
        /> */}
        <FloatingInput 
          label="Source Name" 
          value={formData.sourceName}
          onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
        />
        <FloatingInput 
          label="Source Email" 
          type="email"
          value={formData.sourceEmail}
          onChange={(e) => setFormData({ ...formData, sourceEmail: e.target.value })}
        />
        <FloatingInput 
          label="Source Phone" 
          type="tel"
          value={formData.sourcePhone}
          onChange={(e) => setFormData({ ...formData, sourcePhone: e.target.value })}
        />
        <FloatingInput 
          label="Add Image" 
          type="file" 
          onChange={handleImageChange}
        />
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
          onClick={handleCreateTask}
          className="btn btn-primary-with-bg"
        >
          Create Task
        </button>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default CreateTaskTab
