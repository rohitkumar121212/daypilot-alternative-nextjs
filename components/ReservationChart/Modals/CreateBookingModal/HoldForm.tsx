import React from 'react'
import { TITLES, ACCOUNT_LIST } from '@/constants/constant'
import guestsData from '@/mocks/data/guests-data.json'
import AutoSuggestionInput from '@/components/common/AutoSuggestionInput'

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter phone"
        />
      </div>

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
        <label className="block text-sm font-medium text-gray-700 mb-1">Enquiry App ID</label>
        <input
          type="text"
          value={formData.enquiryAppId}
          onChange={(e) => handleChange('enquiryAppId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter enquiry app ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hold Booking Till</label>
        <input
          type="datetime-local"
          value={formData.holdBookingTill}
          onChange={(e) => handleChange('holdBookingTill', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default HoldForm
