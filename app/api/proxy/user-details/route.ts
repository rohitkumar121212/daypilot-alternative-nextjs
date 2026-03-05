import { NextRequest, NextResponse } from 'next/server'

// UPDATE THESE WITH FRESH VALUES FROM PRODUCTION
const DEV_SESSION = process.env.DEV_SESSION || ''
const DEV_TOKEN = process.env.DEV_TOKEN || ''

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
