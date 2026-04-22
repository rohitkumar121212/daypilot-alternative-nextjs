import { fetchUtils } from '@/utils/fetchUtils'
import type { ApiResponse } from '@/apiData/types/api'

export const getEvents = (params?: { start?: string; end?: string }) => {
  const query = params ? `&${new URLSearchParams(params as Record<string, string>).toString()}` : ''
  return fetchUtils.get<ApiResponse>(`/api/proxy?path=%2Fpms%2Fevents${query}`)
}

export const getEventById = (id: string) =>
  fetchUtils.get<ApiResponse>(`/api/proxy?path=${encodeURIComponent(`/pms/events/${id}`)}`)

export const createEvent = (data: any) =>
  fetchUtils.post<ApiResponse>('/api/proxy?path=%2Fpms%2Fevents', data)

export const updateEvent = (id: string, data: any) =>
  fetchUtils.put<ApiResponse>(`/api/proxy?path=${encodeURIComponent(`/pms/events/${id}`)}`, data)

export const deleteEvent = (id: string) =>
  fetchUtils.delete<ApiResponse>(`/api/proxy?path=${encodeURIComponent(`/pms/events/${id}`)}`)
