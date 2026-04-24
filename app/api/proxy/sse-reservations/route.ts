import { NextRequest } from 'next/server'

const DEV_SESSION = process.env.DEV_SESSION || ''
const DEV_TOKEN = process.env.DEV_TOKEN || ''
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return new Response(
      JSON.stringify({ error: 'start and end query params are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  const headers: HeadersInit = {
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache',
  }

  if (isDevelopment) {
    headers['Cookie'] = `session=${DEV_SESSION}`
    headers['Authorization'] = `Bearer ${DEV_TOKEN}`
  } else {
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    } else {
      const accessToken = request.cookies.get('access_token')?.value
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
    }
  }

  const upstreamUrl = `${BASE_URL}/api/aps-pms/events/reservations?start=${start}&end=${end}`

  console.log('[SSE Proxy] Connecting to:', upstreamUrl)

  try {
    const upstreamResponse = await fetch(upstreamUrl, { headers })

    if (!upstreamResponse.ok) {
      console.error('[SSE Proxy] Upstream error:', upstreamResponse.status)
      return new Response(
        JSON.stringify({ error: 'Upstream SSE connection failed', status: upstreamResponse.status }),
        { status: upstreamResponse.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!upstreamResponse.body) {
      return new Response(
        JSON.stringify({ error: 'No response body from upstream' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(upstreamResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('[SSE Proxy] Request failed:', error)
    return new Response(
      JSON.stringify({ error: 'SSE proxy failed', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
