import { NextRequest, NextResponse } from 'next/server'

// UPDATE THESE WITH FRESH VALUES FROM PRODUCTION
const DEV_SESSION = '.eJxtkMFOxSAQRX_FdGn0PWjLQLsybtz6B80AQyWhtAFq8mL8d6lPTTRugOHeuZzhrZlcovzSjCXtdNdM3jZjo0BwSdhLPWjsXGskYMuJgEvrtCRw0gnNHMIgFCiORlmJ3DKpua0bCaKulbJnTIKWTA6gOq560gwVNxqcGxRwGFinsRWoW-gEZ9oMphNKmaaCbJQWjBTLD9qeKV35cMsleQwP84I-nMy6OEmsdqFdfPz0gBAt8L6vgD1Ujm8t4kI14fDGNV6OzGtpAuZcjy7gfHMs97M-rvd0GJ4en2vhfCiVQV8mTXYql-2Iuv0t7D5YH-cvIfjFlz8vLXsoPqyzj83oMOQ625bo1a97nvYUqumllC2P5zPWT3BkSi54OaE_1-ZMwf074PsHKWeOIQ.aak1mw.WoQZc0uQxh3vKlrdZdqit6wT_Mg'
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2NTUyNjE0NDk1ODQ2NDAwLCJlbWFpbCI6ImFwc3RyaWFsQGdtYWlsLmNvbSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcyNzI1NzgxLCJpYXQiOjE3NzI2OTY5ODF9.JbtiM_xjpDdP-R_g_bTs14_55RTVxz3ofMZsUSr5dUQ'

export async function GET(request: NextRequest) {
  // console.log('🔵 User details proxy called')
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (isDevelopment) {
    headers['Cookie'] = `session=${DEV_SESSION}`
    headers['Authorization'] = `Bearer ${DEV_TOKEN}`
  }

  try {
    const response = await fetch('https://aperfectstay.ai/aps-api/v1/users/details/private', {
      headers,
    })

    // console.log('User details response status:', response.status)

    if (!response.ok) {
      // console.error('Failed to fetch user details:', response.status)
      return NextResponse.json({ error: 'Failed to fetch user details' }, { status: response.status })
    }

    const data = await response.json()
    // console.log('User details fetched:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('User details proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
  }
}
