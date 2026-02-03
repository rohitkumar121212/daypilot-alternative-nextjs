'use client';
import { useState } from 'react';
import dayjs from 'dayjs';

interface StartDateFilterProps {
  onDateChange: (date: string) => void;
}

const StartDateFilter = ({ onDateChange }: StartDateFilterProps) => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedDate(value);
    onDateChange(value);
  };

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-40 px-3 py-2 pl-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
};

export default StartDateFilter;