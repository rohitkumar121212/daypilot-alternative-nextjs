import { useState, useEffect } from 'react'
import { proxyFetch } from '@/utils/proxyFetch'
import { useUser } from '@/contexts/UserContext'

interface AddressDetailsModalProps {
  isOpen: boolean
  resource: any
  onClose: () => void
}


const AddressDetailsModal = ({ isOpen, resource, onClose }: AddressDetailsModalProps) => {
  const [addressData, setAddressData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  // const mySquareUser = true
  const {isSquareUser}=useUser()
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAddressData(null)
      setIsLoading(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && resource?.id) {
      fetchAddressDetails()
    }
  }, [isOpen, resource?.id])

  const fetchAddressDetails = async () => {
    if (isLoading) return // Prevent multiple calls
    
    setIsLoading(true)
    try {
      const response = await proxyFetch('/api/aperfect-pms/fetch-property-address-and-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prop_id: resource?.id,
          response_version: 'v1'
        })
      })
      setAddressData(response?.data)
    } catch (error) {
      console.error('Failed to fetch address details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !resource) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-xl p-6 w-[95%] max-h-[90vh] overflow-y-auto ${
        isSquareUser ? 'max-w-6xl' : 'md:w-full max-w-2xl'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Unit Details - {resource?.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {console.log(addressData)}
        <div className="mb-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Loading address details...</span>
            </div>
          ) : addressData ? (
            <div className="flex flex-wrap gap-4">
              {!isSquareUser ? (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">Unit Name</h4>
                    <p className="text-gray-600">{addressData?.prop_abbr}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">Building Name</h4>
                    <p className="text-gray-600">{addressData?.building_name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                    <p className="text-gray-600">{addressData?.address}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">Street</h4>
                    <p className="text-gray-600">{addressData?.street}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">City</h4>
                    <p className="text-gray-600">{addressData?.city}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">Postal Code</h4>
                    <p className="text-gray-600">{addressData?.postcode}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">Floor</h4>
                    <p className="text-gray-600">{addressData?.floor}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">Pet Allowed</h4>
                    <p className="text-gray-600">{addressData?.petAllowed}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">Balcony Available</h4>
                    <p className="text-gray-600">{addressData?.balc}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]">
                    <h4 className="font-medium text-gray-900 mb-2">Google Map Link</h4>
                    <a href={`http://maps.google.com/maps?q=loc:${addressData?.property_lat},${addressData?.property_long}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View on Google Maps
                    </a>
                    <p className="text-gray-600">{addressData?.google_map_link}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-8">
                  {/* Section 1: Basic Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Basic Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Unit Name</h4>
                        <p className="text-gray-600">{addressData?.prop_abbr || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Building Name</h4>
                        <p className="text-gray-600">{addressData?.building_name || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                        <p className="text-gray-600">{addressData?.address || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Street</h4>
                        <p className="text-gray-600">{addressData?.street || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">City</h4>
                        <p className="text-gray-600">{addressData?.city || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Postal Code</h4>
                        <p className="text-gray-600">{addressData?.postcode || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Floor</h4>
                        <p className="text-gray-600">{addressData?.floor || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Google Map Link</h4>
                        {addressData?.property_lat && addressData?.property_long ? (
                          <a href={`http://maps.google.com/maps?q=loc:${addressData.property_lat},${addressData.property_long}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View on Google Maps
                          </a>
                        ) : (
                          <p className="text-gray-600">N/A</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Property Features */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Property Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Pet Allowed</h4>
                        <p className="text-gray-600">{addressData?.petAllowed || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Balcony Available</h4>
                        <p className="text-gray-600">{addressData?.balc || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">No. of Bathrooms</h4>
                        <p className="text-gray-600">{addressData?.no_of_bathrooms || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Extra Bed</h4>
                        <p className="text-gray-600">{addressData?.extra_bed || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Sofa Bed</h4>
                        <p className="text-gray-600">{addressData?.sofa_bed || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">View</h4>
                        <p className="text-gray-600">{addressData?.view || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Amenities */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Cooling System</h4>
                        <p className="text-gray-600">{addressData?.cooling_system || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Concierge</h4>
                        <p className="text-gray-600">{addressData?.concierge || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Pool</h4>
                        <p className="text-gray-600">{addressData?.pool || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Elevator</h4>
                        <p className="text-gray-600">{addressData?.elevator || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Mail Box</h4>
                        <p className="text-gray-600">{addressData?.mail_box || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Other Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Other Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Nearest Store</h4>
                        <p className="text-gray-600">{addressData?.nearest_store || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Nearest Cafe</h4>
                        <p className="text-gray-600">{addressData?.nearest_cafe || 'N/A'}</p>
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Other Facilities</h4>
                        <p className="text-gray-600">{addressData?.other_facilities || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className={`btn btn-primary ${
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

export default AddressDetailsModal

