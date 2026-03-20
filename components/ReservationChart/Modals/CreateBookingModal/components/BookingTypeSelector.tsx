interface BookingTypeSelectorProps {
  bookingType: string
  handleChange: (field: string, value: string) => void
}

const BookingTypeSelector = ({ bookingType, handleChange }: BookingTypeSelectorProps) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-3">Booking Type</label>
      <div className="flex gap-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="bookingType"
            value="book"
            checked={bookingType === 'book'}
            onChange={(e) => handleChange('bookingType', e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700">Book</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="bookingType"
            value="hold"
            checked={bookingType === 'hold'}
            onChange={(e) => handleChange('bookingType', e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700">Hold</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="bookingType"
            value="block"
            checked={bookingType === 'block'}
            onChange={(e) => handleChange('bookingType', e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700">Block</span>
        </label>
      </div>
    </div>
  )
}

export default BookingTypeSelector