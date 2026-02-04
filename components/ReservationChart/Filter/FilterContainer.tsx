'use client';
import SearchApartmentFilter from './SearchApartmentFilter';
import BookingIdFilter from './BookingIdFilter';
import StartDateFilter from './StartDateFilter';
import DaysFilter from './DaysFilter';

interface FilterContainerProps {
  onSearchChange: (searchTerm: string) => void;
  onBookingIdChange: (bookingId: string) => void;
  onDateChange: (date: string) => void;
  onDaysChange: (days: number) => void;
  bookings: any[];
}

const FilterContainer = ({ onSearchChange, onBookingIdChange, onDateChange, onDaysChange, bookings }: FilterContainerProps) => {
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <SearchApartmentFilter onSearchChange={onSearchChange} />
        <BookingIdFilter onBookingIdChange={onBookingIdChange} bookings={bookings} />
        <StartDateFilter onDateChange={onDateChange} />
        <DaysFilter onDaysChange={onDaysChange} />
      </div>
    </div>
  );
};

export default FilterContainer;