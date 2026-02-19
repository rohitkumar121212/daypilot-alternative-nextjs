import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import DateHeader from './DateHeader'
import ResourceRow from './ResourceRow'
import CreateBookingModal from '../Modals/CreateBookingModal/CreateBookingModal'
import BookingDetailsModal from './BookingDetailsModal'
import BookingContextMenu from './BookingContextMenu'
import ResourceContextMenu from './ResourceContextMenu'
import BookingChangeConfirmModal from './BookingChangeConfirmModal'
import SplitBookingModal from './SplitBookingModal'
import SkipCheckInModal from './SkipCheckInModal'
import CancelCheckInModal from './CancelCheckInModal'
import { generateDateRange, getDateIndex } from '@/utils/dateUtils'

/**
 * SimpleVirtualScheduler - Basic virtual scrolling without external dependencies
 */
const VirtualScheduler = ({
  resources = [],
  bookings = [],
  availability = null,
  onBookingCreate,
  onBookingUpdate,
  onResourcesChange,
  startDate = null,
  daysToShow = 30,
  cellWidth = 100,
  rowHeight = 60,
  className = ""
}) => {
  const dates = useMemo(() => generateDateRange(daysToShow, startDate), [daysToShow, startDate])
  
  // Process availability data
  const { availabilityByResource, totalAvailabilityByDate, availabilityByParent } = useMemo(() => {
    const byResource = {}
    const byDate = {}
    const byParent = {}
    
    if (!availability) return { availabilityByResource: byResource, totalAvailabilityByDate: byDate, availabilityByParent: byParent }
    
    // Process total availability
    availability.total_availability?.forEach(item => {
      const [available, total] = item.availibility.split('/').map(Number)
      byDate[item.date] = { available, total }
    })
    
    // Process building-wise availability
    availability.building_wise_availability?.forEach(building => {
      building.date_range?.forEach(dateItem => {
        const [available, total] = dateItem.availibility.split('/').map(Number)
        const key = `${building.building_id}-${dateItem.date}`
        byParent[key] = { available, total }
      })
    })
    
    return { availabilityByResource: byResource, totalAvailabilityByDate: byDate, availabilityByParent: byParent }
  }, [availability])
  
  // Selection state
  const [selection, setSelection] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  
  // Booking details state
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailsModalInitialTab, setDetailsModalInitialTab] = useState('details')
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, booking: null })
  
  // Resource context menu state
  const [resourceContextMenu, setResourceContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, resource: null })
  
  // Drag state
  const [dragState, setDragState] = useState(null)
  
  // Change confirmation state
  const [changeConfirmation, setChangeConfirmation] = useState({ isOpen: false, data: null })
  
  // Split booking state
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [bookingToSplit, setBookingToSplit] = useState(null)
  
  // Skip check-in state
  const [skipCheckInModalOpen, setSkipCheckInModalOpen] = useState(false)
  const [bookingToSkip, setBookingToSkip] = useState(null)
  
  // Cancel check-in state
  const [cancelCheckInModalOpen, setCancelCheckInModalOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState(null)
  
  // Container ref for dynamic sizing
  const containerRef = useRef(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  
  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setContainerDimensions({ width, height })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // Virtual scrolling state
  const [scrollTop, setScrollTop] = useState(0)
  
  // Track mouse state
  const mouseDownRef = useRef(false)
  const startDateRef = useRef(null)
  const startResourceIdRef = useRef(null)
  
  // Refs for scroll synchronization
  const headerScrollRef = useRef(null)
  const timelineScrollRef = useRef(null)
  const isScrollingRef = useRef(false)
  
  // Normalize hierarchical resources into flat visibleRows array
  const visibleRows = useMemo(() => {
    return resources.flatMap(parent => {
      const parentRow = {
        ...parent,
        type: 'parent',
        isParent: true
      }
      
      if (!parent.expanded) {
        return [parentRow]
      }
      
      const childRows = (parent.children || []).map(child => ({
        ...child,
        parentId: parent.id,
        parentName: parent.name,
        type: 'child',
        isParent: false
      }))
      
      return [parentRow, ...childRows]
    })
  }, [resources])
  
  // Virtual scrolling calculations - use dynamic container height
  const containerHeight = containerDimensions.height - 60 // Account for header height
  const totalHeight = visibleRows.length * rowHeight
  const startIndex = Math.floor(scrollTop / rowHeight)
  const endIndex = Math.min(startIndex + Math.ceil(containerHeight / rowHeight) + 1, visibleRows.length)
  const visibleItems = visibleRows.slice(startIndex, endIndex)
  
  // Handle scroll - sync both sides
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop
    setScrollTop(newScrollTop)
    
    // Sync scroll between resource column and timeline
    if (e.target.classList.contains('resource-scroll')) {
      const timelineScroll = document.querySelector('.timeline-scroll')
      if (timelineScroll && timelineScroll.scrollTop !== newScrollTop) {
        timelineScroll.scrollTop = newScrollTop
      }
    } else if (e.target.classList.contains('timeline-scroll')) {
      const resourceScroll = document.querySelector('.resource-scroll')
      if (resourceScroll && resourceScroll.scrollTop !== newScrollTop) {
        resourceScroll.scrollTop = newScrollTop
      }
    }
  }, [])
  
  // Handle mousedown on a date cell
  const handleCellMouseDown = useCallback((date, resourceId, e) => {
    e.preventDefault()
    
    // Find the resource to check if it's a parent
    const resource = visibleRows.find(r => r.id === resourceId)
    if (resource?.type === 'parent') {
      return // Don't allow selection on parent rows
    }
    
    mouseDownRef.current = true
    startDateRef.current = date
    startResourceIdRef.current = resourceId
    
    setIsSelecting(true)
    setSelection({
      resourceId,
      startDate: date,
      endDate: date
    })
  }, [visibleRows])
  
  // Handle mouseenter on a date cell
  const handleCellMouseEnter = useCallback((date, resourceId, e) => {
    if (!mouseDownRef.current || !isSelecting) return
    if (resourceId !== startResourceIdRef.current) return
    
    setSelection(prev => {
      if (!prev) return null
      return {
        ...prev,
        endDate: date
      }
    })
  }, [isSelecting])
  
  // Handle mouseup
  useEffect(() => {
    const handleMouseUp = (e) => {
      if (mouseDownRef.current && isSelecting && selection) {
        mouseDownRef.current = false
        setIsSelecting(false)
        
        const startIndex = getDateIndex(selection.startDate, dates)
        const endIndex = getDateIndex(selection.endDate, dates)
        
        const finalStartDate = startIndex <= endIndex ? selection.startDate : selection.endDate
        const finalEndDate = startIndex <= endIndex ? selection.endDate : selection.startDate
        
        setSelection({
          ...selection,
          startDate: finalStartDate,
          endDate: finalEndDate
        })
        
        setTimeout(() => {
          setModalOpen(true)
        }, 100)
      }
    }
    
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isSelecting, selection, dates])
  
  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelection(null)
    mouseDownRef.current = false
    setIsSelecting(false)
  }, [])
  
  // Handle booking confirmation
  const handleBookingConfirm = useCallback((bookingData) => {
    if (onBookingCreate) {
      onBookingCreate(bookingData)
    }
    handleModalClose()
  }, [onBookingCreate, handleModalClose])
  
  // Handle booking click
  const handleBookingClick = useCallback((booking) => {
    setSelectedBooking(booking)
    setDetailsModalOpen(true)
  }, [])
  
  // Handle details modal close
  const handleDetailsModalClose = useCallback(() => {
    setDetailsModalOpen(false)
    setSelectedBooking(null)
    setDetailsModalInitialTab('details')
  }, [])
  
  // Handle booking right-click
  const handleBookingRightClick = useCallback((booking, position) => {
    setContextMenu({ isOpen: true, position, booking })
  }, [])
  
  // Handle context menu action
  const handleContextMenuAction = useCallback((action) => {
    const booking = contextMenu.booking
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, booking: null })
    
    if (action === 'logs') {
      // window.location.href = `https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/logs`
       window.open(
      `https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/logs`,
      '_blank',
      'noopener,noreferrer'
    )
    } else if (action === 'view') {
      // window.location.href = `https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/view-details`
       window.open(
      `https://aperfectstay.ai/aperfect-pms/booking/${booking?.id}/view-details`,
      '_blank',
      'noopener,noreferrer'
    )
    } else if (action === 'split') {
      setBookingToSplit(booking)
      setSplitModalOpen(true)
    } else if (action === 'skip') {
      setBookingToSkip(booking)
      setSkipCheckInModalOpen(true)
    } else if (action === 'cancel-check-in') {
      setBookingToCancel(booking)
      setCancelCheckInModalOpen(true)
    } else if (action === 'new-task') {
      setSelectedBooking(booking)
      setDetailsModalOpen(true)
      setDetailsModalInitialTab('task')
    } else if (action === 'new-case') {
      setSelectedBooking(booking)
      setDetailsModalOpen(true)
      setDetailsModalInitialTab('case')
    } else {
      console.log(`Action: ${action} on booking:`, booking)
    }
  }, [contextMenu.booking])
  
  // Handle booking drag start
  const handleBookingDragStart = useCallback((booking, e) => {
    setDragState({
      draggedBooking: booking,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY
    })
  }, [])
  
  // Handle drag move
  useEffect(() => {
    if (!dragState) return
    
    const handleMouseMove = (e) => {
      setDragState(prev => ({
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY
      }))
    }
    
    const handleMouseUp = (e) => {
      const target = document.elementFromPoint(e.clientX, e.clientY)
      const dateCell = target?.closest('[data-date]')
      
      if (dateCell && dragState.draggedBooking) {
        const newStartDate = dateCell.getAttribute('data-date')
        const newResourceId = dateCell.getAttribute('data-resource-id')
        
        if (newStartDate && newResourceId) {
          const startIndex = getDateIndex(dragState.draggedBooking.startDate, dates)
          const endIndex = getDateIndex(dragState.draggedBooking.endDate, dates)
          const duration = endIndex - startIndex
          
          const newEndDate = dayjs(newStartDate).add(duration, 'day').format('YYYY-MM-DD')
          
          // Find resource name
          let newResourceName = newResourceId
          for (const parent of resources) {
            const child = (parent.children || []).find(c => c.id === newResourceId)
            if (child) {
              newResourceName = child.name
              break
            }
          }
          
          const updatedBooking = {
            ...dragState.draggedBooking,
            startDate: newStartDate,
            endDate: newEndDate,
            resourceId: newResourceId
          }
          
          // Show confirmation modal
          setChangeConfirmation({
            isOpen: true,
            data: {
              booking: updatedBooking,
              newResourceId,
              newResourceName,
              newStartDate,
              newEndDate,
              user: 'Aperfect Stay'
            }
          })
        }
      }
      
      setDragState(null)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, dates, resources])
  
  // Handle change confirmation
  const handleConfirmChange = useCallback(() => {
    if (changeConfirmation.data?.booking) {
      onBookingUpdate?.(changeConfirmation.data.booking)
    }
    setChangeConfirmation({ isOpen: false, data: null })
  }, [changeConfirmation.data, onBookingUpdate])
  
  const handleCancelChange = useCallback(() => {
    setChangeConfirmation({ isOpen: false, data: null })
  }, [])
  
  // Handle split booking
  const handleSplitBooking = useCallback((splitData) => {
    const { originalBooking, splitDate, newApartmentId } = splitData
    
    // booking1: moves to new apartment (from original start to splitDate)
    const booking1 = {
      ...originalBooking,
      id: Date.now(), // Generate new ID for the moved part
      startDate: originalBooking.startDate,
      endDate: splitDate,
      resourceId: newApartmentId,
      backColor: '#5BCAC8'
    }
    
    // booking2: stays in original apartment (from splitDate+1 to original end)
    const booking2 = {
      ...originalBooking,
      id: originalBooking.id,
      startDate: dayjs(splitDate).add(1, 'day').format('YYYY-MM-DD'),
      endDate: originalBooking.endDate,
      backColor: '#5BCAC8'
    }
    
    // Update bookings
    onBookingUpdate?.(booking2)
    onBookingCreate?.(booking1)
    
    setSplitModalOpen(false)
    setBookingToSplit(null)
  }, [bookings, onBookingUpdate, onBookingCreate])
  
  // Handle skip check-in
  const handleSkipCheckIn = useCallback((skipData) => {
    console.log('Skip check-in confirmed:', skipData)
    setSkipCheckInModalOpen(false)
    setBookingToSkip(null)
  }, [])
  
  // Handle cancel check-in
  const handleCancelCheckIn = useCallback((cancelData) => {
    console.log('Cancel check-in confirmed:', cancelData)
    setCancelCheckInModalOpen(false)
    setBookingToCancel(null)
  }, [])
  
  // Handle resource right-click
  const handleResourceRightClick = useCallback((resource, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Close any existing context menu first
    setResourceContextMenu({ isOpen: false, position: { x: 0, y: 0 }, resource: null })
    
    // Open new context menu after a brief delay to ensure previous one is closed
    setTimeout(() => {
      setResourceContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        resource
      })
    }, 10)
  }, [])
  
  // Handle resource context menu action
  const handleResourceContextMenuAction = useCallback((action) => {
    const resource = resourceContextMenu.resource
    setResourceContextMenu({ isOpen: false, position: { x: 0, y: 0 }, resource: null })
    
    console.log(`Resource action: ${action} on resource:`, resource)
    // Add your resource action handlers here
  }, [resourceContextMenu.resource])
  
  // Handle parent expand/collapse toggle
  const handleToggleExpand = useCallback((parentId) => {
    const updatedResources = resources.map(parent => {
      if (parent.id === parentId) {
        return { ...parent, expanded: !parent.expanded }
      }
      return parent
    })
    
    if (onResourcesChange) {
      onResourcesChange(updatedResources)
    }
  }, [resources, onResourcesChange])
  
  // Get selected resource
  const selectedResource = useMemo(() => {
    if (!selection) return null
    
    const visibleRow = visibleRows.find(r => r.id === selection.resourceId)
    if (visibleRow) return visibleRow
    
    for (const parent of resources) {
      if (parent.id === selection.resourceId) return parent
      const child = (parent.children || []).find(c => c.id === selection.resourceId)
      if (child) return child
    }
    
    return null
  }, [selection, visibleRows, resources])
  
  // Sync horizontal scrolling
  const handleHeaderScroll = useCallback((e) => {
    if (isScrollingRef.current) return
    isScrollingRef.current = true
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft = e.target.scrollLeft
    }
    requestAnimationFrame(() => {
      isScrollingRef.current = false
    })
  }, [])
  
  const handleTimelineScroll = useCallback((e) => {
    if (isScrollingRef.current) return
    isScrollingRef.current = true
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.target.scrollLeft
    }
    requestAnimationFrame(() => {
      isScrollingRef.current = false
    })
  }, [])
  
  return (
    <div ref={containerRef} className={`w-full h-full flex flex-col bg-white select-none ${className}`}>
      {/* Header Row */}
      <div className="flex border-b border-gray-300 bg-gray-50 sticky top-0 z-30 shadow-sm">
        <div className="w-64 min-w-64 border-r border-gray-200 bg-gray-50 sticky left-0 z-40 flex items-center justify-center font-semibold text-gray-700">
          Resources
        </div>
        
        <div 
          ref={headerScrollRef}
          className="flex overflow-x-auto overflow-y-hidden hide-scrollbar"
          onScroll={handleHeaderScroll}
        >
          <div className="flex">
            {dates.map(date => (
              <DateHeader
                key={date}
                date={date}
                cellWidth={cellWidth}
                totalAvailability={totalAvailabilityByDate[date] || null}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Virtual Body Container */}
      <div className="flex-1 flex">
        {/* Resource Column */}
        <div className="w-64 min-w-64 border-r border-gray-200 bg-white sticky left-0 z-20">
          <div 
            className="overflow-y-auto resource-scroll"
            style={{ height: containerHeight }}
            onScroll={handleScroll}
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              {visibleItems.map((row, index) => {
                return (
                  <div
                    key={row.id}
                    className={`absolute w-full border-b border-gray-200 bg-white flex items-center hover:bg-gray-50 ${
                      row.type === 'parent' 
                        ? 'font-semibold bg-gray-50' 
                        : 'pl-8 text-gray-700'
                    }`}
                    style={{ 
                      height: rowHeight,
                      top: (startIndex + index) * rowHeight
                    }}
                    {...(row.type === 'child' && { onContextMenu: (e) => handleResourceRightClick(row, e) })}
                  >
                    {row.type === 'parent' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleExpand(row.id)
                        }}
                        className="mr-2 p-1 hover:bg-gray-200 rounded flex-shrink-0"
                      >
                        <svg
                          className={`w-4 h-4 text-gray-600 transform ${
                            row.expanded ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                    {row.type === 'child' && <span className="w-6 flex-shrink-0" />}
                    <span className="flex-1 truncate text-sm">{row.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div 
          ref={timelineScrollRef}
          className="flex-1 overflow-x-auto hide-scrollbar"
          onScroll={handleTimelineScroll}
        >
          <div style={{ minWidth: dates.length * cellWidth }}>
            <div 
              className="overflow-y-auto timeline-scroll hide-scrollbar"
              style={{ height: containerHeight }}
              onScroll={handleScroll}
            >
              <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleItems.map((row, index) => (
                  <div
                    key={row.id}
                    className="absolute w-full"
                    style={{ 
                      height: rowHeight,
                      top: (startIndex + index) * rowHeight
                    }}
                  >
                    <ResourceRow
                      resource={row}
                      dates={dates}
                      bookings={bookings}
                      selection={selection}
                      dragState={dragState}
                      availabilityData={availabilityByResource}
                      availabilityByParent={availabilityByParent}
                      onCellMouseDown={handleCellMouseDown}
                      onCellMouseEnter={handleCellMouseEnter}
                      onBookingClick={handleBookingClick}
                      onBookingRightClick={handleBookingRightClick}
                      onBookingDragStart={handleBookingDragStart}
                      cellWidth={cellWidth}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      <CreateBookingModal
        isOpen={modalOpen}
        selection={selection}
        resource={selectedResource}
        onClose={handleModalClose}
        onConfirm={handleBookingConfirm}
      />
      
      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={detailsModalOpen}
        booking={selectedBooking}
        onClose={handleDetailsModalClose}
        initialTab={detailsModalInitialTab}
      />
      
      {/* Context Menu */}
      <BookingContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, booking: null })}
        onAction={handleContextMenuAction}
      />
      
      {/* Resource Context Menu */}
      <ResourceContextMenu
        isOpen={resourceContextMenu.isOpen}
        position={resourceContextMenu.position}
        resource={resourceContextMenu.resource}
        onClose={() => setResourceContextMenu({ isOpen: false, position: { x: 0, y: 0 }, resource: null })}
        onAction={handleResourceContextMenuAction}
      />
      
      {/* Change Confirmation Modal */}
      <BookingChangeConfirmModal
        isOpen={changeConfirmation.isOpen}
        changeData={changeConfirmation.data}
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
      />
      
      {/* Split Booking Modal */}
      <SplitBookingModal
        isOpen={splitModalOpen}
        booking={bookingToSplit}
        resources={resources}
        onSplit={handleSplitBooking}
        onClose={() => {
          setSplitModalOpen(false)
          setBookingToSplit(null)
        }}
      />
      
      {/* Skip Check-In Modal */}
      <SkipCheckInModal
        isOpen={skipCheckInModalOpen}
        booking={bookingToSkip}
        resources={resources}
        onSkip={handleSkipCheckIn}
        onClose={() => {
          setSkipCheckInModalOpen(false)
          setBookingToSkip(null)
        }}
      />
      
      {/* Cancel Check-In Modal */}
      <CancelCheckInModal
        isOpen={cancelCheckInModalOpen}
        booking={bookingToCancel}
        resources={resources}
        onCancel={handleCancelCheckIn}
        onClose={() => {
          setCancelCheckInModalOpen(false)
          setBookingToCancel(null)
        }}
      />
    </div>
  )
}

export default VirtualScheduler