import { apiClient } from '@/apiData/lib/axios'
import type { ApiResponse } from '@/apiData/types/api'

export const getBookings = (params?: { start?: string; end?: string }) =>
  apiClient.get<ApiResponse>('/pms/bookings', { params })

export const getBookingById = (id: string) =>
  apiClient.get<ApiResponse>(`/pms/bookings/${id}`)

export const createBooking = (data: any) =>
  apiClient.post<ApiResponse>('/pms/bookings', data)

export const updateBooking = (id: string, data: any) =>
  apiClient.put<ApiResponse>(`/pms/bookings/${id}`, data)

export const deleteBooking = (id: string) =>
  apiClient.delete<ApiResponse>(`/pms/bookings/${id}`)
