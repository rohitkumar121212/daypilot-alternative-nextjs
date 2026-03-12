'use client';
import { useState } from 'react';
import Image from 'next/image';
import SearchApartmentFilter from './SearchApartmentFilter';
import BookingIdFilter from './BookingIdFilter';
import StartDateFilter from './StartDateFilter';
import DaysFilter from './DaysFilter';
import AbbreviationsModal from '../Modals/Abbreviation/AbbreviationModal';
import PropertiesLegendsModal from '../Modals/PropertiesLegends/PropertiesLegendsModal';
import { useUser } from "@/contexts/UserContext"

interface FilterContainerProps {
  onSearchChange: (searchTerm: string) => void;
  onBookingIdChange: (bookingId: string) => void;
  onDateChange: (date: string) => void;
  onDaysChange: (days: number) => void;
  bookings: any[];
}

const FilterContainer = ({ onSearchChange, onBookingIdChange, onDateChange, onDaysChange, bookings }: FilterContainerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colorsModalOpen, setColorsModalOpen] = useState(false);
  const { user } = useUser()

  return (
    <>
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {(user?.email==='stay@thesqua.re' || user?.email==='apsdemo2023@gmail.com') && (
            <div className='flex flex-row gap-2 text-sm'>
              <a href="https://aperfectstay.ai/aps-redis-memorystore" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Cache |
              </a>
              <a href="" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                STAAH Logs |
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              STAAH Reservation Logs |
            </a>
            <a href="https://aperfectstay.ai/aperfect-pms/refresh-booking-window-cache" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Refresh Window
            </a>
          </div>)}
          <SearchApartmentFilter onSearchChange={onSearchChange} />
          <BookingIdFilter onBookingIdChange={onBookingIdChange} bookings={bookings} />
          <StartDateFilter onDateChange={onDateChange} />
          <DaysFilter onDaysChange={onDaysChange} />
          <AbbreviationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Image src="https://images.thesqua.re/APS/info.png" alt="Info" width={30} height={30} />
          </button>
          <button
            onClick={() => setColorsModalOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Image src="https://images.thesqua.re/APS/rgb.png" alt="Info" width={30} height={30} />
          </button>
          <a
            href="https://aperfectstay.ai/aperfect-pms/settings"
            target='_blank'
            className="p-2 hover:bg-gray-100 rounded-md transition-colors inline-block"
          >
            <Image src="https://images.thesqua.re/APS/gear.png" alt="Info" width={30} height={30} />
          </a>
        </div>
      </div>
      {isModalOpen && <AbbreviationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      {colorsModalOpen && <PropertiesLegendsModal isOpen={colorsModalOpen} onClose={() => setColorsModalOpen(false)} />}
    </>
  );
};

export default FilterContainer;