import React, { useState } from 'react'

interface AutoSuggestionInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onSelect: (item: any) => void
  placeholder: string
  suggestions: any[]
  filterKey?: string
  displayKey: string
  secondaryDisplayKey?: string
  className?: string
}

const AutoSuggestionInput = ({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  suggestions,
  filterKey,
  displayKey,
  secondaryDisplayKey,
  className = ''
}: AutoSuggestionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  const handleChange = (inputValue: string) => {
    onChange(inputValue)
    
    if (inputValue.trim()) {
      const filtered = suggestions.filter(item => {
        const searchValue = filterKey ? item[filterKey] : item
        return searchValue?.toLowerCase().includes(inputValue.toLowerCase())
      })
      setFilteredSuggestions(filtered || [])
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions(suggestions)
      setShowSuggestions(true)
    }
  }

  const handleFocus = () => {
    if (!value.trim()) {
      setFilteredSuggestions(suggestions)
      setShowSuggestions(true)
    }
  }

  const handleSelect = (item: any) => {
    onSelect(item)
    setShowSuggestions(false)
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        autoComplete="off"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">
                {filterKey ? item[displayKey] : item}
              </div>
              {secondaryDisplayKey && item[secondaryDisplayKey] && (
                <div className="text-sm text-gray-500">
                  {item[secondaryDisplayKey]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AutoSuggestionInput
