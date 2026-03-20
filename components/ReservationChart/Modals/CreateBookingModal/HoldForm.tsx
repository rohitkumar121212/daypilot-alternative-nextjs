import guestsData from '@/mocks/data/guests-data.json'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingAutocomplete from '@/components/common/FloatingAutocomplete'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { getTitleOptions } from '@/utils/common'

interface HoldFormProps {
  formData: any
  handleChange: (field: string, value: string) => void
  dayCount: number
  constants?: any
  errors?: any
  setErrors?: (errors: any) => void
}

const HoldForm = ({ formData, handleChange, dayCount, constants, errors = {}, setErrors }: HoldFormProps) => {
  
  // const titleOptions = constants?.titles 
  //   ? Object.values(constants.titles).map((title: string) => ({ value: title, label: title }))
  //   : []

  const titleOptions = getTitleOptions(constants?.titles)

  const adultOptions = constants?.adultCountList || []
  const childrenOptions = constants?.childrenCountList || []
  const accountOptions = constants?.accounts || []

  const handleSelectGuest = (guest: any) => {
    handleChange('guestName', guest.guest_name)
    handleChange('email', guest.guest_email !== 'None' && guest.guest_email !== '' ? guest.guest_email : '')
    handleChange('phone', guest.guest_contact !== 'None' && guest.guest_contact !== '' ? guest.guest_contact : '')
  }

  const handleSelectAccount = (account: any) => {
    handleChange('account', account.value)
    handleChange('accountLabel', account.label)
  }

  return (
    <>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-2">
      <FloatingInput 
        label="Check-in" 
        type="date"
        value={formData?.checkIn} 
        onChange={(e) => {
          handleChange('checkIn', e.target.value)
          if (errors.checkIn && setErrors) setErrors({ ...errors, checkIn: '' })
        }}
        error={errors.checkIn}
        required
      />

      <FloatingInput 
        label="Check-out" 
        type="date"
        value={formData?.checkOut} 
        onChange={(e) => {
          handleChange('checkOut', e.target.value)
          if (errors.checkOut && setErrors) setErrors({ ...errors, checkOut: '' })
        }}
        error={errors.checkOut}
        required
      />

      <FloatingInput 
        label="Duration" 
        type="text"
        value={`${dayCount} ${dayCount === 1 ? "Night" : "Nights"}`}
        onChange={() => {}}
        readOnly 
        required
      />

      <FloatingDropdown
        label="Adults"
        options={adultOptions}
        value={formData.adults}
        onChange={(value) => handleChange('adults', value)}
      />

      <FloatingDropdown
        label="Children"
        options={childrenOptions}
        value={formData.children}
        onChange={(value) => handleChange('children', value)}
      />

      <FloatingDropdown
        label="Title"
        options={titleOptions}
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

      {accountOptions.length > 0 && (
        <FloatingAutocomplete
          label="Account"
          value={formData.accountLabel || ''}
          onChange={(value) => handleChange('accountLabel', value)}
          onSelect={handleSelectAccount}
          suggestions={accountOptions}
          filterKey="label"
          displayKey="label"
        />
      )}

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
        onChange={(e) => {
          handleChange('holdBookingTill', e.target.value)
          if (errors.holdBookingTill && setErrors) setErrors({ ...errors, holdBookingTill: '' })
        }}
        error={errors.holdBookingTill}
        required
      />

      
      </div>
      {/* <div className="grid grid-cols-1 gap-4 pt-4">
        <FloatingLabelTextarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
        />
      </div> */}
    </>
  )
}

export default HoldForm
