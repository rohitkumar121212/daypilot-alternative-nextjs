import { useState, useRef, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'

interface DragState {
  draggedBooking: any
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface ChangeConfirmation {
  isOpen: boolean
  data: any
}

interface UseDragStateParams {
  dateIndexMap: Map<string, number>
  resources: any[]
  onBookingUpdate: ((booking: any) => void) | undefined
}

interface UseDragStateResult {
  /** Current drag position — passed down to ResourceRow/BookingBlock for visual ghost */
  dragState: DragState | null
  /** Confirmation modal state for the drag-and-drop change */
  changeConfirmation: ChangeConfirmation
  /** Call on BookingBlock mousedown to start a drag */
  handleBookingDragStart: (booking: any, e: React.MouseEvent) => void
  /** Call when the user confirms the booking move in the modal */
  handleConfirmChange: () => void
  /** Call when the user cancels the booking move in the modal */
  handleCancelChange: () => void
}

/**
 * useDragState
 *
 * Manages all state and event handling for drag-and-drop booking moves:
 *  - mousedown on a booking starts the drag
 *  - mousemove on document updates the drag ghost position (RAF-throttled)
 *  - mouseup on document resolves the drop target, computes new dates, and
 *    opens the BookingChangeConfirmModal
 *  - handleConfirmChange / handleCancelChange close the modal and optionally
 *    call onBookingUpdate
 *
 * RAF throttling: mousemove fires on every pixel of movement (~hundreds/sec).
 * Without throttling, each pixel calls setDragState which re-renders the
 * entire virtualised list. With requestAnimationFrame, updates are capped at
 * the display refresh rate (60fps), which is more than enough for visual
 * feedback and eliminates the jank.
 */
export function useDragState({
  dateIndexMap,
  resources,
  onBookingUpdate,
}: UseDragStateParams): UseDragStateResult {

  const [dragState, setDragState] = useState<DragState | null>(null)
  const [changeConfirmation, setChangeConfirmation] = useState<ChangeConfirmation>({ isOpen: false, data: null })

  const rafId = useRef<number>(0)

  // ─── Start drag ─────────────────────────────────────────────────────────────
  const handleBookingDragStart = useCallback((booking: any, e: React.MouseEvent) => {
    setDragState({
      draggedBooking: booking,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    })
  }, [])

  // ─── Track movement + resolve drop ──────────────────────────────────────────
  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e: MouseEvent) => {
      // RAF throttle — at most one setState per animation frame (~60fps).
      // Without this, every pixel fires a full React re-render of the
      // virtualised list and all its visible children.
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null)
      })
    }

    const handleMouseUp = (e: MouseEvent) => {
      // Cancel any pending RAF so we don't update position after drop
      cancelAnimationFrame(rafId.current)

      const target = document.elementFromPoint(e.clientX, e.clientY)
      const dateCell = target?.closest('[data-date]')

      if (dateCell && dragState.draggedBooking) {
        const newStartDate = dateCell.getAttribute('data-date')
        const newResourceId = dateCell.getAttribute('data-resource-id')

        if (newStartDate && newResourceId) {
          const startIndex = dateIndexMap.get(dragState.draggedBooking.startDate) ?? -1
          const endIndex = dateIndexMap.get(dragState.draggedBooking.endDate) ?? -1
          const duration = endIndex - startIndex
          const newEndDate = dayjs(newStartDate).add(duration, 'day').format('YYYY-MM-DD')

          // Find the human-readable resource name for the confirmation modal
          let newResourceName = newResourceId
          for (const parent of resources) {
            const child = (parent.children || []).find((c: any) => c.id === newResourceId)
            if (child) { newResourceName = child.name; break }
          }

          setChangeConfirmation({
            isOpen: true,
            data: {
              booking: { ...dragState.draggedBooking, startDate: newStartDate, endDate: newEndDate, resourceId: newResourceId },
              newResourceId,
              newResourceName,
              newStartDate,
              newEndDate,
              user: 'Aperfect Stay',
            },
          })
        }
      }

      setDragState(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      cancelAnimationFrame(rafId.current)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, dateIndexMap, resources])

  // ─── Confirm move ────────────────────────────────────────────────────────────
  const handleConfirmChange = useCallback(() => {
    if (changeConfirmation.data?.booking) onBookingUpdate?.(changeConfirmation.data.booking)
    setChangeConfirmation({ isOpen: false, data: null })
  }, [changeConfirmation.data, onBookingUpdate])

  // ─── Cancel move ─────────────────────────────────────────────────────────────
  const handleCancelChange = useCallback(() => {
    setChangeConfirmation({ isOpen: false, data: null })
  }, [])

  return {
    dragState,
    changeConfirmation,
    handleBookingDragStart,
    handleConfirmChange,
    handleCancelChange,
  }
}
