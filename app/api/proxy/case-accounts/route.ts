import { NextRequest, NextResponse } from 'next/server'

// UPDATE THESE WITH FRESH VALUES FROM PRODUCTION
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
    const response = await fetch('https://aperfectstay.ai/aps-api/v1/case-accounts/', {
      headers,
    })

    const text = await response.text()
    console.log('Response status:', response.status)
    console.log('Response text:', text.substring(0, 200))

    if (!response.ok) {
      return NextResponse.json({ error: 'API request failed', status: response.status, response: text.substring(0, 500) }, { status: response.status })
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON response', response: text.substring(0, 500) }, { status: 500 })
    }
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch case accounts', details: String(error) }, { status: 500 })
  }
}
