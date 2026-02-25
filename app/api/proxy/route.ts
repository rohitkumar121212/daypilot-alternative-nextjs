import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT')
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE')
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH')
}

async function proxyRequest(request: NextRequest, method: string) {
  const path = request.nextUrl.searchParams.get('path')
  
  console.log('[Proxy] Received request:', { method, path })
  
  if (!path) {
    return NextResponse.json({ error: 'Path parameter required' }, { status: 400 })
  }

  const targetUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`
  
  console.log('[Proxy] Target URL:', targetUrl)
  
  const headers: HeadersInit = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
  }

  // Get access token from cookies or Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
    console.log('[Proxy] Using Authorization header')
  } else {
    // Read from request cookies
    const accessToken = request.cookies.get('access_token')?.value
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
      console.log('[Proxy] Using access_token from cookies, token length:', accessToken.length)
      console.log('[Proxy] Token preview:', accessToken.substring(0, 50) + '...')
    } else {
      console.log('[Proxy] No access token found in cookies')
      console.log('[Proxy] Available cookies:', Array.from(request.cookies.getAll()).map(c => c.name))
    }
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('multipart/form-data')) {
      options.body = await request.arrayBuffer()
    } else {
      const body = await request.text()
      if (body) options.body = body
    }
  }

  try {
    const response = await fetch(targetUrl, options)
    const data = await response.text()
    
    console.log('[Proxy] Response status:', response.status)
    
    if (response.status === 401) {
      console.error('[Proxy] 401 Unauthorized - token may be invalid or expired')
    }
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('[Proxy] Request failed:', error)
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 })
  }
}
