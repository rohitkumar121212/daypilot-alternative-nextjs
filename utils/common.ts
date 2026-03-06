export const formatBookingType = (type:string) => {
  if (!type) return ""

  return type
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}