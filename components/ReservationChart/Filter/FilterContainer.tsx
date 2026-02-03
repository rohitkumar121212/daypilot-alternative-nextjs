'use client';
import SearchApartmentFilter from './SearchApartmentFilter';

interface FilterContainerProps {
  onSearchChange: (searchTerm: string) => void;
}

const FilterContainer = ({ onSearchChange }: FilterContainerProps) => {
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <SearchApartmentFilter onSearchChange={onSearchChange} />
      </div>
    </div>
  );
};

export default FilterContainer;