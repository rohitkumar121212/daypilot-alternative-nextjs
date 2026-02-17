import { InputHTMLAttributes, forwardRef } from 'react'

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const hasValue = props.value !== undefined && props.value !== ''
    const isDateTimeInput = props.type === 'date' || props.type === 'time' || props.type === 'datetime-local'
    const isFileInput = props.type === 'file'

    return (
      <div className={`relative ${className}`}>
        <input
          ref={ref}
          {...props}
          placeholder=" "
          className={`peer w-full px-3 pt-5 pb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${props.readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
        />
        <label
          className={`absolute left-3 transition-all pointer-events-none
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
            peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-600
            ${hasValue || isDateTimeInput || isFileInput ? 'top-1.5 text-xs text-gray-600' : 'top-3.5 text-base text-gray-400'}
          `}
        >
          {label}
        </label>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    )
  }
)

FloatingLabelInput.displayName = 'FloatingLabelInput'

export default FloatingLabelInput
