import { apiClient } from '@/apiData/lib/axios'
import type { ApiResponse } from '@/apiData/types/api'

export const getEvents = (params?: { start?: string; end?: string }) =>
  apiClient.get<ApiResponse>('/pms/events', { params })

export const getEventById = (id: string) =>
  apiClient.get<ApiResponse>(`/pms/events/${id}`)

export const createEvent = (data: any) =>
  apiClient.post<ApiResponse>('/pms/events', data)

export const updateEvent = (id: string, data: any) =>
  apiClient.put<ApiResponse>(`/pms/events/${id}`, data)

export const deleteEvent = (id: string) =>
  apiClient.delete<ApiResponse>(`/pms/events/${id}`)
