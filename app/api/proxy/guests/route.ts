import { NextRequest, NextResponse } from 'next/server'

const DEV_SESSION = process.env.DEV_SESSION || ''
const DEV_TOKEN = process.env.DEV_TOKEN || ''

export async function GET(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (isDevelopment) {
    headers['Cookie'] = `session=${DEV_SESSION}`
    headers['Authorization'] = `Bearer ${DEV_TOKEN}`
  }

  try {
    const response = await fetch('https://aperfectstay.ai/aps-api/v1/guests/', {
      headers,
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch guests' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
  }
}
