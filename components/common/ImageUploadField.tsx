'use client'

import { useEffect, useRef, useState } from 'react'

const MAX_TOTAL_SIZE_MB = 5
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024
const MAX_IMAGES = 4

interface ImageUploadFieldProps {
  label?: string
  onChange: (files: File[]) => void
}

type PreviewFile = {
  file: File
  previewUrl: string
}

export default function ImageUploadField({ label = 'Attach Images', onChange }: ImageUploadFieldProps) {
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([])
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Revoke object URLs on unmount to free memory
  useEffect(() => {
    return () => {
      previewFiles.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl))
    }
  }, [])

  const handleFileChange = () => {
    const selected = Array.from(inputRef.current?.files || [])
    const merged = [...previewFiles.map(p => p.file), ...selected]

    if (inputRef.current) inputRef.current.value = ''

    if (merged.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images`)
      return
    }

    const totalSize = merged.reduce((sum, f) => sum + f.size, 0)
    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      setError(`Total size exceeds ${MAX_TOTAL_SIZE_MB}MB limit`)
      return
    }

    const newPreviews: PreviewFile[] = selected.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setError('')
    setPreviewFiles(prev => [...prev, ...newPreviews])
    onChange(merged)
  }

  const removeFile = (index: number) => {
    setPreviewFiles(prev => {
      URL.revokeObjectURL(prev[index].previewUrl)
      const updated = prev.filter((_, i) => i !== index)
      onChange(updated.map(p => p.file))
      return updated
    })
    setError('')
  }

  return (
    <div className="w-full">
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="peer w-full p-2 px-4 border border-gray-300 rounded-md outline-none transition-all bg-white focus:border-blue-500"
        />
        <label className="absolute left-3 px-1 bg-white text-xs -top-2 text-gray-600">
          {label}
        </label>
      </div>

      {previewFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {previewFiles.map(({ file, previewUrl }, index) => (
            <div key={previewUrl} className="relative group w-14 h-14 shrink-0">
              <img
                src={previewUrl}
                alt={file.name}
                className="w-full h-full object-cover rounded-md border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-1 text-xs text-gray-400">
        *Up to {MAX_IMAGES} images · Max total size {MAX_TOTAL_SIZE_MB}MB
      </p>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
