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
  errors?: any
  setErrors?: (errors: any) => void
}

const BookForm = ({ formData, handleChange, dayCount, constants, errors = {}, setErrors }: BookFormProps) => {
  // Convert API constants to dropdown format
  const titleOptions = constants?.titles 
    ? Object.values(constants.titles).map((title: string) => ({ value: title, label: title }))
    : []
  
  const nationalityOptions = constants?.nationalities || []
  const adultOptions = constants?.adultCountList || []
  const childrenOptions = constants?.childrenCountList || []
  const accountOptions = constants?.accounts || []
  const taxOptions = constants?.taxSets || []
  const handleSelectGuest = (guest: any) => {
    handleChange('guestName', guest.guest_name)
    handleChange('email', guest.guest_email !== 'None' && guest.guest_email !== '' ? guest.guest_email : '')
    handleChange('phone', guest.guest_contact !== 'None' && guest.guest_contact !== '' ? guest.guest_contact : '')
  }

  const handleSelectAccount = (account: any) => {
    handleChange('account', account.value)
    handleChange('accountLabel', account.label)
  }

  const handleSelectTax = (tax: any) => {
    handleChange('tax', tax.value)
    handleChange('taxLabel', tax.label)
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
        value={formData.checkOut}
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
        onChange={(value) => {
          handleChange('guestName', value)
          if (errors.guestName && setErrors) setErrors({ ...errors, guestName: '' })
        }}
        onSelect={handleSelectGuest}
        suggestions={guestsData.guest_list}
        filterKey="guest_name"
        displayKey="guest_name"
        secondaryDisplayKey="data-string"
        error={errors.guestName}
        required
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
        onChange={(e) => {
          handleChange('phone', e.target.value)
          if (errors.phone && setErrors) setErrors({ ...errors, phone: '' })
        }}
        error={errors.phone}
        required
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
        label="Rent Per Night"
        type="number"
        value={formData.totalPrice}
        onChange={(e) => {
          handleChange('totalPrice', e.target.value)
          if (errors.totalPrice && setErrors) setErrors({ ...errors, totalPrice: '' })
        }}
        error={errors.totalPrice}
        required
      />

      {taxOptions.length > 0 && (<FloatingAutocomplete
        label="Select Tax"
        value={formData.taxLabel || ''}
        onChange={(value) => handleChange('taxLabel', value)}
        onSelect={handleSelectTax}
        suggestions={taxOptions}
        filterKey="label"
        displayKey="label"
      />)}

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
        onChange={(e) => {
          handleChange('commission', e.target.value)
          if (errors.commission && setErrors) setErrors({ ...errors, commission: '' })
        }}
        error={errors.commission}
        required
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
