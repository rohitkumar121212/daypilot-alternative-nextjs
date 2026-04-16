interface InstantMailCheckboxProps {
  sendInstantMail: boolean
  handleChange: (field: string, value: boolean) => void
}

const InstantMailCheckbox = ({ sendInstantMail, handleChange }: InstantMailCheckboxProps) => {
  return (
    <div className="mb-4">
      <label className="flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          id="send_instant_mail" 
          name="send_instant_mail"
          checked={sendInstantMail}
          onChange={(e) => handleChange('sendInstantMail', e.target.checked)}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">Send instant booking confirmation to guest via email</span>
      </label>
    </div>
  )
}

export default InstantMailCheckbox