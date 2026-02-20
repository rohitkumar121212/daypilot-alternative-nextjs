import { apiClient } from '@/apiData/lib/axios'
import type { ApiResponse } from '@/apiData/types/api'

export const addNewBookingPayment = (formData: FormData) =>
  apiClient.post<ApiResponse>('/aperfect-pms/add-new-booking-payment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const sharePaymentLink = (data: { bookingId: string, amount: number, email: string, notes?: string }) =>
  apiClient.post<ApiResponse>('/aperfect-pms/share-payment-link', data)
