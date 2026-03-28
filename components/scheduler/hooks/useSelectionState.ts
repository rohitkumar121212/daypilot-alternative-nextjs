import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import dayjs from 'dayjs'

interface UseSelectionStateParams {
  visibleRows: any[]
  dates: string[]
  bookingsByResourceId?: Map<string, any[]>
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
  bookingsByResourceId,
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

      const finalStartDate = selection.startDate <= selection.endDate ? selection.startDate : selection.endDate
      const finalEndDate = selection.startDate <= selection.endDate ? selection.endDate : selection.startDate

      // Block selection if it overlaps an existing booking in this row.
      // Hotel convention: checkout day is free, so overlap = bookingStart < selectionEnd && bookingEnd > selectionStart
      const resourceBookings = bookingsByResourceId?.get(String(selection.resourceId)) || []
      const hasConflict = resourceBookings.some(booking => {
        const bookingStart = booking.startDate || booking.start
        const bookingEnd = booking.endDate || booking.end
        return bookingStart < finalEndDate && bookingEnd > finalStartDate
      })

      setSelection(null)
      if (!hasConflict) {
        onTimeRangeSelect?.({ ...selection, startDate: finalStartDate, endDate: finalEndDate })
      }
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isSelecting, selection, bookingsByResourceId, onTimeRangeSelect])

  // ─── Live conflict check — drives the red overlay during drag ────────────────
  const selectionWithConflict = useMemo(() => {
    if (!selection) return null
    const s = selection.startDate <= selection.endDate ? selection.startDate : selection.endDate
    const e = selection.startDate <= selection.endDate ? selection.endDate : selection.startDate
    const resourceBookings = bookingsByResourceId?.get(String(selection.resourceId)) || []
    const hasConflict = resourceBookings.some(booking => {
      const bookingStart = booking.startDate || booking.start
      const bookingEnd = booking.endDate || booking.end
      return bookingStart < e && bookingEnd > s
    })
    return { ...selection, hasConflict }
  }, [selection, bookingsByResourceId])

  return { selection: selectionWithConflict, handleCellMouseDown, handleCellMouseEnter }
}
