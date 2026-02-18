import { useState } from 'react'

interface FloatingInputProps {
  label: string
  value?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  type?: string
  readOnly?: boolean
  placeholder?: string
}

export function FloatingInput({
  label,
  value = '',
  onChange,
  error,
  required = false,
  type = "text",
  readOnly = false,
  placeholder = ""
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const hasValue = value && value.length > 0
  const active = isFocused || hasValue || type === 'file' || type === 'date' || type === 'time' || type === 'datetime-local'

  return (
    <div className="relative w-full">
      <input
        type={type}
        value={type === 'file' ? undefined : value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`peer w-full p-2 px-4 border rounded-md outline-none transition-all
          ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
      />

      <label
        className={`absolute left-3 px-1 bg-white text-sm transition-all pointer-events-none
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

export default FloatingInput
