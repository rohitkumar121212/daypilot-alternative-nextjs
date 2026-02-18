'use client'

import { useState } from 'react'

interface FloatingInputWithPrefixProps {
  label: string
  prefix: string
  value?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  type?: string
  readOnly?: boolean
}

const FloatingInputWithPrefix = ({
  label,
  prefix,
  value = '',
  onChange,
  error,
  required = false,
  type = "text",
  readOnly = false
}: FloatingInputWithPrefixProps) => {
  const [isFocused, setIsFocused] = useState(false)

  const hasValue = value && value.length > 0
  const active = isFocused || hasValue
  const showPrefix = isFocused || hasValue

  return (
    <div className="relative w-full">
      {showPrefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={readOnly}
        className={`peer w-full ${showPrefix ? 'pl-8' : 'pl-4'} p-2 border rounded-md outline-none transition-all
          ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
      />

      <label
        className={`absolute ${showPrefix ? 'left-8' : 'left-3'} px-1 bg-white text-sm transition-all pointer-events-none
          ${
            active
              ? "-top-2 text-xs"
              : "top-3 text-sm text-gray-500"
          }
          ${error ? "text-red-500" : isFocused ? "text-blue-600" : "text-gray-600"}
        `}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

export default FloatingInputWithPrefix
