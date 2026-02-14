import React from 'react'
import { TITLES, ACCOUNT_LIST, TAXSET_LIST, NATIONALITY_LIST } from '@/constants/constant'
import guestsData from '@/mocks/data/guests-data.json'
import AutoSuggestionInput from '@/components/common/AutoSuggestionInput'

interface BookFormProps {
  formData: any
  handleChange: (field: string, value: string) => void
  dayCount: number
}

const BookForm = ({ formData, handleChange, dayCount }: BookFormProps) => {
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
        <input
          type="number"
          value={dayCount}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
        <select
          value={formData.adults}
          onChange={(e) => handleChange('adults', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
        <select
          value={formData.children}
          onChange={(e) => handleChange('children', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="0">0</option>
          {[...Array(5)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <select
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select title</option>
          {Object.values(TITLES).map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
      </div>

      <AutoSuggestionInput
        label="Name"
        value={formData.guestName || ''}
        onChange={(value) => handleChange('guestName', value)}
        onSelect={handleSelectGuest}
        placeholder="Enter guest name"
        suggestions={guestsData.guest_list}
        filterKey="guest_name"
        displayKey="guest_name"
        secondaryDisplayKey="data-string"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter phone"
        />
      </div>

      <AutoSuggestionInput
        label="Account"
        value={formData.account || ''}
        onChange={(value) => handleChange('account', value)}
        onSelect={handleSelectAccount}
        placeholder="Enter account"
        suggestions={ACCOUNT_LIST}
        filterKey="label"
        displayKey="label"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rent Per Night</label>
        <input
          type="number"
          value={formData.totalPrice}
          onChange={(e) => handleChange('totalPrice', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount..."
        />
      </div>

      <AutoSuggestionInput
        label="Select Tax"
        value={formData.tax || ''}
        onChange={(value) => handleChange('tax', value)}
        onSelect={handleSelectTax}
        placeholder="Enter tax"
        suggestions={TAXSET_LIST}
        filterKey="label"
        displayKey="label"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
        <input
          type="text"
          value={formData.idNumber}
          onChange={(e) => handleChange('idNumber', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter ID number"
        />
      </div>

      <AutoSuggestionInput
        label="Nationality"
        value={formData.nationality || ''}
        onChange={(value) => handleChange('nationality', value)}
        onSelect={handleSelectNationality}
        placeholder="Enter nationality"
        suggestions={NATIONALITY_LIST}
        filterKey="label"
        displayKey="label"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Commission %</label>
        <input
          type="number"
          value={formData.commission}
          onChange={(e) => handleChange('commission', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter commission %"
        />
      </div>

      <div className="md:col-span-2 lg:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional notes (optional)"
        />
      </div>
    </div>
  )
}

export default BookForm
