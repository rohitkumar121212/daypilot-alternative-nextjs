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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const backendUrl = `https://aperfectstay.ai/aps-api/v1/collaborators/${userId ? `?userId=${userId}` : ''}`

    const response = await fetch(backendUrl, {
      headers,
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch collaborators' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch collaborators' }, { status: 500 })
  }
}
