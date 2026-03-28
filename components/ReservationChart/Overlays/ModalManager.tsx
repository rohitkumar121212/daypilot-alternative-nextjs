import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { ActiveModal, SchedulerModalType } from '@/hooks/useModalState'

// All modals are lazy-loaded — they are never needed on initial render, only
// after a user interaction. This keeps the initial JS bundle small.
const CreateBookingModal   = dynamic(() => import('@/components/ReservationChart/Modals/CreateBookingModal/CreateBookingModal'), { ssr: false, loading: () => null })
const BookingDetailsModal  = dynamic(() => import('@/components/ReservationChart/Overlays/BookingDetailsModal'), { ssr: false, loading: () => null })
const BookingContextMenu   = dynamic(() => import('@/components/ReservationChart/Overlays/BookingContextMenu'), { ssr: false, loading: () => null })
const ResourceContextMenu  = dynamic(() => import('@/components/ReservationChart/Overlays/ResourceContextMenu'), { ssr: false, loading: () => null })
const BookingChangeConfirmModal = dynamic(() => import('@/components/ReservationChart/Overlays/BookingChangeConfirmModal'), { ssr: false, loading: () => null })
const SplitBookingModal    = dynamic(() => import('@/components/ReservationChart/Overlays/SplitBookingModal'), { ssr: false, loading: () => null })
const SkipCheckInModal     = dynamic(() => import('@/components/ReservationChart/Overlays/SkipCheckInModal'), { ssr: false, loading: () => null })
const CheckInModal         = dynamic(() => import('@/components/ReservationChart/Overlays/BookingDetailsModal/CheckInModal'), { ssr: false, loading: () => null })
const CancelCheckInModal   = dynamic(() => import('@/components/ReservationChart/Overlays/CancelCheckInModal'), { ssr: false, loading: () => null })

interface ContextMenuState {
  isOpen: boolean
  position: { x: number; y: number }
  booking: any
}

interface ResourceContextMenuState {
  isOpen: boolean
  position: { x: number; y: number }
  resource: any
}

interface ChangeConfirmationState {
  isOpen: boolean
  data: any
}

interface ModalManagerProps {
  // ── Create-booking modal (driven by click-drag selection) ─────────────────
  createBookingOpen: boolean
  selection: any
  selectedResource: any
  onCreateBookingClose: () => void
  onCreateBookingConfirm: (bookingData: any) => void

  // ── Booking-action modals (details, split, skip/check-in, cancel) ─────────
  activeModal: ActiveModal | null
  openModal: (type: SchedulerModalType, booking: any, tab?: string) => void
  closeModal: () => void
  onDetailsClose: () => void
  onSplitBooking: (splitData: any) => void

  // ── Context menus ──────────────────────────────────────────────────────────
  contextMenu: ContextMenuState
  onContextMenuClose: () => void
  onContextMenuAction: (action: string) => void
  resourceContextMenu: ResourceContextMenuState
  onResourceContextMenuClose: () => void
  onResourceContextMenuAction: (action: string) => void

  // ── Drag-and-drop confirmation ─────────────────────────────────────────────
  changeConfirmation: ChangeConfirmationState
  onConfirmChange: () => void
  onCancelChange: () => void

  // ── Shared data ────────────────────────────────────────────────────────────
  resources: any[]
}

/**
 * ModalManager
 *
 * Single location for every overlay rendered by the scheduler — modals,
 * context menus, and the drag-confirmation dialog. No state lives here;
 * everything is driven by props from Scheduler's hooks.
 *
 * Keeping all overlays in one component means:
 *  - The container's render section stays clean (one line instead of ~110)
 *  - Adding or removing a modal has a single, obvious place to edit
 *  - Each modal is still lazy-loaded so the initial bundle is unaffected
 */
const ModalManager = ({
  createBookingOpen,
  selection,
  selectedResource,
  onCreateBookingClose,
  onCreateBookingConfirm,
  activeModal,
  openModal,
  closeModal,
  onDetailsClose,
  onSplitBooking,
  contextMenu,
  onContextMenuClose,
  onContextMenuAction,
  resourceContextMenu,
  onResourceContextMenuClose,
  onResourceContextMenuAction,
  changeConfirmation,
  onConfirmChange,
  onCancelChange,
  resources,
}: ModalManagerProps) => {
  return (
    <>
      {/* ── Create booking (opened by click-drag on the grid) ─────────────── */}
      {createBookingOpen && (
        <Suspense fallback={null}>
          <CreateBookingModal
            isOpen={createBookingOpen}
            selection={selection}
            resource={selectedResource}
            onClose={onCreateBookingClose}
            onConfirm={onCreateBookingConfirm}
          />
        </Suspense>
      )}

      {/* ── Booking details ───────────────────────────────────────────────── */}
      {activeModal?.type === 'details' && (
        <Suspense fallback={null}>
          <BookingDetailsModal
            isOpen={true}
            booking={activeModal.booking}
            onClose={onDetailsClose}
            initialTab={activeModal.tab ?? 'details'}
            onCancelBooking={(booking) => openModal('cancel-check-in', booking)}
            onOpenCheckInModal={(booking) => openModal('check-in', booking)}
          />
        </Suspense>
      )}

      {/* ── Booking right-click context menu ──────────────────────────────── */}
      {contextMenu.isOpen && (
        <Suspense fallback={null}>
          <BookingContextMenu
            isOpen={contextMenu.isOpen}
            position={contextMenu.position}
            onClose={onContextMenuClose}
            onAction={onContextMenuAction}
          />
        </Suspense>
      )}

      {/* ── Resource (apartment) right-click context menu ─────────────────── */}
      {resourceContextMenu.isOpen && (
        <Suspense fallback={null}>
          <ResourceContextMenu
            isOpen={resourceContextMenu.isOpen}
            position={resourceContextMenu.position}
            resource={resourceContextMenu.resource}
            onClose={onResourceContextMenuClose}
            onAction={onResourceContextMenuAction}
          />
        </Suspense>
      )}

      {/* ── Drag-and-drop move confirmation ───────────────────────────────── */}
      {changeConfirmation.isOpen && (
        <Suspense fallback={null}>
          <BookingChangeConfirmModal
            isOpen={changeConfirmation.isOpen}
            changeData={changeConfirmation.data}
            onConfirm={onConfirmChange}
            onCancel={onCancelChange}
          />
        </Suspense>
      )}

      {/* ── Split booking ─────────────────────────────────────────────────── */}
      {activeModal?.type === 'split' && (
        <Suspense fallback={null}>
          <SplitBookingModal
            isOpen={true}
            booking={activeModal.booking}
            resources={resources}
            onSplit={onSplitBooking}
            onClose={closeModal}
          />
        </Suspense>
      )}

      {/* ── Skip check-in ─────────────────────────────────────────────────── */}
      {activeModal?.type === 'skip-check-in' && (
        <Suspense fallback={null}>
          <SkipCheckInModal
            isOpen={true}
            booking={activeModal.booking}
            resources={resources}
            onSkip={closeModal}
            onClose={closeModal}
          />
        </Suspense>
      )}

      {/* ── Check-in ──────────────────────────────────────────────────────── */}
      {activeModal?.type === 'check-in' && (
        <Suspense fallback={null}>
          <CheckInModal
            isOpen={true}
            booking={activeModal.booking}
            onCheckIn={closeModal}
            onClose={closeModal}
          />
        </Suspense>
      )}

      {/* ── Cancel check-in ───────────────────────────────────────────────── */}
      {activeModal?.type === 'cancel-check-in' && (
        <Suspense fallback={null}>
          <CancelCheckInModal
            isOpen={true}
            booking={activeModal.booking}
            resources={resources}
            onCancel={closeModal}
            onClose={closeModal}
          />
        </Suspense>
      )}
    </>
  )
}

export default ModalManager
