import { useCallback } from 'react'

export const useModalState = (onClose: Function) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  return {
    handleBackdropClick
  }
}