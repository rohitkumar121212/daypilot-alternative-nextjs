import { useState, useCallback } from 'react'

// All modal types managed by the scheduler — one active modal at a time.
// Context menus (bookingContextMenu, resourceContextMenu) are NOT included here
// because they carry position data and have separate open/close logic.
// The create-booking modal and drag confirmation modal are also separate — they
// are tightly coupled to selection state and drag state respectively, and will
// move with those hooks when those concerns are extracted.
export type SchedulerModalType =
  | 'details'
  | 'split'
  | 'skip-check-in'
  | 'check-in'
  | 'cancel-check-in'
  | 'address-details'

export interface ActiveModal {
  type: SchedulerModalType
  booking?: any
  resource?: any
  /** Only used by the 'details' modal to set the initial tab (e.g. 'task', 'case') */
  tab?: string
}

interface UseModalStateResult {
  activeModal: ActiveModal | null
  openModal: (type: SchedulerModalType, booking: any, tab?: string) => void
  closeModal: () => void
}

export function useModalState(): UseModalStateResult {
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null)

  const openModal = useCallback((type: SchedulerModalType, bookingOrResource: any, tab?: string) => {
    if (type === 'address-details') {
      setActiveModal({ type, resource: bookingOrResource, tab })
    } else {
      setActiveModal({ type, booking: bookingOrResource, tab })
    }
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  return { activeModal, openModal, closeModal }
}
