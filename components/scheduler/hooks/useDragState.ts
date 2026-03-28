import { useState, useRef, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'

interface DragState {
  draggedBooking: any
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export interface BookingMoveData {
  booking: any
  newResourceId: string
  newResourceName: string
  newStartDate: string
  newEndDate: string
}

interface UseDragStateParams {
  dateIndexMap: Map<string, number>
  resources: any[]
  /** Called when the user drops a booking. Consumer decides whether to confirm/apply the change. */
  onBookingMove?: (moveData: BookingMoveData) => void
}

interface UseDragStateResult {
  /** Current drag position — passed to BookingBlock for the ghost visual */
  dragState: DragState | null
  /** Attach to BookingBlock mousedown to start a drag */
  handleBookingDragStart: (booking: any, e: React.MouseEvent) => void
}

/**
 * useDragState
 *
 * Manages drag-and-drop booking moves:
 *  - mousedown on a booking starts the drag
 *  - mousemove updates the ghost position (RAF-throttled to ~60fps)
 *  - mouseup resolves the drop target and fires onBookingMove with the
 *    proposed new dates — the consumer decides whether to apply the change
 *
 * RAF throttling: without it every pixel of mouse movement calls setDragState
 * which re-renders the entire virtualised list. With RAF, updates are capped
 * at the display refresh rate, eliminating jank on fast drags.
 */
export function useDragState({
  dateIndexMap,
  resources,
  onBookingMove,
}: UseDragStateParams): UseDragStateResult {

  const [dragState, setDragState] = useState<DragState | null>(null)
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
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null)
      })
    }

    const handleMouseUp = (e: MouseEvent) => {
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

          let newResourceName = newResourceId
          for (const parent of resources) {
            const child = (parent.children || []).find((c: any) => c.id === newResourceId)
            if (child) { newResourceName = child.name; break }
          }

          onBookingMove?.({
            booking: { ...dragState.draggedBooking, startDate: newStartDate, endDate: newEndDate, resourceId: newResourceId },
            newResourceId,
            newResourceName,
            newStartDate,
            newEndDate,
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
  }, [dragState, dateIndexMap, resources, onBookingMove])

  return { dragState, handleBookingDragStart }
}
