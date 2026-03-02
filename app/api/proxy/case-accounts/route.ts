import { NextRequest, NextResponse } from 'next/server'

// UPDATE THESE WITH FRESH VALUES FROM PRODUCTION
const DEV_SESSION = '.eJxtj8tqwzAQRX8leN0mGj2trJpS6DbQDwijlyOQbGPJhVD675Vb0kXpRtLMvXfm6KO7hMWXa3esy-ofukt03bEDhgS06xkhKrDecBDSSCfBgCN9cECcBSMlR8E4AUuVC0aIwIlqHcKkooDKEyJUu8EY5w2C4pR5dJKDNoR7yaA3QUpNeQ8cjPbWauGIFqJrILNfMo5-rL9oa_HLDx_Oxfk8UULZ05Axpr2dMlJJWxBdjuO3jate90xrkJw1zP6ujZh9G3I6v-1e2pTdydppbXuaPk7jbVvT5FbahKW0Z0g47LbjcTBbe102w-vzuRUp5lj_5PKaakzTEMc7-7z49zit5bIuqXmutc7leDhg-2TwtpaKtz3GQ8sWn8K_9J9fgJyBUA.aaWTwg.JLEnzUIIPNvwTtn-ZS16XvkdD6U'
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0Nzg5ODM5OTE2NDMzNDA4LCJlbWFpbCI6ImFwc2RlbW8yMDIzQGdtYWlsLmNvbSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcyNDg3NzQ0LCJpYXQiOjE3NzI0NTg5NDR9.MH77uhlDj-xwkHWgHss_iy0kL3NAQD3_vqe1TYORjyo'

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
