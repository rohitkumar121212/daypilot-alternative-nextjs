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
    
    console.log('Sending payment data:', Object.fromEntries(formData))
    
    const response = await fetch('https://aperfectstay.ai/api/aperfect-pms/add-new-booking-payment', {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json()
    console.log('Payment added successfully:', data)

    if (data.success === true) {
      return NextResponse.json({ data: data.data, success: true, message: data.message }, { status: 200 })
    }

    return NextResponse.json({ error: data.error || 'API request failed', status: response.status }, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to add payment', details: String(error) }, { status: 500 })
  }
}
