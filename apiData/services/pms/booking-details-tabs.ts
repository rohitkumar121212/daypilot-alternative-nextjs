import { fetchUtils } from '@/utils/fetchUtils'
import type { ApiResponse } from '@/apiData/types/api'

export const addNewBookingPayment = (formData: FormData) =>
  fetchUtils.post<ApiResponse>('/api/proxy/add-payment', formData)
