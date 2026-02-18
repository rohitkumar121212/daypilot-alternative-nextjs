'use client'

import { useState, useRef, useEffect } from 'react'

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
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const hasValue = value !== ''
  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault()
      const currentIndex = options.findIndex(opt => opt.value === value)
      const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
      onChange?.(options[nextIndex].value)
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault()
      const currentIndex = options.findIndex(opt => opt.value === value)
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
      onChange?.(options[prevIndex].value)
    }
  }

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        ref={buttonRef}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`peer w-full p-2 px-4 border rounded-md outline-none transition-all cursor-pointer
        ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
        ${
          error
            ? "border-red-500"
            : isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`}
      >
        <span className={hasValue ? 'text-gray-900' : 'text-transparent'}>
          {selectedOption?.label || 'Select'}
        </span>
      </div>

      {/* Floating Label */}
      <label
        className={`absolute left-3 px-1 bg-white transition-all pointer-events-none
        ${
          hasValue || isOpen
            ? "-top-2 text-xs"
            : "top-3 text-sm text-gray-500"
        }
        ${
          error
            ? "text-red-500"
            : isOpen ? "text-blue-600" : "text-gray-600"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Arrow */}
      <div className="absolute right-3 top-3 pointer-events-none">
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option) => (
            <div
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-2.5 cursor-pointer transition-colors
                ${value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}
              `}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default FloatingDropdown
