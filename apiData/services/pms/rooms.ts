import { apiClient } from '@/apiData/lib/axios'
import type { ApiResponse } from '@/apiData/types/api'

export const getRooms = () =>
  apiClient.get<ApiResponse>('/pms/rooms')

export const getRoomById = (id: string) =>
  apiClient.get<ApiResponse>(`/pms/rooms/${id}`)

export const getRoomAvailability = (roomId: string, params: { start: string; end: string }) =>
  apiClient.get<ApiResponse>(`/pms/rooms/${roomId}/availability`, { params })
