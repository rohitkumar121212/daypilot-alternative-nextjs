import { apiClient } from '@/apiData/lib/axios'
import type { ApiResponse } from '@/apiData/types/api'

export const getCurrentUser = () =>
  apiClient.get<ApiResponse>('/auth/me')

export const logout = () =>
  apiClient.post<ApiResponse>('/auth/logout')
