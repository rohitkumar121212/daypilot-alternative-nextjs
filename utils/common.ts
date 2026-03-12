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