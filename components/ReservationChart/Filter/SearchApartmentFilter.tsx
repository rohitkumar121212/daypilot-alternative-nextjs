'use client';
import { useState } from 'react';

interface SearchApartmentFilterProps {
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
}

const SearchApartmentFilter = ({ 
  onSearchChange, 
  placeholder = "Search apartments and rooms..." 
}: SearchApartmentFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearchChange('');
  };

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-64 px-3 py-2 pl-9 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchTerm && (
          <button
            onClick={clearSearch}
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

export default SearchApartmentFilter;