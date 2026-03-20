import  FloatingInput  from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { DNR_TYPE_LIST } from '@/constants/constant'
interface BlockFormProps {
  formData: any
  handleChange: (field: string, value: string) => void
  dayCount: number
  setFormData: (data: any) => void
  errors?: any
  setErrors?: (errors: any) => void
  constants?: any
}

const BlockForm = ({ formData, handleChange, dayCount, setFormData, errors = {}, setErrors, constants }: BlockFormProps) => {
  return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <FloatingInput 
        label="Check-in" 
        type='date'
        value={formData?.checkIn} 
        onChange={(e) => handleChange('checkIn', e.target.value)}
        required
      />
      <FloatingInput 
        label="Check-out" 
        type='date'
        value={formData?.checkOut} 
        onChange={(e) => handleChange('checkOut', e.target.value)}
        required
      />

      <FloatingInput 
        label="Duration" 
        type='text'
        value={`${dayCount} ${dayCount === 1 ? "Night" : "Nights"}`}
        onChange={(e) => handleChange('duration', e.target.value)}
        readOnly 
        required
      />

      <FloatingDropdown 
        label="Reason" 
        options={constants?.dnrTypes}
        value={formData.dnrReason}
        onChange={(value) => {
          setFormData({ ...formData, dnrReason: value })
          if (errors.dnrReason && setErrors) setErrors({ ...errors, dnrReason: '' })
        }}
        error={errors.dnrReason}
        required
      />
    </div>
    <div className="md:col-span-2 lg:col-span-4">
        <FloatingLabelTextarea 
          label="Enter DNR Notes or Reason" 
          rows={3} 
          value={formData.dnrNotes}
          required={true}
          onChange={(e) => {
            setFormData({ ...formData, dnrNotes: e.target.value })
            if (errors.dnrNotes && setErrors) setErrors({ ...errors, dnrNotes: '' })
          }}
          error={errors.dnrNotes}
        />
      </div>
    </div>
  )
}

export default BlockForm
