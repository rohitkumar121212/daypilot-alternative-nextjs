import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import { getDateIndex } from '@/utils/dateUtils'

interface UseSelectionStateParams {
  visibleRows: any[]
  dates: string[]
  onBookingCreate: ((bookingData: any) => void) | undefined
}

interface UseSelectionStateResult {
  /** The active date-range selection (null when not selecting) */
  selection: any
  /** Whether the create-booking modal is open */
  modalOpen: boolean
  /** The resource the current selection is on — passed to CreateBookingModal */
  selectedResource: any
  /** Attach to each date cell's onMouseDown */
  handleCellMouseDown: (date: string, resourceId: any, e: React.MouseEvent) => void
  /** Attach to each date cell's onMouseEnter */
  handleCellMouseEnter: (date: string, resourceId: any) => void
  /** Call when the create-booking modal is closed without saving */
  handleModalClose: () => void
  /** Call when the create-booking modal confirms — creates the booking and closes */
  handleBookingConfirm: (bookingData: any) => void
}

/**
 * useSelectionState
 *
 * Manages all state and event handling for the click-drag-to-create-booking
 * interaction:
 *  - mousedown on a date cell starts a selection
 *  - mousemove (via mouseenter on cells) extends the selection end date
 *  - mouseup on document finalises the date order and opens the create modal
 *  - handleModalClose / handleBookingConfirm tear down selection state
 *
 * Nothing in here fires on scroll or on booking drag — it is purely the
 * "draw a box to create a booking" concern.
 */
export function useSelectionState({
  visibleRows,
  dates,
  onBookingCreate,
}: UseSelectionStateParams): UseSelectionStateResult {

  const [selection, setSelection] = useState<any>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Refs avoid stale-closure issues in the global mouseup listener and let
  // handleCellMouseEnter check isSelecting without being in its dep array.
  const mouseDownRef = useRef(false)
  const startDateRef = useRef<string | null>(null)
  const startResourceIdRef = useRef<any>(null)

  // ─── Start selection ────────────────────────────────────────────────────────
  const handleCellMouseDown = useCallback((date: string, resourceId: any, e: React.MouseEvent) => {
    e.preventDefault()
    const resource = visibleRows.find(r => r.id === resourceId)
    if (resource?.type === 'parent') return  // can't book on a building row

    mouseDownRef.current = true
    startDateRef.current = date
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
    if (resourceId !== startResourceIdRef.current) return  // don't cross rows
    setSelection((prev: any) => prev ? { ...prev, endDate: date } : null)
  }, [isSelecting])

  // ─── Finalise selection on mouseup ─────────────────────────────────────────
  // Registered on window so it fires even if the cursor leaves the scheduler.
  // Uses getDateIndex to normalise drag direction (right-to-left vs left-to-right).
  useEffect(() => {
    const handleMouseUp = () => {
      if (!mouseDownRef.current || !isSelecting || !selection) return

      mouseDownRef.current = false
      setIsSelecting(false)

      const startIndex = getDateIndex(selection.startDate, dates)
      const endIndex = getDateIndex(selection.endDate, dates)
      const finalStartDate = startIndex <= endIndex ? selection.startDate : selection.endDate
      const finalEndDate = startIndex <= endIndex ? selection.endDate : selection.startDate

      setSelection({ ...selection, startDate: finalStartDate, endDate: finalEndDate })
      setModalOpen(true)
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isSelecting, selection, dates])

  // ─── Close modal (cancel) ───────────────────────────────────────────────────
  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelection(null)
    mouseDownRef.current = false
    setIsSelecting(false)
  }, [])

  // ─── Confirm booking (save) ─────────────────────────────────────────────────
  const handleBookingConfirm = useCallback((bookingData: any) => {
    onBookingCreate?.(bookingData)
    setModalOpen(false)
    setSelection(null)
    mouseDownRef.current = false
    setIsSelecting(false)
  }, [onBookingCreate])

  // ─── Derive selected resource for CreateBookingModal ───────────────────────
  // visibleRows is derived from resources so every resource is reachable here —
  // no need to walk the resources tree separately.
  const selectedResource = useMemo(() => {
    if (!selection) return null
    return visibleRows.find(r => r.id === selection.resourceId) ?? null
  }, [selection, visibleRows])

  return {
    selection,
    modalOpen,
    selectedResource,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleModalClose,
    handleBookingConfirm,
  }
}
