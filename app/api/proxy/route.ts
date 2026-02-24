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
  if (!path) {
    return NextResponse.json({ error: 'Path parameter required' }, { status: 400 })
  }

  const targetUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`
  
  const headers: HeadersInit = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
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
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 })
  }
}
