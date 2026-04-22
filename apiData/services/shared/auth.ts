import { fetchUtils } from '@/utils/fetchUtils'
import type { ApiResponse } from '@/apiData/types/api'

export const getCurrentUser = () =>
  fetchUtils.get<ApiResponse>('/api/proxy?path=%2Fauth%2Fme')

export const logout = () =>
  fetchUtils.post<ApiResponse>('/api/proxy?path=%2Fauth%2Flogout')
