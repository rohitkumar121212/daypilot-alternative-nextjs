// export const formatBookingType = (type:string) => {
//   if (!type) return ""

//   return type
//     .split("_")
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ")
// }
export const formatBookingType = (type: string) => {
  if (!type) return ""

  const bookingTypeMap: Record<string, string> = {
    reserve: "Reserved",
    old_reserve: "Reserved",
    temp_reserve: "Temp Reserved",
    do_not_reserve: "Do Not Reserve",
  }

  return bookingTypeMap[type] || type
}

export const getUserInfoImageUrl = (url?: string) => {
  if (!url) return null
  if (url.startsWith("//")) return `https:${url}`
  return url
}