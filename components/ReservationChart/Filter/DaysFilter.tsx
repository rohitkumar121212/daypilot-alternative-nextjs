'use client';
import { useState } from 'react';

interface DaysFilterProps {
  onDaysChange: (days: number) => void;
}

const DaysFilter = ({ onDaysChange }: DaysFilterProps) => {
  const [selectedDays, setSelectedDays] = useState(30);
  const dayOptions = [15, 30, 45, 60, 90];

  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setSelectedDays(value);
    onDaysChange(value);
  };

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <select
          value={selectedDays}
          onChange={handleDaysChange}
          className="w-24 px-3 py-2 pl-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
        >
          {dayOptions.map(days => (
            <option key={days} value={days}>
              {days}d
            </option>
          ))}
        </select>
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg
          className="absolute right-2 top-3 h-3 w-3 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default DaysFilter;