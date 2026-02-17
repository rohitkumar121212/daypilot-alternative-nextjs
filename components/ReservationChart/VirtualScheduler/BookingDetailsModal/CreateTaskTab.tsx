import FloatingLabelInput from '@/components/common/FloatingLabelInput'

const CreateTaskTab = () => {
  return (
    <div className="space-y-4">
      <FloatingLabelInput label="Task Name" type="text" placeholder=" " />
      <FloatingLabelInput label="Due Date" type="date" placeholder=" " />
      <FloatingLabelInput label="Assigned To" type="text" placeholder=" " />
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Create Task</button>
    </div>
  )
}

export default CreateTaskTab
