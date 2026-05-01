"use client";

import BookingDetailsCard from "@/components/view-details/BookingDetailsCard";
import BookingHeader from "@/components/view-details/BookingHeader";
import BookingTabs, { TabKey } from "@/components/view-details/BookingTabs";
import CostBreakdown from "@/components/view-details/CostBreakdown";
import GuestTab from "@/components/view-details/GuestTab";
import InvoicesSection, { Invoice } from "@/components/view-details/InvoicesSection";
import PaymentsTab from "@/components/view-details/PaymentsTab";
import ServicesTab from "@/components/view-details/ServicesTab";
import StayAndPricing from "@/components/view-details/StayAndPricing";
import SupportContent from "@/components/view-details/SupportContent";
import SupportTab from "@/components/view-details/SupportTab";
import { useUser } from "@/hooks/useUser";
import { proxyFetch } from "@/utils/proxyFetch";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingData {
  booking_details: {
    account: string;
    apartment: unknown[];
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
  };
  booking_header: {
    apartment_address: string;
    apartment_name: string;
    booking_id: number | null;
    booking_reference: string;
    enquiry_app_id: string;
    propertyAddress: string;
    propertyName: string;
    status: string;
  };
  cost_break_down: {
    accommodation_amount: number;
    extra_services_amount: number;
    ratePerNight: number;
    taxAmount: number;
    totalAmount: number;
    totalNights: number;
  };
  guest_details: {
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
  };
  additional_guests: Record<string, unknown>[];
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
  payment_details: {
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
  };
  applicable_taxes: unknown[];
  payment_history: Array<{
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
  }>;
  stay_and_pricing: {
    checkIn: string;
    checkInTime: string;
    checkOut: string;
    checkOutTime: string;
    currency: string;
    ratePerNight: number;
    taxAmount: number;
    totalAmount: number;
    totalNights: number;
  };
  additional_information: {
    booking_notes: string;
    meal_plan: Record<string, unknown> | unknown[];
    messages: { messages: unknown[]; total: number } | unknown[];
    ota_notes: string;
    policies: string | unknown[];
    preferences: { preferences: unknown[]; total: number } | unknown[];
    smoking_preference: string;
    tasks: { tasks: Record<string, unknown>[]; total: number } | Record<string, unknown>[];
    guest_preferences: { guest_preferences: unknown[]; total: number } | unknown[];
  };
  extra_services: Record<string, unknown>[];
  support: {
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
  };
  sync_status: {
    enquiry_app_sync_state: string;
    salesforce_sync_state: string;
    staah_sync_state: string;
  };
  enquiry_app_logs: {
    enquiry_app_logs: unknown[];
    staah_logs: unknown[];
  };
  property_context: {
    cases_logs: unknown[];
    maintenance_logs: unknown[];
    property_name: string;
    recent_inspections: Record<string, unknown>[];
  };
  pms_forms_and_emails: {
    available_email_templates: unknown[];
    available_pms_forms: unknown[];
    pms_form_responses: unknown[];
  };
  attachments: unknown[];
  alerts: {
    apartment_lease_end_date: string | null;
    custom_alerts: string[];
  };
}

interface ViewDetailsComponentProps {
  bookingId: string | number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ViewDetailsComponent = ({ bookingId }: ViewDetailsComponentProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [viewDetailsData, setViewDetailsData] = useState<BookingData | null>(null);


  const { user } = useUser()

  const fetchData = async () => {
    const apiResponse = await proxyFetch(`/aps-api/v1/reservations/details/${bookingId}`);
    setViewDetailsData(apiResponse.data);
  };

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  if (!viewDetailsData) return null;

  const {
    booking_header,
    booking_details,
    stay_and_pricing,
    cost_break_down,
    invoices = [],
    payment_details,
    payment_history = [],
    guest_details,
    additional_guests = [],
    extra_services = [],
    additional_information,
    support = {
      cases: { apartment_related: [], guest_related: [] },
      electricity_usage: { meter_data_present: false, readings: [] },
      enquiry_manager: "",
      guest_app_orders: [],
      guest_parking: [],
      maintenance_tasks: [],
      service_recovery_requests: [],
    },
    property_context = {
      cases_logs: [],
      maintenance_logs: [],
      property_name: "",
      recent_inspections: [],
    },
    pms_forms_and_emails = {
      available_email_templates: [],
      available_pms_forms: [],
      pms_form_responses: [],
    },
  } = viewDetailsData;

  const currency = user?.admin_details?.selected_currency || '£'

  const balance =
    Number(payment_details.balance) !== 0
      ? Number(payment_details.balance)
      : Number(payment_details.totalAmount) - Number(payment_details.total_paid_amount);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-350 mx-auto px-6 py-6">

        {/* Header */}
        <BookingHeader
          bookingId={booking_header.enquiry_app_id}
          propertyName={booking_header.propertyName || booking_header.apartment_name}
          propertyAddress={booking_header.propertyAddress || booking_header.apartment_address}
          status={
            (booking_header.status as "checked-in" | "checked-out" | "pending" | "cancelled") ||
            "pending"
          }
        />

        {/* Tabs */}
        <BookingTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ══════════════════ OVERVIEW ══════════════════ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-3 gap-6">

            {/* LEFT (2/3) — Stay & Pricing, Booking Details */}
            <div className="col-span-2 space-y-5">

              <StayAndPricing
                checkIn={stay_and_pricing.checkIn}
                checkOut={stay_and_pricing.checkOut}
                checkInTime={stay_and_pricing.checkInTime}
                checkOutTime={stay_and_pricing.checkOutTime}
                totalNights={stay_and_pricing.totalNights}
                ratePerNight={stay_and_pricing.ratePerNight}
                totalAmount={stay_and_pricing.totalAmount}
                adults={Number(guest_details.occupancy?.adults)}
                children={Number(guest_details.occupancy?.children)}
                currency={currency}
              />

              <BookingDetailsCard
                bookingDetails={booking_details}
                bookingId={booking_header.booking_id}
              />
            </div>

            {/* RIGHT (1/3) — Cost Breakdown, Invoices */}
            <div className="col-span-1 space-y-5">

              <CostBreakdown
                accommodationAmount={Number(cost_break_down.accommodation_amount) || 0}
                extraServicesAmount={Number(cost_break_down.extra_services_amount) || 0}
                taxAmount={Number(cost_break_down.taxAmount) || 0}
                discount={Number(payment_details.discount_amount) || 0}
                totalAmount={Number(cost_break_down.totalAmount) || 0}
                amountPaid={Number(payment_details.total_paid_amount) || 0}
                balance={balance}
                currency={currency}
              />

              <InvoicesSection invoices={invoices} />
            </div>
          </div>
        )}

        {/* ══════════════════ PAYMENTS ══════════════════ */}
        {activeTab === "payments" && (
          <PaymentsTab
            bookingId={bookingId}
            paymentDetails={payment_details}
            paymentHistory={payment_history}
            invoices={invoices}
            applicableTaxes={(viewDetailsData.applicable_taxes ?? []) as Record<string, unknown>[]}
          />
        )}

        {/* ══════════════════ GUEST ══════════════════ */}
        {activeTab === "guest" && (
          <GuestTab
            guestDetails={guest_details}
            additionalGuests={additional_guests}
            checkIn={stay_and_pricing.checkIn}
            checkInTime={stay_and_pricing.checkInTime}
            checkOut={stay_and_pricing.checkOut}
            checkOutTime={stay_and_pricing.checkOutTime}
            recentInspections={property_context.recent_inspections}
            rewards={viewDetailsData.rewards}
          />
        )}

        {/* ══════════════════ SERVICES ══════════════════ */}
        {activeTab === "services" && (
          <ServicesTab
            bookingId={bookingId}
            preArrivalFormCompleted={guest_details.prearrival_form_completed}
            recentInspections={property_context.recent_inspections}
            extraServices={extra_services}
            serviceRecoveryRequests={support.service_recovery_requests}
            electricityUsage={support.electricity_usage}
            currency={currency}
          />
        )}

        {/* ══════════════════ SUPPORT ══════════════════ */}
        {activeTab === "support" && (
          <SupportContent
            bookingId={bookingId}
            cases={support.cases}
            electricityUsage={support.electricity_usage}
            enquiryManager={support.enquiry_manager}
            guestAppOrders={support.guest_app_orders}
            guestParking={support.guest_parking}
            maintenanceTasks={support.maintenance_tasks}
            serviceRecoveryRequests={support.service_recovery_requests}
            propertyContext={property_context}
            pmsFormsAndEmails={pms_forms_and_emails}
          />
        )}

        {/* ══════════════════ ADDITIONAL INFORMATION ══════════════════ */}
        {activeTab === "additional-info" && (
          <SupportTab additionalInformation={additional_information} />
        )}

      </div>
    </div>
  );
};

export default ViewDetailsComponent;
