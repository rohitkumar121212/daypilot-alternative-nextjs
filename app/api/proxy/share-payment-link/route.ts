import { NextRequest, NextResponse } from 'next/server'

const DEV_SESSION = process.env.DEV_SESSION || ''
const DEV_TOKEN = process.env.DEV_TOKEN || ''

export async function POST(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const headers: HeadersInit = {}

  if (isDevelopment) {
    headers['Cookie'] = `session=${DEV_SESSION}`
    headers['Authorization'] = `Bearer ${DEV_TOKEN}`
  }

  try {
    const formData = await request.formData()
    
    console.log('Sending share payment link FormData:', Object.fromEntries(formData))
    
    const response = await fetch('https://aperfectstay.ai/aperfect-pms', {
      method: 'POST',
      headers,
      body: formData, // Send FormData directly
    })

    const responseData = await response.json()
    console.log('Share payment link response:', responseData)

    if (responseData.success === true) {
      return NextResponse.json({ data: responseData.data, success: true, message: responseData.message }, { status: 200 })
    }

    return NextResponse.json({ error: responseData.error || 'API request failed', status: response.status }, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to share payment link', details: String(error) }, { status: 500 })
  }
}