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
    // const body = {
    //   prop_abbr_id: "671 DH",
    //   new_start_date: "2026-04-02",
    //   new_end_date: "2026-04-03",
    //   duration: "3 Nights",
    //   adult_count: "1",
    //   child_count: "0",
    //   room_count: "1",
    //   title: "",
    //   rate: "",
    //   first_name: "Test For NEW PMS",
    //   phone: "1234",
    //   email: "test@gmail.com",
    //   account_name: "",
    //   total_amount: "123455",
    //   total_vat: "",
    //   hold_till_date: "2026-03-03",
    //   hold_till_time: "09:00",
    //   enquiry_app_id: "",
    //   total_commission: "1",
    //   dnr_reason: "",
    //   dnr_close_calendar: "yes",
    //   reservation_type: "reserve",
    //   new_entry: "Save"
    // }

    const responseData = await request.json()
    
    console.log('Sending payload:', JSON.stringify(responseData, null, 2))
    
    const response = await fetch('https://aperfectstay.ai/api/aperfect-pms/add-new-reservation', {
      method: 'POST',
      headers,
      body: JSON.stringify(responseData),
    })

    const text = await response.text()
    console.log('Response status:', response.status)
    console.log('Response body:', text)

    if (response.status === 200) {
      return NextResponse.json({ success: true, message: 'Reservation created successfully' })
    }

    return NextResponse.json({ error: 'API request failed', status: response.status, response: text.substring(0, 500) }, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to create reservation', details: String(error) }, { status: 500 })
  }
}
