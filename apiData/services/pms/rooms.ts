import { fetchUtils } from '@/utils/fetchUtils'
import type { ApiResponse } from '@/apiData/types/api'

export const getRooms = () =>
  fetchUtils.get<ApiResponse>('/api/proxy?path=%2Fpms%2Frooms')

export const getRoomById = (id: string) =>
  fetchUtils.get<ApiResponse>(`/api/proxy?path=${encodeURIComponent(`/pms/rooms/${id}`)}`)

export const getRoomAvailability = (roomId: string, params: { start: string; end: string }) =>
  fetchUtils.get<ApiResponse>(`/api/proxy?path=${encodeURIComponent(`/pms/rooms/${roomId}/availability`)}&start=${params.start}&end=${params.end}`)
