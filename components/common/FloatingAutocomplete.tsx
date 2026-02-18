'use client'

import { useState, useRef, useEffect } from 'react'

interface FloatingAutocompleteProps {
  label: string
  value: string
  onChange: (value: string) => void
  onSelect: (item: any) => void
  suggestions: any[]
  filterKey: string
  displayKey: string
  secondaryDisplayKey?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const FloatingAutocomplete = ({
  label,
  value,
  onChange,
  onSelect,
  suggestions,
  filterKey,
  displayKey,
  secondaryDisplayKey,
  error,
  required = false,
  disabled = false
}: FloatingAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasValue = value !== ''

  const filteredSuggestions = suggestions.filter(item =>
    item[filterKey]?.toLowerCase().includes(value.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: any) => {
    onSelect(item)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setIsOpen(true)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          setIsFocused(true)
          setIsOpen(true)
        }}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={`peer w-full p-2 px-4 border rounded-md outline-none transition-all
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          ${
            error
              ? "border-red-500"
              : isFocused ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          }`}
      />

      <label
        className={`absolute left-3 px-1 bg-white transition-all pointer-events-none
        ${
          hasValue || isFocused
            ? "-top-2 text-xs"
            : "top-3 text-sm text-gray-500"
        }
        ${
          error
            ? "text-red-500"
            : isFocused ? "text-blue-600" : "text-gray-600"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              className="px-4 py-2.5 cursor-pointer transition-colors text-gray-700 hover:bg-gray-50"
            >
              <div className="font-medium">{item[displayKey]}</div>
              {secondaryDisplayKey && item[secondaryDisplayKey] && (
                <div className="text-xs text-gray-500">{item[secondaryDisplayKey]}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default FloatingAutocomplete
