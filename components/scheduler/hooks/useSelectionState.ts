import { useState, useRef, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import { getDateIndex } from '../utils/dateUtils'

interface UseSelectionStateParams {
  visibleRows: any[]
  dates: string[]
  /** Called when the user finishes a drag-select. Consumer decides what to do (e.g. open a modal). */
  onTimeRangeSelect?: (selection: { resourceId: any; startDate: string; endDate: string }) => void
}

interface UseSelectionStateResult {
  /** Active selection — passed down to SelectionOverlay for the visual highlight */
  selection: any
  /** Attach to each date cell's onMouseDown */
  handleCellMouseDown: (date: string, resourceId: any, e: React.MouseEvent) => void
  /** Attach to each date cell's onMouseEnter */
  handleCellMouseEnter: (date: string, resourceId: any) => void
}

/**
 * useSelectionState
 *
 * Manages the click-drag-to-select interaction on the grid:
 *  - mousedown on a date cell starts a selection
 *  - mouseenter on cells extends the selection end date
 *  - mouseup finalises date order and fires onTimeRangeSelect
 *
 * The selection visual is cleared immediately after the callback fires —
 * the consumer owns what happens next (modal, form, etc.).
 */
export function useSelectionState({
  visibleRows,
  dates,
  onTimeRangeSelect,
}: UseSelectionStateParams): UseSelectionStateResult {

  const [selection, setSelection] = useState<any>(null)
  const [isSelecting, setIsSelecting] = useState(false)

  const mouseDownRef = useRef(false)
  const startResourceIdRef = useRef<any>(null)

  // ─── Start selection ────────────────────────────────────────────────────────
  const handleCellMouseDown = useCallback((date: string, resourceId: any, e: React.MouseEvent) => {
    e.preventDefault()
    const resource = visibleRows.find(r => r.id === resourceId)
    if (resource?.type === 'parent') return

    mouseDownRef.current = true
    startResourceIdRef.current = resourceId

    setIsSelecting(true)
    setSelection({
      resourceId,
      startDate: date,
      endDate: dayjs(date).add(1, 'day').format('YYYY-MM-DD'),
    })
  }, [visibleRows])

  // ─── Extend selection ───────────────────────────────────────────────────────
  const handleCellMouseEnter = useCallback((date: string, resourceId: any) => {
    if (!mouseDownRef.current || !isSelecting) return
    if (resourceId !== startResourceIdRef.current) return
    setSelection((prev: any) => prev ? { ...prev, endDate: date } : null)
  }, [isSelecting])

  // ─── Finalise on mouseup ────────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseUp = () => {
      if (!mouseDownRef.current || !isSelecting || !selection) return

      mouseDownRef.current = false
      setIsSelecting(false)

      const startIndex = getDateIndex(selection.startDate, dates)
      const endIndex = getDateIndex(selection.endDate, dates)
      const finalStartDate = startIndex <= endIndex ? selection.startDate : selection.endDate
      const finalEndDate = startIndex <= endIndex ? selection.endDate : selection.startDate

      onTimeRangeSelect?.({ ...selection, startDate: finalStartDate, endDate: finalEndDate })
      setSelection(null)
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isSelecting, selection, dates, onTimeRangeSelect])

  return { selection, handleCellMouseDown, handleCellMouseEnter }
}
