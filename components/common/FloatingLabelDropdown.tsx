'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Option {
  value: string
  label: string
}

interface FloatingLabelDropdownProps {
  label: string
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  className?: string
  showEmptyOption?: boolean
  emptyOptionLabel?: string
  disabled?: boolean
}

const FloatingLabelDropdown = ({
  label,
  options,
  value = '',
  onChange,
  error,
  className = '',
  showEmptyOption = true,
  emptyOptionLabel = 'Select an option',
  disabled = false
}: FloatingLabelDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)
  const hasValue = value !== ''

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  const dropdownList = isOpen ? (
    <div 
      style={{
        position: 'absolute',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999
      }}
      className="mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
    >
      {showEmptyOption && (
        <div
          onClick={() => handleSelect('')}
          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-gray-400"
        >
          {emptyOptionLabel}
        </div>
      )}
      {options.map((option) => (
        <div
          key={option.value}
          onClick={() => handleSelect(option.value)}
          className={`px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors ${
            value === option.value ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-900'
          }`}
        >
          {option.label}
        </div>
      ))}
    </div>
  ) : null

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`peer w-full px-3 pt-5 pb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
        >
          <span className={hasValue ? 'text-gray-900' : 'text-transparent'}>
            {selectedOption?.label || emptyOptionLabel}
          </span>
        </div>

        <label
          className={`absolute left-3 transition-all pointer-events-none ${
            hasValue || isOpen ? 'top-1.5 text-xs text-gray-600' : 'top-3.5 text-base text-gray-400'
          }`}
        >
          {label}
        </label>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      {typeof document !== 'undefined' && createPortal(dropdownList, document.body)}
    </>
  )
}

export default FloatingLabelDropdown
