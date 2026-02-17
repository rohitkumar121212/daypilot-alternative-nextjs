import { SelectHTMLAttributes, forwardRef } from 'react'

interface FloatingLabelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

const FloatingLabelSelect = forwardRef<HTMLSelectElement, FloatingLabelSelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    const hasValue = props.value !== undefined && props.value !== ''

    return (
      <div className={`relative ${className}`}>
        <select
          ref={ref}
          {...props}
          className={`peer w-full px-3 pt-5 pb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${props.disabled ? 'bg-gray-50' : 'bg-white'}`}
        >
          {children}
        </select>
        <label
          className={`absolute left-3 transition-all pointer-events-none
            ${hasValue || props.value ? 'top-1.5 text-xs text-gray-600' : 'top-3.5 text-base text-gray-400'}
          `}
        >
          {label}
        </label>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    )
  }
)

FloatingLabelSelect.displayName = 'FloatingLabelSelect'

export default FloatingLabelSelect
