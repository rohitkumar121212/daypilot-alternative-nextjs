interface ActionButtonsProps {
  onSave: () => void
  onClose: () => void
}

const ActionButtons = ({ onSave, onClose }: ActionButtonsProps) => {
  return (
    <div className="mt-6 flex justify-start gap-3">
      <button
        onClick={onSave}
        className="btn btn-primary-with-bg"
      >
        Save
      </button>
      <button
        onClick={onClose}
        className="btn btn-primary"
      >
        Close
      </button>
    </div>
  )
}

export default ActionButtons