export const toFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })
  
  return formData
}
