'use client'

import { useState } from 'react'

interface Option {
  value: string
  label: string
}

interface FloatingDropdownProps {
  label: string
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
}

const FloatingDropdown = ({
  label,
  options,
  value = '',
  onChange,
  error,
  required = false,
  disabled = false
}: FloatingDropdownProps) => {

  const hasValue = value !== ''

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`peer w-full px-4 p-2 border rounded-md outline-none transition-all appearance-none
        ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500"
        }`}
      >
        {/* Hidden placeholder */}
        <option value="" disabled hidden></option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Floating Label */}
      <label
        className={`absolute left-3 px-1 bg-white transition-all pointer-events-none
        ${
          hasValue
            ? "-top-2 text-xs"
            : "top-3 text-sm text-gray-500 peer-focus:-top-2 peer-focus:text-xs"
        }
        ${
          error
            ? "text-red-500"
            : "peer-focus:text-blue-600"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default FloatingDropdown

// 'use client'

// import { useState } from 'react'

// interface Option {
//   value: string
//   label: string
// }

// interface FloatingDropdownProps {
//   label: string
//   options: Option[]
//   value?: string
//   onChange?: (value: string) => void
//   error?: string
//   required?: boolean
//   showEmptyOption?: boolean
//   emptyOptionLabel?: string
//   disabled?: boolean
// }

// const FloatingDropdown = ({
//   label,
//   options,
//   value = '',
//   onChange,
//   error,
//   required = false,
//   showEmptyOption = true,
//   emptyOptionLabel = 'Select an option',
//   disabled = false
// }: FloatingDropdownProps) => {
//   const [isFocused, setIsFocused] = useState(false)

//   const hasValue = value !== ''
//   const active = isFocused || hasValue

//   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     onChange?.(e.target.value)
//   }

//   return (
//     <div className="relative w-full">
//       <select
//         value={value}
//         onChange={handleChange}
//         onFocus={() => setIsFocused(true)}
//         onBlur={() => setIsFocused(false)}
//         disabled={disabled}
//         className={`w-full px-4 pt-5 pb-2 border rounded-md outline-none transition-all appearance-none ${
//           disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
//         } ${
//           error
//             ? "border-red-500 focus:border-red-500"
//             : "border-gray-300 focus:border-blue-500"
//         }`}
//       >
//         {showEmptyOption && <option value="">{emptyOptionLabel}</option>}
//         {options.map((option) => (
//           <option key={option.value} value={option.value}>
//             {option.label}
//           </option>
//         ))}
//       </select>

//       <label
//         className={`absolute left-3 px-1 bg-white text-sm transition-all pointer-events-none ${
//           active
//             ? "-top-2 text-xs"
//             : "top-3 text-sm text-gray-500"
//         } ${error ? "text-red-500" : isFocused ? "text-blue-600" : "text-gray-600"}`}
//       >
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>

//       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
//         <svg
//           className="w-4 h-4 text-gray-400"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </svg>
//       </div>

//       {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
//     </div>
//   )
// }

// export default FloatingDropdown
