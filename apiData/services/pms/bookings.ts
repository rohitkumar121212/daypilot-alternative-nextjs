import { fetchUtils } from '@/utils/fetchUtils'
import type { ApiResponse } from '@/apiData/types/api'

export const createReservation = (data: any) =>
  fetchUtils.post<ApiResponse>('/api/proxy/add-reservation', data)

export const createHold = (data: any) =>
  fetchUtils.post<ApiResponse>('/api/proxy?path=%2Fapi%2Faperfect-pms%2Fcreate-hold', data)

export const createBlock = (data: any) =>
  fetchUtils.post<ApiResponse>('/api/proxy?path=%2Fapi%2Faperfect-pms%2Fcreate-block', data)

export const createTask = (data: any) =>
  fetchUtils.post<ApiResponse>('/api/proxy/create-task', data)

export const createCase = (data: any) =>
  fetchUtils.post<ApiResponse>('/api/proxy/create-case', data)

export const createAddPayment = (data: any) =>
  fetchUtils.post<ApiResponse>('/api/proxy/add-payment', data)
