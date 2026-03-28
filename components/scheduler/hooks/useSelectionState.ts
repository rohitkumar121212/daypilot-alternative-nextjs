import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import dayjs from 'dayjs'

const SCROLL_ZONE = 80   // px from container edge where auto-scroll activates
const MAX_SCROLL_SPEED = 15  // px per frame at the very edge

interface UseSelectionStateParams {
  visibleRows: any[]
  dates: string[]
  bookingsByResourceId?: Map<string, any[]>
  scrollContainerRef?: React.RefObject<HTMLDivElement>
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
 * Auto-scroll: when the mouse is within SCROLL_ZONE px of the right or left
 * edge of the scroll container during a drag, the container scrolls and the
 * selection extends to cover the newly visible dates.
 *
 * The selection visual is cleared immediately after the callback fires —
 * the consumer owns what happens next (modal, form, etc.).
 */
export function useSelectionState({
  visibleRows,
  dates,
  bookingsByResourceId,
  scrollContainerRef,
  onTimeRangeSelect,
}: UseSelectionStateParams): UseSelectionStateResult {

  const [selection, setSelection] = useState<any>(null)
  const [isSelecting, setIsSelecting] = useState(false)

  const mouseDownRef = useRef(false)
  const startResourceIdRef = useRef<any>(null)
  const mouseXRef = useRef(0)
  const mouseYRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)
  const isSelectingRef = useRef(false)

  // ─── Start selection ────────────────────────────────────────────────────────
  const handleCellMouseDown = useCallback((date: string, resourceId: any, e: React.MouseEvent) => {
    e.preventDefault()
    const resource = visibleRows.find(r => r.id === resourceId)
    if (resource?.type === 'parent') return

    mouseDownRef.current = true
    startResourceIdRef.current = resourceId
    isSelectingRef.current = true

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

  // ─── Track mouse position during drag ───────────────────────────────────────
  useEffect(() => {
    if (!isSelecting) return
    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX
      mouseYRef.current = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isSelecting])

  // ─── Auto-scroll RAF loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSelecting || !scrollContainerRef) return

    isSelectingRef.current = true

    const loop = () => {
      if (!isSelectingRef.current) return

      const container = scrollContainerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        const mouseX = mouseXRef.current
        const mouseY = mouseYRef.current

        // Compute scroll speed proportional to proximity to the edge
        let scrollDelta = 0
        const rightDist = rect.right - mouseX
        const leftDist = mouseX - rect.left

        if (rightDist >= 0 && rightDist < SCROLL_ZONE) {
          scrollDelta = Math.ceil(MAX_SCROLL_SPEED * (1 - rightDist / SCROLL_ZONE))
        } else if (leftDist >= 0 && leftDist < SCROLL_ZONE) {
          scrollDelta = -Math.ceil(MAX_SCROLL_SPEED * (1 - leftDist / SCROLL_ZONE))
        }

        if (scrollDelta !== 0) {
          container.scrollLeft += scrollDelta

          // After scrolling, find which date cell is now under the mouse
          const el = document.elementFromPoint(mouseX, mouseY)
          const cell = el?.closest?.('[data-date]') as HTMLElement | null
          const date = cell?.getAttribute('data-date')
          const resourceId = cell?.getAttribute('data-resource-id')

          if (date && String(resourceId) === String(startResourceIdRef.current)) {
            setSelection((prev: any) => prev ? { ...prev, endDate: date } : null)
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(loop)
    }

    rafIdRef.current = requestAnimationFrame(loop)

    return () => {
      isSelectingRef.current = false
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [isSelecting, scrollContainerRef])

  // ─── Finalise on mouseup ────────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseUp = () => {
      if (!mouseDownRef.current || !isSelecting || !selection) return

      mouseDownRef.current = false
      isSelectingRef.current = false
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
