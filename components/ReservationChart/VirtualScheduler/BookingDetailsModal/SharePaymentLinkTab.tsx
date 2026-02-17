const SharePaymentLinkTab = () => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Link</label>
        <div className="flex gap-2">
          <input type="text" className="flex-1 border border-gray-300 rounded px-3 py-2" value="https://payment.link/abc123" readOnly />
          <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Copy</button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Send via Email</label>
        <input type="email" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter email address" />
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Send Link</button>
    </div>
  )
}

export default SharePaymentLinkTab
