import { TextareaHTMLAttributes, forwardRef } from 'react'

interface FloatingLabelTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

const FloatingLabelTextarea = forwardRef<HTMLTextAreaElement, FloatingLabelTextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const hasValue = props.value !== undefined && props.value !== ''

    return (
      <div className={`relative ${className}`}>
        <textarea
          ref={ref}
          {...props}
          placeholder=" "
          className={`peer w-full px-3 pt-5 pb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${props.readOnly ? 'bg-gray-50' : 'bg-white'}`}
        />
        <label
          className={`absolute left-3 transition-all pointer-events-none
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
            peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-600
            ${hasValue || props.value ? 'top-1.5 text-xs text-gray-600' : 'top-3.5 text-base text-gray-400'}
          `}
        >
          {label}
        </label>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    )
  }
)

FloatingLabelTextarea.displayName = 'FloatingLabelTextarea'

export default FloatingLabelTextarea
