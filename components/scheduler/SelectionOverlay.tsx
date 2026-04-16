import React from 'react'
import { getDateIndex, daysBetween } from './utils/dateUtils'

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

  @keyframes conflictPulse {
    0%, 100% {
      box-shadow:
        inset 0 0 0 1px rgba(239, 68, 68, 0.4),
        0 4px 12px rgba(239, 68, 68, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    50% {
      box-shadow:
        inset 0 0 0 1px rgba(239, 68, 68, 0.6),
        0 6px 16px rgba(239, 68, 68, 0.3),
        0 0 0 2px rgba(255, 255, 255, 0.2);
    }
  }

  .selection-overlay { animation: selectionPulse 2s ease-in-out infinite; }
  .selection-overlay-conflict { animation: conflictPulse 2s ease-in-out infinite; }
`

const SelectionOverlay = ({ selection, dates, cellWidth = 100, rowHeight = 60 }) => {
  if (!selection || !selection.startDate || !selection.endDate) return null

  const startIndex = getDateIndex(selection.startDate, dates)
  let endIndex = getDateIndex(selection.endDate, dates)

  if (startIndex === -1) return null
  // endDate may be +1 day beyond the visible range (single-date click on last date) — clamp to last date
  if (endIndex === -1) endIndex = startIndex

  const minIndex = Math.min(startIndex, endIndex)
  const maxIndex = Math.max(startIndex, endIndex)
  const span = maxIndex - minIndex + 1

  const left = minIndex * cellWidth
  const width = span * cellWidth
  const isConflict = !!selection.hasConflict

  return (
    <>
      <style jsx>{selectionStyles}</style>

      <div
        className={`absolute top-0 bottom-0 pointer-events-none z-30 transition-all duration-200 ${
          isConflict ? 'selection-overlay-conflict' : 'selection-overlay'
        }`}
        style={{
          left: `${left}px`,
          width: `${width}px`,
          height: `${rowHeight}px`,
          background: isConflict
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(252, 165, 165, 0.4))'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 197, 253, 0.4))',
          border: isConflict ? '2px solid #EF4444' : '2px solid #3B82F6',
          borderRadius: '6px',
        }}
      />
    </>
  )
}

export default SelectionOverlay

