import { DNR_TYPE_LIST } from '@/constants/constant'
interface BlockFormProps {
  formData: any
  handleChange: (field: string, value: string) => void
  dayCount: number
}

const BlockForm = ({ formData, handleChange, dayCount }: BlockFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
        <input
          type="date"
          value={formData.checkIn}
          onChange={(e) => handleChange('checkIn', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
        <input
          type="date"
          value={formData.checkOut}
          onChange={(e) => handleChange('checkOut', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
        <input
          type="text"
          // value={dayCount}
          value={`${dayCount} ${dayCount === 1 ? "Night" : "Nights"}`}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
        <select
          value={formData.dnrReason}
          onChange={(e) => handleChange('dnrReason', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Reason</option>
          {DNR_TYPE_LIST.map((reason) => (
            <option key={reason.label} value={reason.label}>{reason.label}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 lg:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter DNR Notes or Reason"
        />
      </div>
    </div>
  )
}

export default BlockForm
