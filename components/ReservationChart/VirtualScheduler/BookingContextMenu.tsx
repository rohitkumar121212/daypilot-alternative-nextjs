const BookingContextMenu = ({ isOpen, position, onClose, onAction }) => {
  if (!isOpen) return null

  const menuItems = [
    { id: 'view', label: 'View Details', icon: '👁️' },
    { id: 'cancel', label: 'Cancel', icon: '❌' },
    { id: 'checkin', label: 'Check-in', icon: '✅' },
    { id: 'checkout', label: 'Check-out', icon: '🚪' },
    { id: 'edit', label: 'Edit', icon: '✏️' },
    { id: 'delete', label: 'Delete', icon: '🗑️' }
  ]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]"
        style={{ top: position.y, left: position.x }}
      >
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

export default BookingContextMenu
