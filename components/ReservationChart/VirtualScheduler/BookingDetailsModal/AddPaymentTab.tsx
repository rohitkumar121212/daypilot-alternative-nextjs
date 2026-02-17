import FloatingLabelInput from '@/components/common/FloatingLabelInput'
import FloatingLabelSelect from '@/components/common/FloatingLabelSelect'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'

const AddPaymentTab = () => {
  return (
    <div className="space-y-4">
      <FloatingLabelInput label="Amount" type="number" placeholder=" " />
      <FloatingLabelSelect label="Payment Method">
        <option value=""></option>
        <option value="credit">Credit Card</option>
        <option value="cash">Cash</option>
        <option value="bank">Bank Transfer</option>
      </FloatingLabelSelect>
      <FloatingLabelTextarea label="Notes" rows={3} />
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Payment</button>
    </div>
  )
}

export default AddPaymentTab
