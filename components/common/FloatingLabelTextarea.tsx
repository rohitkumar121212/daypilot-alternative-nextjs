'use client'

import { TextareaHTMLAttributes, forwardRef, useState } from 'react'

interface FloatingLabelTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

const FloatingLabelTextarea = forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(({ label, error, className = '', value, onFocus, onBlur, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  const hasValue = value !== undefined && value !== ''
  const active = isFocused || hasValue

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={ref}
        value={value}
        {...props}
        onFocus={(e) => {
          setIsFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          onBlur?.(e)
        }}
        className={`w-full px-4 pt-5 pb-2 border rounded-md resize-none
        outline-none transition-all duration-200
        ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500'
        }
        ${props.readOnly ? 'bg-gray-50' : 'bg-white'}
        `}
      />

      {/* Floating Label */}
      <label
        className={`absolute left-3 px-1 bg-white transition-all duration-200 pointer-events-none
        ${
          active
            ? '-top-2 text-xs'
            : 'top-3 text-sm text-gray-500'
        }
        ${
          error
            ? 'text-red-500'
            : active
              ? 'text-blue-600'
              : 'text-gray-600'
        }`}
      >
        {label}
      </label>

      {/* Error */}
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
})

FloatingLabelTextarea.displayName = 'FloatingLabelTextarea'

export default FloatingLabelTextarea

// import { TextareaHTMLAttributes, forwardRef } from 'react'

// interface FloatingLabelTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
//   label: string
//   error?: string
// }

// const FloatingLabelTextarea = forwardRef<HTMLTextAreaElement, FloatingLabelTextareaProps>(
//   ({ label, error, className = '', ...props }, ref) => {
//     const hasValue = props.value !== undefined && props.value !== ''

//     return (
//       <div className={`relative ${className}`}>
//         <textarea
//           ref={ref}
//           {...props}
//           placeholder=" "
//           className={`peer w-full px-3 pt-5 pb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
//             error ? 'border-red-500' : 'border-gray-300'
//           } ${props.readOnly ? 'bg-gray-50' : 'bg-white'}`}
//         />
//         <label
//           className={`absolute left-3 transition-all pointer-events-none
//             peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
//             peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-600
//             ${hasValue || props.value ? 'top-1.5 text-xs text-gray-600' : 'top-3.5 text-base text-gray-400'}
//           `}
//         >
//           {label}
//         </label>
//         {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//       </div>
//     )
//   }
// )

// FloatingLabelTextarea.displayName = 'FloatingLabelTextarea'

// export default FloatingLabelTextarea
