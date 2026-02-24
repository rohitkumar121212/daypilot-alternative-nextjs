'use client'

import { useState } from 'react'
import { tokenManager } from '@/apiData/lib/axios'

export default function DevTokenSetter() {
  const [token, setToken] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSetToken = () => {
    if (token.trim()) {
      tokenManager.setAccessToken(token.trim())
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      setToken('')
    }
  }

  const handleClearTokens = () => {
    tokenManager.clearTokens()
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="text-sm font-semibold mb-2">Dev: Set Access Token</h3>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste access token here"
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
        />
        <button
          onClick={handleSetToken}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Set
        </button>
      </div>
      <button
        onClick={handleClearTokens}
        className="w-full px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Tokens
      </button>
      {showSuccess && (
        <div className="mt-2 text-xs text-green-600">✓ Success</div>
      )}
    </div>
  )
}
