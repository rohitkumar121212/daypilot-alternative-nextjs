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
  const [emailError, setEmailError] = useState('')

  const validateEmail = (email: string) => {
    if (!email) return ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? '' : 'Please enter a valid email address'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    
    // Prevent negative numbers for number inputs
    if (type === 'number' && parseFloat(newValue) < 0) {
      return
    }
    
    // Trim spaces for text inputs (but not for special types where spaces might be meaningful)
    // if (type === 'text' || type === 'email' || type === 'url') {
    //   newValue = newValue.trim()
    // }
    
    // Clear email error when user is typing
    if (type === 'email') {
      setEmailError('')
    }
    
    // Create a new event with trimmed value
    const trimmedEvent = {
      ...e,
      target: {
        ...e.target,
        value: newValue
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(trimmedEvent)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)



  let newValue = e.target.value

  // ✅ Trim only when user leaves the field
  if (type === 'text' || type === 'email' || type === 'url') {
    newValue = newValue.trim()
  }

  const trimmedEvent = {
    ...e,
    target: {
      ...e.target,
      value: newValue
    }
  } as unknown as React.ChangeEvent<HTMLInputElement>

  onChange(trimmedEvent)
    
    // Validate email on blur
    if (type === 'email' && value) {
      const validationError = validateEmail(value)
      setEmailError(validationError)
    }
  }

  const hasValue = value && value.length > 0
  const specialTypes = ['file', 'date', 'time', 'datetime-local']
  const active = isFocused || hasValue || specialTypes.includes(type)
  const displayError = error || emailError

  return (
    <div className="relative w-full">
      <input
        type={type}
        value={type === 'file' ? undefined : value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        readOnly={readOnly}
        placeholder={placeholder}
        min={type === 'number' ? '0' : undefined}
        className={`peer w-full p-2 px-4 border rounded-md outline-none transition-all
          ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          ${
            displayError
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
          ${displayError ? "text-red-500" : isFocused ? "text-blue-600" : "text-gray-600"}
        `}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {displayError && (
        <p className="mt-1 text-sm text-red-500">
          {displayError}
        </p>
      )}
    </div>
  )
}

export default FloatingInput
