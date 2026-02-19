const ResourceContextMenu = ({ isOpen, position, resource, onClose, onAction }) => {
  if (!isOpen) return null

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
        { id: 'view-apartment', label: 'View Apartment Details', icon: '🏠' },
        { id: 'edit-apartment', label: 'Edit Apartment', icon: '✏️' },
        { id: 'maintenance', label: 'Schedule Maintenance', icon: '🔧' },
        { id: 'block-dates', label: 'Block Dates', icon: '🚫' },
        { id: 'apartment-reports', label: 'Apartment Reports', icon: '📈' }
      ]
    }
  }

  const menuItems = getMenuItems()

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]"
        style={{ top: position.y, left: position.x }}
      >
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-medium text-gray-600">
            {resource?.type === 'parent' ? 'Building' : 'Apartment'}: {resource?.name}
          </span>
        </div>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onAction(item.id)}
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