import dayjs from 'dayjs'

/**
 * Detects overlapping bookings and marks them as overbooked
 * @param {Array} bookings - Array of booking objects
 * @returns {Array} - Bookings with isOverbooked flag added
 */
export const detectOverbookings = (bookings) => {
  // Group bookings by apartment
  const byApartment = {}
  
  bookings.forEach(booking => {
    if (booking.consider_for_overbooking !== 'true') return
    
    const aptId = booking.resourceId || booking.booking_details?.apartment_id
    if (!aptId) return
    
    // Skip invalid bookings where end date is before start date
    const start = dayjs(booking.startDate || booking.start)
    const end = dayjs(booking.endDate || booking.end)
    if (!start.isValid() || !end.isValid() || end.isBefore(start)) return
    
    if (!byApartment[aptId]) {
      byApartment[aptId] = []
    }
    byApartment[aptId].push(booking)
  })
  
  // Check for overlaps within each apartment
  const overbookedIds = new Set()
  
  Object.values(byApartment).forEach(aptBookings => {
    // Sort by start date
    const sorted = [...aptBookings].sort((a, b) => 
      new Date(a.startDate || a.start) - new Date(b.startDate || b.start)
    )
    
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i]
      const currentStart = dayjs(current.startDate || current.start)
      const currentEnd = dayjs(current.endDate || current.end)
      
      for (let j = 0; j < i; j++) {
        const existing = sorted[j]
        const existingStart = dayjs(existing.startDate || existing.start)
        const existingEnd = dayjs(existing.endDate || existing.end)
        
        // Check if dates overlap (checkout day is not occupied)
        // Booking 1: March 1-3 (occupies 1,2) | Booking 2: March 3-5 (occupies 3,4) = NO overlap
        // Booking 1: March 1-3 (occupies 1,2) | Booking 2: March 2-4 (occupies 2,3) = OVERLAP on day 2
        const overlaps = currentStart.isBefore(existingEnd, 'day') && currentEnd.isAfter(existingStart, 'day')
        
        if (overlaps) {
          // Mark BOTH bookings as overbooked
          overbookedIds.add(current.id || current.booking_id)
          overbookedIds.add(existing.id || existing.booking_id)
        }
      }
    }
  })
  
  // Mark overbooked bookings
  return bookings.map(booking => ({
    ...booking,
    isOverbooked: overbookedIds.has(booking.id || booking.booking_id)
  }))
}
