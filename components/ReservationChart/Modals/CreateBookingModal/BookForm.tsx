import React from 'react'
import { ACCOUNT_LIST, TAXSET_LIST } from '@/constants/constant'
import guestsData from '@/mocks/data/guests-data.json'
import FloatingInput from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import FloatingAutocomplete from '@/components/common/FloatingAutocomplete'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'

interface BookFormProps {
  formData: any
  handleChange: (field: string, value: string) => void
  dayCount: number
  constants?: any
}

const BookForm = ({ formData, handleChange, dayCount, constants }: BookFormProps) => {
  // Convert API constants to dropdown format
  const titleOptions = constants?.titles 
    ? Object.values(constants.titles).map((title: string) => ({ value: title, label: title }))
    : []
  
  const nationalityOptions = constants?.nationalities || []
  const adultOptions = constants?.adultCountList || []
  const childrenOptions = constants?.childrenCountList || []
  const accountOptions = constants?.accounts || []
  const handleSelectGuest = (guest: any) => {
    handleChange('guestName', guest.guest_name)
    handleChange('email', guest.guest_email !== 'None' && guest.guest_email !== '' ? guest.guest_email : '')
    handleChange('phone', guest.guest_contact !== 'None' && guest.guest_contact !== '' ? guest.guest_contact : '')
  }

  const handleSelectAccount = (account: any) => {
    handleChange('account', account.label)
  }

  const handleSelectTax = (tax: any) => {
    handleChange('tax', tax.label)
  }

  const handleSelectNationality = (nationality: any) => {
    handleChange('nationality', nationality.label)
  }

  const getGuestSecondaryDisplay = (guest: any) => {
    const email = guest.guest_email !== 'None' && guest.guest_email !== '' ? guest.guest_email : ''
    const phone = guest.guest_contact !== 'None' && guest.guest_contact !== '' ? guest.guest_contact : ''
    return email && phone ? `${email} • ${phone}` : email || phone
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <FloatingInput
        label="Check-in"
        type="date"
        value={formData.checkIn}
        onChange={(e) => handleChange('checkIn', e.target.value)}
      />

      <FloatingInput
        label="Check-out"
        type="date"
        value={formData.checkOut}
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
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />

      <FloatingInput
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
      />

      <FloatingAutocomplete
        label="Account"
        value={formData.account || ''}
        onChange={(value) => handleChange('account', value)}
        onSelect={handleSelectAccount}
        suggestions={accountOptions}
        filterKey="label"
        displayKey="label"
      />

      <FloatingInput
        label="Rent Per Night"
        type="number"
        value={formData.totalPrice}
        onChange={(e) => handleChange('totalPrice', e.target.value)}
      />

      <FloatingAutocomplete
        label="Select Tax"
        value={formData.tax || ''}
        onChange={(value) => handleChange('tax', value)}
        onSelect={handleSelectTax}
        suggestions={TAXSET_LIST}
        filterKey="label"
        displayKey="label"
      />

      <FloatingInput
        label="ID Number"
        type="text"
        value={formData.idNumber}
        onChange={(e) => handleChange('idNumber', e.target.value)}
      />

      <FloatingAutocomplete
        label="Nationality"
        value={formData.nationality || ''}
        onChange={(value) => handleChange('nationality', value)}
        onSelect={handleSelectNationality}
        suggestions={nationalityOptions}
        filterKey="label"
        displayKey="label"
      />

      <FloatingInput
        label="Commission %"
        type="number"
        value={formData.commission}
        onChange={(e) => handleChange('commission', e.target.value)}
      />

      <div className="md:col-span-2 lg:col-span-4">
        <FloatingLabelTextarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
}

export default BookForm
