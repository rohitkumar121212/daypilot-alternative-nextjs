import type { Invoice } from "@/components/view-details/InvoicesSection";

export interface BookingDetails {
  account: string;
  apartment: { id: number; name: string } | null;
  booker_email: string;
  booker_name: string;
  booking_created_at: string;
  booking_reference: string;
  booking_room_index: string;
  booking_status: string;
  cancellation_policy: string;
  channel_manager_id: string;
  channel_manager_ota_reservation_code: string;
  channel_manager_system_id: string;
  channel_manager_unique_id: string;
  channel_ota_name: string;
  do_not_move: boolean;
  duration: number;
  email: string;
  enquiry_app_id: string;
  enquiry_manager: string;
  force_overbook: string;
  guest_arrival: string;
  guest_departure: string;
  lead_source: string;
  meal_plan: unknown[];
  name: string;
  phone: string | null;
  sales_channel: string;
  sales_person: string;
  salesforce_id: string;
  salesforce_log_no: string;
}

export interface BookingHeader {
  apartment_address: string;
  apartment_name: string;
  booking_id: number | null;
  booking_reference: string;
  enquiry_app_id: string;
  propertyAddress: string;
  propertyName: string;
  status: string;
}

export interface CostBreakDown {
  accommodation_amount: number;
  extra_services_amount: number;
  ratePerNight: number;
  taxAmount: number;
  totalAmount: number;
  totalNights: number;
}

export interface GuestDetails {
  address: string;
  created_at: string;
  email: string;
  full_name: string;
  goki_code: string;
  guest_id: string;
  guest_keys: number;
  occupancy: { adults: string; children: string };
  old_checkin_date: string;
  old_checkout_date: string;
  phone: string;
  prearrival_form_completed: boolean;
  representative_name: string;
}

export interface PaymentDetails {
  additional_services_amount: number;
  balance: number;
  cancellation_charges: number;
  canellation_commission: number;
  commission_amount: number;
  commission_percentage: number;
  currency: string;
  discount_amount: number;
  exclusive_tax_amount: number;
  inclusive_tax_amount: number;
  is_booking_cancelled_with_charges: boolean;
  other_charges: number;
  other_discount: number;
  ratePerNight: number;
  revenue_against_cancellation: number;
  room_tariff: number;
  security_deposit_amount: number;
  taxAmount: number;
  totalAmount: number;
  totalNights: number;
  total_paid_amount: number;
}

export interface PaymentHistoryEntry {
  accepted_per: string;
  amount: number;
  created_at: string;
  key: number;
  mode: string;
  notes: string;
  receipt_img: string;
  receipt_pdf: string;
  ref_num: string;
  reservation_history_id: number;
  time: string;
}

export interface StayAndPricing {
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  checkOutTime: string;
  currency: string;
  ratePerNight: number;
  taxAmount: number;
  totalAmount: number;
  totalNights: number;
}

export interface AdditionalInformation {
  booking_notes: string;
  meal_plan: Record<string, unknown> | unknown[];
  messages: { messages: unknown[]; total: number } | unknown[];
  ota_notes: string;
  policies: string | unknown[];
  preferences: { preferences: unknown[]; total: number } | unknown[];
  smoking_preference: string;
  tasks: { tasks: Record<string, unknown>[]; total: number } | Record<string, unknown>[];
  guest_preferences: { guest_preferences: unknown[]; total: number } | unknown[];
}

export interface SupportData {
  cases: {
    apartment_related: Record<string, unknown>[];
    guest_related: Record<string, unknown>[];
  };
  electricity_usage: {
    meter_data_present: boolean;
    readings: unknown[];
  };
  enquiry_manager: string;
  guest_app_orders: Record<string, unknown>[];
  guest_parking: Record<string, unknown>[];
  maintenance_tasks: Record<string, unknown>[];
  service_recovery_requests: Record<string, unknown>[];
}

export interface PropertyContext {
  cases_logs: unknown[];
  maintenance_logs: unknown[];
  property_name: string;
  recent_inspections: Record<string, unknown>[];
}

export interface PmsFormsAndEmails {
  available_email_templates: Record<string, unknown>[];
  available_pms_forms: Record<string, unknown>[];
  pms_form_responses: Record<string, unknown>[];
}

export interface BookingData {
  booking_details: BookingDetails;
  booking_header: BookingHeader;
  cost_break_down: CostBreakDown;
  guest_details: GuestDetails;
  additional_guests: Record<string, unknown>[];
  all_additional_guests?: { name: string; email: string; phone: string; nationality: string }[];
  rewards: {
    value_field_1: string;
    value_field_2: string;
  };
  revenue_realization: {
    rows: Record<string, unknown>[];
    totals: {
      count_realized: number;
      total_booked: number;
      total_nights: number;
      total_realized: number;
    };
  };
  invoices: Invoice[];
  payment_details: PaymentDetails;
  applicable_taxes: unknown[];
  all_applicable_taxes?: {
    applicable_taxes: { amount: number; name: string; type: string }[];
    can_add_tax: boolean;
    has_tax_set: boolean;
    source: string;
  };
  payment_history: PaymentHistoryEntry[];
  stay_and_pricing: StayAndPricing;
  additional_information: AdditionalInformation;
  extra_services: Record<string, unknown>[];
  support: SupportData;
  sync_status: {
    enquiry_app_sync_state: string;
    salesforce_sync_state: string;
    staah_sync_state: string;
  };
  enquiry_app_logs: {
    enquiry_app_logs: unknown[];
    staah_logs: unknown[];
  };
  property_context: PropertyContext;
  available_pms_forms?: {
    copy_link_id: string;
    email_url: string;
    form_id: number;
    form_name: string;
  }[];
  pms_forms_and_emails: PmsFormsAndEmails;
  pms_forms_responses?: {
    has_forms: boolean;
    pms_forms: {
      created_at: string;
      form_name: string;
      response_id: number;
      view_iframe_url: string;
      view_new_tab_url: string;
    }[];
  };
  attachments: unknown[];
  alerts: {
    apartment_lease_end_date: string | null;
    custom_alerts: string[];
  };
}

export interface ViewDetailsComponentProps {
  bookingId: string | number;
}
