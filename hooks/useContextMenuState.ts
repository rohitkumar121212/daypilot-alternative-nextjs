import { useState, useCallback } from 'react'
import { SchedulerModalType } from '@/hooks/useModalState'

interface ContextMenu {
  isOpen: boolean
  position: { x: number; y: number }
  booking: any
}

interface ResourceContextMenu {
  isOpen: boolean
  position: { x: number; y: number }
  resource: any
}

const CLOSED_CONTEXT_MENU: ContextMenu = { isOpen: false, position: { x: 0, y: 0 }, booking: null }
const CLOSED_RESOURCE_CONTEXT_MENU: ResourceContextMenu = { isOpen: false, position: { x: 0, y: 0 }, resource: null }

interface UseContextMenuStateParams {
  /** Used by handleContextMenuAction to open booking-action modals */
  openModal: (type: SchedulerModalType, booking: any, tab?: string) => void
}

interface UseContextMenuStateResult {
  contextMenu: ContextMenu
  resourceContextMenu: ResourceContextMenu
  /** Open the booking context menu at a specific position */
  handleBookingRightClick: (booking: any, position: { x: number; y: number }) => void
  /** Dispatch a context menu action (logs, view, split, skip, etc.) */
  handleContextMenuAction: (action: string) => void
  /** Close the booking context menu */
  handleContextMenuClose: () => void
  /** Open the resource (apartment) context menu */
  handleResourceRightClick: (resource: any, e: React.MouseEvent) => void
  /** Dispatch a resource context menu action */
  handleResourceContextMenuAction: (action: string) => void
  /** Close the resource context menu */
  handleResourceContextMenuClose: () => void
}

/**
 * useContextMenuState
 *
 * Manages state and handlers for both right-click context menus in the scheduler:
 *  - Booking context menu (right-click on a booking block)
 *  - Resource context menu (right-click on an apartment label)
 *
 * Context menu actions that open modals call `openModal` from useModalState,
 * keeping the two concerns separated — this hook owns the menu UI state,
 * useModalState owns the modal UI state.
 */
export function useContextMenuState({ openModal }: UseContextMenuStateParams): UseContextMenuStateResult {
  const [contextMenu, setContextMenu] = useState<ContextMenu>(CLOSED_CONTEXT_MENU)
  const [resourceContextMenu, setResourceContextMenu] = useState<ResourceContextMenu>(CLOSED_RESOURCE_CONTEXT_MENU)

  // ─── Booking context menu ────────────────────────────────────────────────────
  const handleBookingRightClick = useCallback((booking: any, position: { x: number; y: number }) => {
    setContextMenu({ isOpen: true, position, booking })
  }, [])

  const handleContextMenuAction = useCallback((action: string) => {
    const booking = contextMenu.booking
    setContextMenu(CLOSED_CONTEXT_MENU)

    if (action === 'logs') {
      window.open(`https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/logs`, '_blank', 'noopener,noreferrer')
    } else if (action === 'view') {
      window.open(`https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/view-details`, '_blank', 'noopener,noreferrer')
    } else if (action === 'split') {
      openModal('split', booking)
    } else if (action === 'skip') {
      openModal('skip-check-in', booking)
    } else if (action === 'cancel-check-in') {
      openModal('cancel-check-in', booking)
    } else if (action === 'new-task') {
      openModal('details', booking, 'task')
    } else if (action === 'new-case') {
      openModal('details', booking, 'case')
    }
  }, [contextMenu.booking, openModal])

  const handleContextMenuClose = useCallback(() => {
    setContextMenu(CLOSED_CONTEXT_MENU)
  }, [])

  // ─── Resource context menu ───────────────────────────────────────────────────
  const handleResourceRightClick = useCallback((resource: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResourceContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY }, resource })
  }, [])

  const handleResourceContextMenuAction = useCallback((_action: string) => {
    setResourceContextMenu(CLOSED_RESOURCE_CONTEXT_MENU)
  }, [])

  const handleResourceContextMenuClose = useCallback(() => {
    setResourceContextMenu(CLOSED_RESOURCE_CONTEXT_MENU)
  }, [])

  return {
    contextMenu,
    resourceContextMenu,
    handleBookingRightClick,
    handleContextMenuAction,
    handleContextMenuClose,
    handleResourceRightClick,
    handleResourceContextMenuAction,
    handleResourceContextMenuClose,
  }
}
