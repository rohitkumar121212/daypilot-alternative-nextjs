'use client'

import { useState } from 'react'
import FloatingLabelInput from '@/components/common/FloatingLabelInput'
import FloatingLabelDropdown from '@/components/common/FloatingLabelDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { SOURCE_LIST_FOR_CREATE_TASK, PRIORITY_LIST_FOR_CREATE_TASK } from '@/constants/constant'

interface CreateTaskTabProps {
  apartmentName?: string
}

const CreateTaskTab = ({ apartmentName = 'Apartment 101' }: CreateTaskTabProps) => {
  const [formData, setFormData] = useState({
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

  const handleCreateTask = () => {
    const payload = {
      ...formData,
      apartmentName
    }
    console.log('Create task payload:', payload)
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
        <FloatingLabelInput 
          label="Apartment Name" 
          value={apartmentName} 
          readOnly 
        />
        <FloatingLabelInput 
          label="Task Title" 
          type="text" 
          placeholder="Title - Ex - Leak under the sink" 
          value={formData.taskTitle}
          onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
        />
        <FloatingLabelDropdown 
          label="Source" 
          options={SOURCE_LIST_FOR_CREATE_TASK}
          showEmptyOption={true}
          emptyOptionLabel="Select source"
          value={formData.source}
          onChange={(value) => setFormData({ ...formData, source: value })}
        />
        <FloatingLabelDropdown 
          label="Priority" 
          options={PRIORITY_LIST_FOR_CREATE_TASK}
          showEmptyOption={true}
          emptyOptionLabel="Select priority"
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value })}
        />
        <FloatingLabelInput 
          label="Due Date" 
          type="date" 
          placeholder=" " 
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
        <FloatingLabelInput 
          label="Assigned To" 
          type="text" 
          placeholder=" " 
          value={formData.assignedTo}
          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
        />
        <FloatingLabelInput 
          label="Source Name" 
          type="text" 
          placeholder=" " 
          value={formData.sourceName}
          onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
        />
        <FloatingLabelInput 
          label="Source Email" 
          type="email" 
          placeholder=" " 
          value={formData.sourceEmail}
          onChange={(e) => setFormData({ ...formData, sourceEmail: e.target.value })}
        />
        <FloatingLabelInput 
          label="Source Phone" 
          type="tel" 
          placeholder=" " 
          value={formData.sourcePhone}
          onChange={(e) => setFormData({ ...formData, sourcePhone: e.target.value })}
        />
        <FloatingLabelInput 
          label="Add Image" 
          type="file" 
          placeholder=" " 
          onChange={handleImageChange}
        />
      </div>
      <FloatingLabelTextarea 
        label="Description" 
        rows={3} 
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <div className="flex gap-2">
        <button 
          onClick={handleCreateTask}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Create Task
        </button>
        <button className="border border-gray-300 text-red-500 px-4 py-2 rounded hover:bg-gray-50">Close</button>
      </div>
    </div>
  )
}

export default CreateTaskTab
