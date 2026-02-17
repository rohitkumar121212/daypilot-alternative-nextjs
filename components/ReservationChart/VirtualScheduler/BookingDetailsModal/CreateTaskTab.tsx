const CreateTaskTab = () => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter task name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input type="date" className="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter assignee" />
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Create Task</button>
    </div>
  )
}

export default CreateTaskTab
