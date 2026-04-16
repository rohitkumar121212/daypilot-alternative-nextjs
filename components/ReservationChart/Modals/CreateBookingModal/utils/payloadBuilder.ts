import { daysBetween } from '@/utils/dateUtils'

const reservationMap: Record<string, string> = {
  book: 'reserve',
  hold: 'temp_reserve',
  block: 'do_not_reserve',
}

export const buildBookingPayload = (formData: any, resource: any, modalData: any) => {
  const dayCount = daysBetween(formData.checkIn || modalData.startDate, formData.checkOut || modalData.endDate)
  const reservationType = reservationMap[formData.bookingType] || ''

  return {
    prop_abbr_id: resource?.id,
    new_start_date: formData.checkIn || modalData.startDate,
    new_end_date: formData.checkOut || modalData.endDate,
    response_version: "v1",
    duration: `${dayCount} Nights`,
    adult_count: (formData.adults || 1).toString(),
    child_count: (formData.children || '0').toString(),
    room_count: '1',
    title: formData.title || '',
    rate: formData.totalPrice || '',
    first_name: formData.guestName || '',
    phone: formData.phone || '',
    email: formData.email || '',
    account_name: formData.account || '',
    total_amount: formData.totalPrice || '',
    total_vat: formData.tax || '',
    hold_till_date: formData.holdBookingTill?.split('T')[0] || '',
    hold_till_time: formData.holdBookingTill?.split('T')[1]?.substring(0, 5) || '',
    enquiry_app_id: formData.enquiryAppId || '',
    total_commission: formData.commission || '0',
    dnr_type: formData.dnrReason || '',
    dnr_reason: formData.dnrNotes || '',
    dnr_close_calendar: 'yes',
    reservation_type: reservationType,
    new_entry: 'Save',
    send_instant_mail: formData.sendInstantMail ? 'yes' : 'no'
  }
}
