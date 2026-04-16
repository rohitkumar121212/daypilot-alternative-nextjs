'use client';
import { useState, useRef, useEffect } from 'react';

interface EnquiryIdFilterProps {
  onEnquiryIdChange: (enquiryId: string) => void;
  bookings: any[];
  placeholder?: string;
}

const EnquiryIdFilter = ({
  onEnquiryIdChange,
  bookings = [],
  placeholder = "Search enquiry ID..."
}: EnquiryIdFilterProps) => {
  const [enquiryId, setEnquiryId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // ✅ Extract suggestions based on enquiry ID
  const suggestions = bookings
    .filter((booking) => {
      const id = booking.booking_details?.enq_app_id?.toString() || '';
      return id.includes(enquiryId) && id !== enquiryId;
    })
    .map((booking) => ({
      id: booking.booking_details?.enq_app_id?.toString(),
      guestName:
        booking.text ||
        booking.booking_details?.name ||
        'Unknown Guest'
    }))
    .filter((s) => s.id) // remove undefined/null
    .slice(0, 5);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEnquiryId(value);
    onEnquiryIdChange(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestionId: string) => {
    setEnquiryId(suggestionId);
    onEnquiryIdChange(suggestionId);
    setShowSuggestions(false);
  };

  const clearEnquiryId = () => {
    setEnquiryId('');
    onEnquiryIdChange('');
    setShowSuggestions(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={enquiryId}
          onChange={handleInputChange}
          onFocus={() => enquiryId.length > 0 && setShowSuggestions(true)}
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
        {enquiryId && (
          <button
            onClick={clearEnquiryId}
            className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion.id)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="text-sm font-medium text-gray-900">{suggestion.id}</div>
                <div className="text-xs text-gray-500">{suggestion.guestName}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryIdFilter;