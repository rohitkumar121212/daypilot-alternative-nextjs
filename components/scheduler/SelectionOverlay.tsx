import React from 'react'
import { getDateIndex, daysBetween } from '@/utils/dateUtils'

// Add CSS animation styles
const selectionStyles = `
  @keyframes selectionPulse {
    0%, 100% { 
      box-shadow: 
        inset 0 0 0 1px rgba(59, 130, 246, 0.4),
        0 4px 12px rgba(59, 130, 246, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    50% { 
      box-shadow: 
        inset 0 0 0 1px rgba(59, 130, 246, 0.6),
        0 6px 16px rgba(59, 130, 246, 0.3),
        0 0 0 2px rgba(255, 255, 255, 0.2);
    }
  }
  
  .selection-overlay {
    animation: selectionPulse 2s ease-in-out infinite;
  }
`

/**
 * SelectionOverlay - Visual overlay for selected date range
 * @param {Object} props
 * @param {Object} props.selection - Selection object with resourceId, startDate, endDate
 * @param {Array<string>} props.dates - Array of all dates in the timeline
 * @param {number} props.cellWidth - Width of each date cell
 * @param {number} props.rowHeight - Height of the row (dynamic based on overbooking)
 */
const SelectionOverlay = ({ selection, dates, cellWidth = 100, rowHeight = 60 }) => {
  if (!selection || !selection.startDate || !selection.endDate) return null
  
  const startIndex = getDateIndex(selection.startDate, dates)
  const endIndex = getDateIndex(selection.endDate, dates)
  
  if (startIndex === -1 || endIndex === -1) return null
  
  const minIndex = Math.min(startIndex, endIndex)
  const maxIndex = Math.max(startIndex, endIndex)
  const span = maxIndex - minIndex + 1
  
  const left = minIndex * cellWidth
  const width = span * cellWidth
  
  return (
    <>
      {/* Inject CSS styles */}
      <style jsx>{selectionStyles}</style>
      
      <div
        className="absolute top-0 bottom-0 pointer-events-none z-30 transition-all duration-200 selection-overlay"
        style={{
          left: `${left}px`,
          width: `${width}px`,
          height: `${rowHeight}px`,
          // Customizable selection styling
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 197, 253, 0.4))',
          border: '2px solid #3B82F6',
          borderRadius: '6px',
          boxShadow: `
            inset 0 0 0 1px rgba(59, 130, 246, 0.4),
            0 4px 12px rgba(59, 130, 246, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
          // Add subtle animation
          animation: 'selectionPulse 2s ease-in-out infinite'
        }}
      />
    </>
  )
}

export default SelectionOverlay

