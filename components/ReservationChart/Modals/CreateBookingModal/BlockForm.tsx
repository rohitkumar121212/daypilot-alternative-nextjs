import  FloatingInput  from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { DNR_TYPE_LIST } from '@/constants/constant'
interface BlockFormProps {
  formData: any
  handleChange: (field: string, value: string) => void
  dayCount: number
}

const BlockForm = ({ formData, handleChange, dayCount, setFormData }: BlockFormProps) => {
  return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <FloatingInput 
        label="Check-in" 
        type='date'
        value={formData?.checkIn} 
        onChange={(e) => handleChange('checkIn', e.target.value)}
      />
      <FloatingInput 
        label="Check-out" 
        type='date'
        value={formData?.checkOut} 
        onChange={(e) => handleChange('checkOut', e.target.value)}
      />

      <FloatingInput 
        label="Duration" 
        type='text'
        value={`${dayCount} ${dayCount === 1 ? "Night" : "Nights"}`}
        onChange={(e) => handleChange('duration', e.target.value)}
        readOnly 
      />

      <FloatingDropdown 
          label="Reason" 
          options={DNR_TYPE_LIST}
          value={formData.dnrReason}
          // onChange={(e) => handleChange('dnrReason', e.target.value)}
          onChange={(value) => {
            setFormData({ ...formData, dnrReason: value })
            // if (errors.dnrReason) setErrors({ ...errors, dnrReason: '' })
          }}
          // error={errors.dnrReason}
          required
        />
      {/* <div>
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
      </div> */}

      
    </div>
    <div className="md:col-span-2 lg:col-span-4">
        {/* <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter DNR Notes or Reason"
        /> */}
        <FloatingLabelTextarea 
        label="Enter DNR Notes or Reason" 
        rows={3} 
        value={formData.dnrNotes}
        required={true}
        onChange={(e) => {
          setFormData({ ...formData, dnrNotes: e.target.value })
          // if (errors.description) setErrors({ ...errors, description: '' })
        }}
        // error={errors.description}
      />
      </div>
    </div>
  )
}

export default BlockForm
