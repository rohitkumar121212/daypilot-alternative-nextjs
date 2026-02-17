import FloatingLabelInput from '@/components/common/FloatingLabelInput'

const SharePaymentLinkTab = () => {
  return (
    <div className="space-y-4">
      <div>
        <FloatingLabelInput label="Payment Link" value="https://payment.link/abc123" readOnly />
        <button className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full">Copy Link</button>
      </div>
      <FloatingLabelInput label="Send via Email" type="email" placeholder=" " />
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Send Link</button>
    </div>
  )
}

export default SharePaymentLinkTab
