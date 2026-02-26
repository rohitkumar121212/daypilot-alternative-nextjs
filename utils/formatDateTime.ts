import dayjs from 'dayjs'

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  
  const parsed = dayjs(date)
  if (!parsed.isValid()) return 'N/A'
  
  return parsed.format('DD-MM-YYYY HH:mm')
}
