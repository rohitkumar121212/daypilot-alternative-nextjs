import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { FloatingInput } from '@/components/common/FloatingInput'
import FloatingDropdown from '@/components/common/FloatingDropdown'
import { apiFetch } from '@/utils/apiRequest'
import { useUser } from '@/hooks/useUser'
import { useDataRefresh } from '@/contexts/DataRefreshContext'

const SplitBookingModal = ({ isOpen, booking, resources, onSplit, onClose }) => {
  const [splitStartDate, setSplitStartDate] = useState('')
  const [splitEndDate, setSplitEndDate] = useState('')
  const [newApartment, setNewApartment] = useState('')
  const [newApartmentOptions, setNewApartmentOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false) // 🔄 Main action loading
  const [isLoadingApartments, setIsLoadingApartments] = useState(false) // 🔄 Apartment fetching loading

  const { user } = useUser()
  const { refreshData } = useDataRefresh()

  // Set default dates when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      const defaultStartDate = dayjs(booking.startDate).add(1, 'day').format('YYYY-MM-DD')
      setSplitStartDate(defaultStartDate)
      setSplitEndDate(booking.endDate)
      setNewApartment('') // Reset apartment selection
      setIsLoading(false) // Reset loading states
      setIsLoadingApartments(false)
    }
  }, [isOpen, booking])

  if (!isOpen || !booking) return null

  const minDate = dayjs(booking.startDate).add(1, 'day').format('YYYY-MM-DD')

  const getAvailableApartments = async() => {
    setIsLoadingApartments(true) // 🔄 Start apartment loading
    
    const payload = {
      user_id: user?.admin_details?.id,
      response_version: 'v1',
    }
    
    try {
      const apartmentInfoUrl = `https://aperfectstay.ai/api/aperfectstay/own-stock-apartments/pms`
      const apartmentResponse = await apiFetch(apartmentInfoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      const apartmentData = apartmentResponse?.data
      const updatedApartmentData = apartmentData?.apartment_abbr?.map((parent) => ({
        label: parent,
        value: parent
      }))
      setNewApartmentOptions(updatedApartmentData || [])
      console.log('Updated Apartment data with available_for_split filter:', updatedApartmentData)
    } catch (error) {
      console.error('Failed to fetch apartment data:', error)
      setNewApartmentOptions([])
    } finally {
      setIsLoadingApartments(false) // 🔄 Stop apartment loading
    }
  }
  useEffect(() => {
    getAvailableApartments()
  }, [])
  const handleSplit = async () => {
    if (!splitStartDate || !splitEndDate || !newApartment || isLoading) {
      if (!splitStartDate || !splitEndDate || !newApartment) {
        alert('Please fill all required fields')
      }
      return
    }

    setIsLoading(true) // 🔄 Start split loading

    const payload = {
      booking_id: booking.id,
      split_start: splitStartDate,
      split_end: splitEndDate,
      split_apartment: newApartment,
      response_version: 'v1',
    }
    console.log('Splitting booking with payload:', payload)

    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const url = isDevelopment
        ? '/api/proxy/split-booking'
        : 'https://aperfectstay.ai/api/pms-enqire-split-booking'
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Split booking response:', data)
      
      if (data.success) {
        const bookingId = data.data?.reservation_id
        console.log('Split booking successful for booking ID:', bookingId)
        
        // ✅ Success: Refresh data and close modal
        await refreshData()
        onClose()
      } else {
        alert(data.error || 'Failed to split booking')
      }
    } catch (error) {
      console.error('Failed to split booking:', error)
      alert('An error occurred while splitting booking. Please try again.')
    } finally {
      setIsLoading(false) // 🔄 Stop split loading
    }
  }


  // Get all apartments from resources in label/value format
  const apartments = resources.flatMap(parent => 
    (parent.children || []).map(apt => ({
      label: apt.name,
      value: apt.id
    }))
  )

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-[92%] md:w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Split Booking</h2>
        
        <div className="space-y-4 mb-6">
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select From Date</label>
            <input 
              type="text" 
              value={dayjs(booking.startDate).format('DD/MM/YYYY')}
              disabled
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
          </div> */}
          <FloatingInput 
            label="Select From Date" 
            type='date'
            value={splitStartDate} 
            onChange={(e) => setSplitStartDate(e.target.value)}
            min={minDate}
            max={booking.endDate}
          />
          <FloatingInput 
            label="To Date" 
            type='date'
            value={splitEndDate} 
            onChange={(e) => setSplitEndDate(e.target.value)}
          />
          <FloatingDropdown 
            label={isLoadingApartments ? "Loading apartments..." : "Select New Apartment"}
            options={newApartmentOptions}
            value={newApartment}
            onChange={(value) => setNewApartment(value)}
            disabled={isLoadingApartments}
            required
          />
        </div>
        {console.log('New Apartment:', newApartment)}
        
        <div className="flex gap-3">
          <button 
            onClick={handleSplit}
            disabled={isLoading || isLoadingApartments || !splitStartDate || !splitEndDate || !newApartment}
            className={`btn flex-1 flex items-center justify-center gap-2 ${
              isLoading || isLoadingApartments || !splitStartDate || !splitEndDate || !newApartment
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'btn-primary-with-bg'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Splitting...
              </>
            ) : (
              'Split Booking'
            )}
          </button>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className={`btn btn-primary flex-1 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SplitBookingModal
