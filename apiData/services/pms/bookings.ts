import { apiClient } from '@/apiData/lib/axios'
import type { ApiResponse } from '@/apiData/types/api'

export const createReservation = (data: any) =>
  apiClient.post<ApiResponse>('/api/aperfect-pms/create-reservation', data)

export const createHold = (data: any) =>
  apiClient.post<ApiResponse>('/api/aperfect-pms/create-hold', data)

export const createBlock = (data: any) =>
  apiClient.post<ApiResponse>('/api/aperfect-pms/create-block', data)

export const createTask = (data: any) =>
  apiClient.post<ApiResponse>('/api/aperfect-pms/create-task', data)
