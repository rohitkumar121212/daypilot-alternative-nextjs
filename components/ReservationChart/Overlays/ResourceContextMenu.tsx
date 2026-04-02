import { proxyFetch } from '@/utils/proxyFetch'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'

const ResourceContextMenu = ({ isOpen, position, resource, onClose, onAction, refreshData, openModal }) => {
  if (!isOpen) return null

  const handleStatusChange = async (status) => {
    try {
      await proxyFetch('/api/aperfect-pms/change-property-cleaning-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prop_id: resource?.id,
          status,
          response_version: 'v1'
        })
      })
      onAction(status)
      // Refresh data after successful status change
      if (refreshData) {
        refreshData()
      }
    } catch (error) {
      console.error('Failed to update cleaning status:', error)
    }
  }

  const handleViewAction = (actionId) => {
    // Handle URL-based actions
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'
    let url = ''
    
    switch (actionId) {
      case 'view-offered-details':
        url = `${baseUrl}/aperfect-pms/amenities/details/${resource?.id}`
        break
      case 'view-cases-and-tasks':
        url = `${baseUrl}/manage-pms/prop-abbreviation/${resource?.id}/general-report`
        break
      case 'view-address-and-details':
        openModal('address-details', resource)
        return
      default:
        console.log('Unknown view action:', actionId)
        return
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    onAction(actionId)
  }

  const statusActions = ['dirty', 'touch_up', 'clean', 'repair', 'inspect', 'dnr', 'house_use']
  const viewActions = ['view-offered-details', 'view-cases-and-tasks', 'view-address-and-details']

  const getMenuItems = () => {
    if (resource?.type === 'parent') {
      // Building/Parent options
      return [
        { id: 'view-building', label: 'View Building Details', icon: '🏢' },
        { id: 'edit-building', label: 'Edit Building', icon: '✏️' },
        { id: 'add-apartment', label: 'Add New Apartment', icon: '➕' },
        { id: 'building-reports', label: 'Building Reports', icon: '📊' }
      ]
    } else {
      // Apartment/Child options
      return [
        { id: 'dirty', label: 'Dirty', icon: '🧹' },
        { id: 'touch_up', label: 'Touch Up', icon: '🖌️' },
        { id: 'clean', label: 'Clean', icon: '✅' },
        { id: 'repair', label: 'Repair', icon: '🔧' },
        { id: 'inspect', label: 'Inspect', icon: '🔍' },
        { id: 'dnr', label: 'DNR', icon: '🚫' },
        { id: 'house_use', label: 'House Use', icon: '🏠' },
        { id: 'view-offered-details', label: 'View Offered Details', icon: '👁️' },
        { id: 'view-cases-and-tasks', label: 'View Cases & Tasks', icon: '📋' },
        { id: 'view-address-and-details', label: 'View Address & Details', icon: '📍' },
      ]
    }
  }

  const menuItems = getMenuItems()

  // Calculate position with collision detection
  const getAdjustedPosition = () => {
    const menuWidth = 180
    const menuHeight = menuItems.length * 40 + 60 // Approximate height
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 20

    let adjustedX = position.x
    let adjustedY = position.y

    // Check right edge collision
    if (position.x + menuWidth + padding > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - padding
    }

    // Check left edge collision
    if (adjustedX < padding) {
      adjustedX = padding
    }

    // Check bottom edge collision
    if (position.y + menuHeight + padding > viewportHeight) {
      adjustedY = viewportHeight - menuHeight - padding
    }

    // Check top edge collision
    if (adjustedY < padding) {
      adjustedY = padding
    }

    return { x: adjustedX, y: adjustedY }
  }

  const adjustedPosition = getAdjustedPosition()

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]"
        style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
      >
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-medium text-gray-600">
            {resource?.type === 'parent' ? 'Building' : 'Apartment'}: {resource?.name}
          </span>
        </div>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (statusActions.includes(item.id)) {
                handleStatusChange(item.id)
              } else if (viewActions.includes(item.id)) {
                handleViewAction(item.id)
              } else {
                onAction(item.id)
              }
              onClose()
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}

export default ResourceContextMenu