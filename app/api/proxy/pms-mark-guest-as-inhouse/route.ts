import { NextRequest, NextResponse } from 'next/server'

// UPDATE THESE WITH FRESH VALUES FROM PRODUCTION
const DEV_SESSION = process.env.DEV_SESSION || ''
const DEV_TOKEN = process.env.DEV_TOKEN || ''

export async function POST(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (isDevelopment) {
    headers['Cookie'] = `session=${DEV_SESSION}`
    headers['Authorization'] = `Bearer ${DEV_TOKEN}`
  }

  try {

    const responseData = await request.json()
    
    console.log('Sending payload for mark guest as inhouse:', JSON.stringify(responseData, null, 2))
    
    const response = await fetch('https://aperfectstay.ai/api/pms-mark-guest-as-inhouse', {
      method: 'POST',
      headers,
      body: JSON.stringify(responseData),
    })

    // const text = await response.text()
    const data = await response.json()
    console.log('proxy mark as check-in created successfully:', data)
    // console.log('Response status:', response.status)
    // console.log('Response body:', text)

    if (data.success === true) {
      return NextResponse.json({ data: data.data,success: true, message: data.message}, { status: 200 })
    }

    return NextResponse.json({ error: 'API request failed', status: response.status, response: text.substring(0, 500) }, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to create reservation', details: String(error) }, { status: 500 })
  }
}
