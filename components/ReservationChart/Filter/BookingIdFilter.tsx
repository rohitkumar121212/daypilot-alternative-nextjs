'use client';
import { useState } from 'react';

interface BookingIdFilterProps {
  onBookingIdChange: (bookingId: string) => void;
  placeholder?: string;
}

const BookingIdFilter = ({ 
  onBookingIdChange, 
  placeholder = "Search booking ID..." 
}: BookingIdFilterProps) => {
  const [bookingId, setBookingId] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBookingId(value);
    onBookingIdChange(value);
  };

  const clearBookingId = () => {
    setBookingId('');
    onBookingIdChange('');
  };

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <input
          type="text"
          value={bookingId}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-48 px-3 py-2 pl-9 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {bookingId && (
          <button
            onClick={clearBookingId}
            className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingIdFilter;