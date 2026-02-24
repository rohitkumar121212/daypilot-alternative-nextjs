import { tokenManager } from '@/apiData/lib/axios'

// TODO: Remove this file once cookie-based auth is implemented
export function initDevTokens() {
  tokenManager.setAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2NTUyNjE0NDk1ODQ2NDAwLCJlbWFpbCI6ImFwc3RyaWFsQGdtYWlsLmNvbSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcxODY2NzE3LCJpYXQiOjE3NzE4Mzc5MTd9.ysSCmNFxf7eHOhd8ZL6gRWo874D9HRL1U2BmnIrYcRw')
  tokenManager.setRefreshToken('ebda1317-fd0d-4408-b68b-ec3fbd30343b88754058-f4fd-45d4-80e3-f123bfe4ffb1')
}
