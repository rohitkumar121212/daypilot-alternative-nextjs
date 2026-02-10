import { useState } from 'react'

const BookingDetailsModal = ({ isOpen, booking, onClose }) => {
  const [activeTab, setActiveTab] = useState('details')
  
  if (!isOpen || !booking) return null

  const tabs = [
    { id: 'details', label: 'Booking Details' },
    { id: 'case', label: 'Create New Case' },
    { id: 'task', label: 'Create New Task' },
    { id: 'payment', label: 'Add Payment' },
    { id: 'share', label: 'Share Payment Link' }
  ]

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 ">
          <h2 className="text-xl font-semibold">Booking Management</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="overflow-x-auto bg-gray-100 px-6 flex-shrink-0">
          <div className="flex gap-2 min-w-max py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white bg-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{booking.text || `Booking ${booking.id}`}</p>
              </div>
              
              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <p className="text-gray-900">{booking.startDate}</p>
              </div>
              
              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">End Date</label>
                <p className="text-gray-900">{booking.endDate}</p>
              </div>
              
              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Booking ID</label>
                <p className="text-gray-900">{booking.id}</p>
              </div>
              
              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Resource ID</label>
                <p className="text-gray-900">{booking.resourceId}</p>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-900">{booking.status || 'Confirmed'}</p>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Guest Name</label>
                <p className="text-gray-900">{booking.guestName || 'N/A'}</p>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{booking.email || 'N/A'}</p>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{booking.phone || 'N/A'}</p>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Guests</label>
                <p className="text-gray-900">{booking.guests || 'N/A'}</p>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Total Amount</label>
                <p className="text-gray-900">{booking.amount || 'N/A'}</p>
              </div>

              <div className="flex-1 min-w-[200px] max-w-[calc(33.333%-1rem)]">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-900">{booking.notes || 'N/A'}</p>
              </div>
            </div>
          )}
          
          {activeTab === 'case' && (
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
          )}
          
          {activeTab === 'task' && (
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
          )}
          
          {activeTab === 'payment' && (
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
          )}
          
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Link</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 border border-gray-300 rounded px-3 py-2" value="https://payment.link/abc123" readOnly />
                  <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Copy</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Send via Email</label>
                <input type="email" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter email address" />
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Send Link</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsModal
