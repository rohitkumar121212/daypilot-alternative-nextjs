import { daysBetween } from '@/utils/dateUtils'
import BookForm from './BookForm'
import HoldForm from './HoldForm'
import BlockForm from './BlockForm'
import { useBookingModalData } from './hooks/useBookingModalData'
import { useBookingForm } from './hooks/useBookingForm'
import { useBookingSubmission } from './hooks/useBookingSubmission'
import { useModalState } from './hooks/useModalState'
import BookingTypeSelector from './components/BookingTypeSelector'
import LoadingOverlay from './components/LoadingOverlay'
import ActionButtons from './components/ActionButtons'
import InstantMailCheckbox from './components/InstantMailCheckbox'

/**
 * CreateBookingModal - Modal dialog for creating/editing bookings
 * Refactored with custom hooks for better maintainability
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.selection - Selection object with resourceId, startDate, endDate
 * @param {Object} props.booking - Existing booking object (for editing)
 * @param {Object} props.resource - Resource object for the selected resource
 * @param {Function} props.onClose - Handler to close the modal
 * @param {Function} props.onConfirm - Handler to confirm booking creation/update
 */

interface CreateBookingModalProps {
  isOpen: boolean
  selection: any
  booking: any
  resource: any
  onClose: () => void
  onConfirm: () => void
}

const CreateBookingModal = ({ isOpen, selection, booking, resource, onClose, onConfirm }: CreateBookingModalProps) => {
  // Custom hooks for clean separation of concerns
  const { constants, isLoadingData } = useBookingModalData(isOpen)
  const modalData = booking || selection
  const { formData, errors, setErrors, handleChange, validateForm } = useBookingForm(isOpen, booking, modalData)
  const { submitBooking, isSubmitting } = useBookingSubmission()
  const { handleBackdropClick } = useModalState(onClose)
  
  if (!isOpen || !modalData || !resource) return null
  
  const dayCount = daysBetween(formData.checkIn || modalData.startDate, formData.checkOut || modalData.endDate)
  
  const handleConfirm = async () => {
    if (validateForm()) {
      await submitBooking(formData, resource, modalData, booking, onConfirm, onClose)
    }
  }
  
  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        <LoadingOverlay isLoading={isLoadingData || isSubmitting} />
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white flex justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {resource?.name} - Add Reservations
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        
        {/* Content */}
        <div className="px-6 py-4">
          

          {/* Dynamic Form Based on Booking Type */}
          {formData.bookingType === 'book' && (
            <BookForm 
              formData={formData} 
              handleChange={handleChange} 
              dayCount={dayCount} 
              // setFormData={setFormData}
              constants={constants}
              errors={errors}
              setErrors={setErrors}
            />
          )}
          {formData.bookingType === 'hold' && (
            <HoldForm 
              formData={formData} 
              handleChange={handleChange} 
              dayCount={dayCount} 
              // setFormData={setFormData}
              constants={constants}
              errors={errors}
              setErrors={setErrors}
            />
          )}
          {formData.bookingType === 'block' && (
            <BlockForm 
              formData={formData} 
              handleChange={handleChange} 
              dayCount={dayCount} 
              constants={constants}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {/* Booking Type Section - At Top */}
          <BookingTypeSelector 
            bookingType={formData.bookingType}
            handleChange={handleChange}
          />

          {/* Instant Mail Checkbox for Book type */}
          {formData.bookingType === 'book' && (
            <InstantMailCheckbox 
              sendInstantMail={formData.sendInstantMail}
              handleChange={handleChange}
            />
          )}

          {/* Action Buttons */}
          <ActionButtons 
            onSave={handleConfirm}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateBookingModal
