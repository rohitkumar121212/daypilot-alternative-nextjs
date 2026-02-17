import { InputHTMLAttributes, forwardRef } from 'react'

interface FloatingLabelInputWithPrefixProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  prefix?: string
  error?: string
}

const FloatingLabelInputWithPrefix = forwardRef<HTMLInputElement, FloatingLabelInputWithPrefixProps>(
  ({ label, prefix, error, className = '', ...props }, ref) => {
    const hasValue = props.value !== undefined && props.value !== ''
    const isDateTimeInput = props.type === 'date' || props.type === 'time' || props.type === 'datetime-local'
    const isFileInput = props.type === 'file'

    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            {...props}
            placeholder=" "
            className={`peer w-full ${prefix ? 'pl-8' : 'pl-3'} pr-3 pt-5 pb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${props.readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          />
        </div>
        <label
          className={`absolute ${prefix ? 'left-8' : 'left-3'} transition-all pointer-events-none
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

FloatingLabelInputWithPrefix.displayName = 'FloatingLabelInputWithPrefix'

export default FloatingLabelInputWithPrefix
