const AddPaymentTab = () => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <input type="number" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="0.00" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
        <select className="w-full border border-gray-300 rounded px-3 py-2">
          <option>Credit Card</option>
          <option>Cash</option>
          <option>Bank Transfer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea className="w-full border border-gray-300 rounded px-3 py-2" rows={3} placeholder="Payment notes" />
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Payment</button>
    </div>
  )
}

export default AddPaymentTab
