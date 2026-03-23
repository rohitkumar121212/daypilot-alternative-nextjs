'use client'
import { useError } from '@/contexts/ErrorContext'
import { X, AlertTriangle, RefreshCw } from 'lucide-react'

const ErrorModal = () => {
  const { error, isVisible, hideError } = useError()

  if (!isVisible || !error) return null

  const handleRetry = () => {
    hideError()
    // You can add retry logic here if needed
    window.location.reload()
  }

  const getErrorIcon = (statusCode?: number) => {
    if (statusCode === 401) return '🔒'
    if (statusCode === 403) return '⛔'
    if (statusCode === 404) return '🔍'
    if (statusCode === 500) return '⚠️'
    return '❌'
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={hideError}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getErrorIcon(error.statusCode)}</span>
              <h2 className="text-xl font-semibold text-gray-900">
                {error.title}
              </h2>
            </div>
            <button
              onClick={hideError}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4 leading-relaxed">
              {error.message}
            </p>
            
            {/* Error Details */}
            {(error.statusCode || error.endpoint) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
                {error.statusCode && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Status Code:</span>
                    <span className="font-mono text-red-600">{error.statusCode}</span>
                  </div>
                )}
                {error.endpoint && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Endpoint:</span>
                    <span className="font-mono text-gray-800 truncate ml-2">{error.endpoint}</span>
                  </div>
                )}
                {error.timestamp && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="text-gray-800">{error.timestamp.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-0">
            <button
              onClick={hideError}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ErrorModal