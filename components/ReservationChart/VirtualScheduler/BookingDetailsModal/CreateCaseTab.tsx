import FloatingLabelInput from '@/components/common/FloatingLabelInput'
import FloatingLabelSelect from '@/components/common/FloatingLabelSelect'
import FloatingLabelTextarea from '@/components/common/FloatingLabelTextarea'

const CreateCaseTab = () => {
  return (
    <div className="space-y-4">
      <FloatingLabelInput label="Case Title" type="text" placeholder=" " />
      <FloatingLabelSelect label="Priority">
        <option value=""></option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </FloatingLabelSelect>
      <FloatingLabelTextarea label="Description" rows={4} />
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Create Case</button>
    </div>
  )
}

export default CreateCaseTab
