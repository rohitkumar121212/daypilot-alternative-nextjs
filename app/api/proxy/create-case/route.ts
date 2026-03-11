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

    const formData = await request.formData()
    
    console.log('Sending Case data:', Object.fromEntries(formData))
    
    const response = await fetch('https://aperfectstay.ai/api/aperfect10/pms/create-new-case', {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json()
    console.log('proxy case created successfully:', data)

    if (data.success === true) {
      return NextResponse.json({ data: data.data, success: true, message: data.message }, { status: 200 })
    }

    return NextResponse.json({ error: data.error || 'API request failed', status: response.status }, { status: response.status })
  } catch (error) {
    console.error('Proxy error in api/proxy/create-case: ', error)
    return NextResponse.json({ error: 'Failed to create case', details: String(error) }, { status: 500 })
  }
}
