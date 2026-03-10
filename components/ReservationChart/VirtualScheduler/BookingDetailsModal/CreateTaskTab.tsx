'use client'

import { useState } from 'react'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { SOURCE_LIST_FOR_CREATE_TASK, PRIORITY_LIST_FOR_CREATE_TASK } from '@/constants/constant'

interface CreateTaskTabProps {
  bookingDetails?: any,
  reservationConstants?: any
}

const CreateTaskTab = ({ bookingDetails, reservationConstants }: CreateTaskTabProps) => {
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

  console.log('CreateTaskTab reservationConstants:', reservationConstants)
  const handleCreateTask = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.taskTitle.trim()) newErrors.taskTitle = 'Task title is required'
    if (!formData.source) newErrors.source = 'Source is required'
    if (!formData.priority) newErrors.priority = 'Priority is required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    // const payload = {
    //   curr_apartment_case2: formData.apartmentName || '',
    //   title: formData.taskTitle,
    //   source: formData.source,
    //   priority: formData.priority,
    //   due_date: formData.dueDate,
    //   // assigned_to: formData.assignedTo,
    //   name: formData.sourceName,
    //   email: formData.sourceEmail,
    //   phone: formData.sourcePhone,
    //   images: formData.image?.name || '',
    //   description: formData.description,
    //   booking: bookingDetails?.booking_key || '',
    //   prop: bookingDetails?.apartment_id || '',
    //   guest: bookingDetails?.guest_key || '',
    //   save: "Create Task"
    // }
    const payload = {
      curr_apartment_case2: '450DH',
      title: 'test',
      source: 'External',
      priority: 'low',
      due_date: '2026-03-11',
      // assigned_to: formData.assignedTo,
      name: '',
      email: '',
      phone: '',
      images: '',
      description: formData.description,
      booking: '5675156698562560',
      prop: '6155469875838976',
      guest: '6099323868676096',
      save: "Create Task"
    }
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const url = isDevelopment
        ? '/api/proxy/create-task'
        : 'https://aperfectstay.ai/api/aperfect10/pms/create-new-task'
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Task created successfully:', data)
      
      if (data.success) {
        alert('Task created successfully!')
        // Reset form or close modal
      } else {
        alert(data.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      alert('Failed to create task')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] })
    }
  }

  return (
    <div className="space-y-4">
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
      <div className="flex gap-2">
        <button 
          onClick={handleCreateTask}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Create Task
        </button>
        <button className="border border-gray-300 text-red-500 px-4 py-2 rounded-md hover:bg-gray-50">Close</button>
      </div>
    </div>
  )
}

export default CreateTaskTab
