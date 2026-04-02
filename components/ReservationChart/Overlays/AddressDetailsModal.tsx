import { useState, useEffect } from 'react'
import { proxyFetch } from '@/utils/proxyFetch'

interface AddressDetailsModalProps {
  isOpen: boolean
  resource: any
  onClose: () => void
}

const AddressDetailsModal = ({ isOpen, resource, onClose }: AddressDetailsModalProps) => {
  const [addressData, setAddressData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && resource?.id) {
      fetchAddressDetails()
    }
  }, [isOpen, resource?.id])

  const fetchAddressDetails = async () => {
    try {
      setIsLoading(true)
      const response = await proxyFetch('/api/aperfect-pms/fetch-property-address-and-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prop_id: resource?.id,
          response_version: 'v1'
        })
      })
      setAddressData(response)
    } catch (error) {
      console.error('Failed to fetch address details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[10000] w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Address & Details - {resource?.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          ) : addressData ? (
            <div className="space-y-4">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(addressData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>
    </>
  )
}

export default AddressDetailsModal