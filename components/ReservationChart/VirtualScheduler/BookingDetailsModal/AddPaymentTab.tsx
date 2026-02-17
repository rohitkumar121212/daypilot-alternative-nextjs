import FloatingLabelInput from '@/components/common/FloatingLabelInput'
import FloatingLabelDropdown from '@/components/common/FloatingLabelDropdown'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'
import { PAYMENT_METHODS_LIST } from '@/constants/constant'

interface AddPaymentTabProps {
  acceptedBy?: string
}

const AddPaymentTab = ({ acceptedBy = 'John Doe' }: AddPaymentTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingLabelInput label="Amount" type="number" placeholder=" " />
        <FloatingLabelDropdown 
          label="Payment Method" 
          options={PAYMENT_METHODS_LIST}
          showEmptyOption={true}
          emptyOptionLabel="Select payment method"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingLabelInput label="Reference No." type="text" placeholder=" " />
        <FloatingLabelInput label="Accepted By" type="text" value={acceptedBy} readOnly />
      </div>
      <FloatingLabelInput label="Receipt" type="file" placeholder=" " />
      <FloatingLabelTextarea label="Notes" rows={3} />
      <div className="flex gap-2">
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Add Payment</button>
        <button className="border border-gray-300 text-red-500 px-4 py-2 rounded hover:bg-gray-50">Close</button>
      </div>
    </div>
  )
}

export default AddPaymentTab
