import { NextRequest, NextResponse } from 'next/server'

const DEV_SESSION = '.eJxtj8tqwzAQRX8leN0mGj2trJpS6DbQDwijlyOQbGPJhVD675Vb0kXpRtLMvXfm6KO7hMWXa3esy-ofukt03bEDhgS06xkhKrDecBDSSCfBgCN9cECcBSMlR8E4AUuVC0aIwIlqHcKkooDKEyJUu8EY5w2C4pR5dJKDNoR7yaA3QUpNeQ8cjPbWauGIFqJrILNfMo5-rL9oa_HLDx_Oxfk8UULZ05Axpr2dMlJJWxBdjuO3jate90xrkJw1zP6ujZh9G3I6v-1e2pTdydppbXuaPk7jbVvT5FbahKW0Z0g47LbjcTBbe102w-vzuRUp5lj_5PKaakzTEMc7-7z49zit5bIuqXmutc7leDhg-2TwtpaKtz3GQ8sWn8K_9J9fgJyBUA.aaVzYg.chQR5T3EaEa4lbghkLKlZub43GE'
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0Nzg5ODM5OTE2NDMzNDA4LCJlbWFpbCI6ImFwc2RlbW8yMDIzQGdtYWlsLmNvbSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcyNDcyMjA3LCJpYXQiOjE3NzI0NDM0MDd9.trA4iQSUn7cIdVTqkhnVsc-C0y3O4Xz8IWpvQxFzRIA'

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
    const response = await fetch('https://aperfectstay.ai/aps-api/v1/taxsets/', {
      headers,
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch taxsets' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch taxsets' }, { status: 500 })
  }
}
