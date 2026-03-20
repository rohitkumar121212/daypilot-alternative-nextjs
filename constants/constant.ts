export const ABBREVIATION_LIST=[
    { short: "PET", full: "Pet friendly apartment" },
    { short: "PET-CONF", full: "Pet approval required from landlord" },
    { short: "NO-PET", full: "Pets not allowed" },
    { short: "BALC", full: "Balcony available in apartment" },
    { short: "NO-BALC", full: "Balcony not available in apartment" },
    { short: "FLR", full: "Apartment Floor" },
  ] as const;

export const PAYMENT_METHODS_LIST=[
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "google-pay", label: "Google Pay" },
  { value: "credit-card", label: "Credit Card" },
  { value: "debit-card", label: "Debit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "booking-channel", label: "Booking Channel" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "other", label: "Other" },
]
export const DNR_TYPE_LIST = [
  { value: "DNR APARTMENT EXIT", label: "Local DNR APARTMENT EXIT" },
  { value: "DNR DIRTY APARTMENT", label: "DNR DIRTY APARTMENT" },
  { value: "DNR EARLY CHECKIN", label: "DNR EARLY CHECKIN" },
  { value: "DNR ENGINEER VISIT", label: "DNR ENGINEER VISIT" },
  { value: "DNR LATE CHECKOUT", label: "DNR LATE CHECKOUT" },
  { value: "DNR MAINTENANCE REFURB", label: "DNR MAINTENANCE REFURB" },
  { value: "DNR MLOS RESTRICTION", label: "DNR MLOS RESTRICTION" },
  { value: "DNR OTHERS", label: "DNR OTHERS" },
  { value: "DNR PREP HOLD", label: "DNR PREP HOLD" },
  { value: "DNR SERVICE ISSUE", label: "DNR SERVICE ISSUE" },
  { value: "DNR SERVICE RECOVERY", label: "DNR SERVICE RECOVERY" },
  { value: "DNR VIEWING APARTMENT", label: "DNR VIEWING APARTMENT" },
  { value: "DNR PRE ONBOARDING", label: "DNR PRE ONBOARDING" },
];

export const REASON_LIST_FOR_CASE_TAB = [
  { value: "ac", label: " LOCAL AC" },
  { value: "adaptor", label: "Adaptor" },
  { value: "wifi", label: "WiFi" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "heating", label: "Heating" },
  { value: "cleaning", label: "Cleaning" },
  { value: "appliance", label: "Appliance" },
  { value: "furniture", label: "Furniture" },
  { value: "other", label: "Other" },
]

export const SUB_REASON_LIST_FOR_CASE_TAB = [
  { value: "ac", label: "LOcal AC" },
  { value: "adaptor", label: "Adaptor" },
  { value: "wifi", label: "WiFi" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "heating", label: "Heating" },
  { value: "cleaning", label: "Cleaning" },
  { value: "appliance", label: "Appliance" },
  { value: "furniture", label: "Furniture" },
  { value: "other", label: "Other" },
]

export const ORIGIN_LIST_FOR_CASE_TAB = [
  { value: "inspection", label: "Local Inspection" },
  { value: "web", label: "Web" },
  { value: "phone", label: "Phone" },
  { value: "app", label: "App" },
  { value: "email", label: "Email" },
  { value: "walk-in", label: "Walk-in" },
]

export const ASSIGN_CASE_TO_LIST = [
  { value: "john-doe", label: "Local John Doe" },
  { value: "jane-smith", label: "Jane Smith" },
  { value: "mike-johnson", label: "Mike Johnson" },
  { value: "sarah-williams", label: "Sarah Williams" },
  { value: "david-brown", label: "David Brown" },
]
