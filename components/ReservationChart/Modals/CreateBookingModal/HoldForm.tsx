import { TITLES, ACCOUNT_LIST } from '@/constants/constant'
import guestsData from '@/mocks/data/guests-data.json'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingAutocomplete from '@/components/common/FloatingAutocomplete'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'

interface HoldFormProps {
  formData: any
  handleChange: (field: string, value: string) => void
  dayCount: number
}

const HoldForm = ({ formData, handleChange, dayCount }: HoldFormProps) => {
  const handleSelectGuest = (guest: any) => {
    handleChange('guestName', guest.guest_name)
    handleChange('email', guest.guest_email !== 'None' && guest.guest_email !== '' ? guest.guest_email : '')
    handleChange('phone', guest.guest_contact !== 'None' && guest.guest_contact !== '' ? guest.guest_contact : '')
  }

  const handleSelectAccount = (account: any) => {
    handleChange('account', account.label)
  }

  return (
    <>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
      <FloatingInput 
        label="Check-in" 
        type="date"
        value={formData?.checkIn} 
        onChange={(e) => handleChange('checkIn', e.target.value)}
      />

      <FloatingInput 
        label="Check-out" 
        type="date"
        value={formData?.checkOut} 
        onChange={(e) => handleChange('checkOut', e.target.value)}
      />

      <FloatingInput 
        label="Duration" 
        type="text"
        value={`${dayCount} ${dayCount === 1 ? "Night" : "Nights"}`}
        onChange={() => {}}
        readOnly 
      />

      <FloatingDropdown
        label="Adults"
        options={[...Array(10)].map((_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
        value={formData.adults}
        onChange={(value) => handleChange('adults', value)}
      />

      <FloatingDropdown
        label="Children"
        options={[{ value: '0', label: '0' }, ...Array(5).fill(0).map((_, i) => ({ value: String(i + 1), label: String(i + 1) }))].filter((_, i) => i === 0 || i > 0)}
        value={formData.children}
        onChange={(value) => handleChange('children', value)}
      />

      <FloatingDropdown
        label="Title"
        options={Object.values(TITLES).map(title => ({ value: title, label: title }))}
        value={formData.title}
        onChange={(value) => handleChange('title', value)}
      />

      <FloatingAutocomplete
        label="Name"
        value={formData.guestName || ''}
        onChange={(value) => handleChange('guestName', value)}
        onSelect={handleSelectGuest}
        suggestions={guestsData.guest_list}
        filterKey="guest_name"
        displayKey="guest_name"
        secondaryDisplayKey="data-string"
      />

      <FloatingInput
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        // placeholder="Enter phone"
      />

      <FloatingInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        // placeholder="Enter email"
      />

      <FloatingAutocomplete
        label="Account"
        value={formData.account || ''}
        onChange={(value) => handleChange('account', value)}
        onSelect={handleSelectAccount}
        suggestions={ACCOUNT_LIST}
        filterKey="label"
        displayKey="label"
      />

      <FloatingInput
        label="Enquiry App ID"
        type="text"
        value={formData.enquiryAppId}
        onChange={(e) => handleChange('enquiryAppId', e.target.value)}
        // placeholder="Enter enquiry app ID"
      />

      <FloatingInput
        label="Hold Booking Till"
        type="datetime-local"
        value={formData.holdBookingTill}
        onChange={(e) => handleChange('holdBookingTill', e.target.value)}
      />

      
      </div>
      <div className="grid grid-cols-1 gap-4 pt-4">
        <FloatingLabelTextarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
        />
    </div>
    </>
  )
}

export default HoldForm
