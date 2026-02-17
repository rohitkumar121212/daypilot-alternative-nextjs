const CreateCaseTab = () => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Case Title</label>
        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter case title" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select className="w-full border border-gray-300 rounded px-3 py-2">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea className="w-full border border-gray-300 rounded px-3 py-2" rows={4} placeholder="Enter description" />
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Create Case</button>
    </div>
  )
}

export default CreateCaseTab
