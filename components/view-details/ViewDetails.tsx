"use client";

import BookingDetailsCard from "@/components/view-details/BookingDetailsCard";
import BookingHeader from "@/components/view-details/BookingHeader";
import BookingTabs, { TabKey } from "@/components/view-details/BookingTabs";
import CostBreakdown from "@/components/view-details/CostBreakdown";
import GuestTab from "@/components/view-details/GuestTab";
import InvoicesSection from "@/components/view-details/InvoicesSection";
import PaymentsTab from "@/components/view-details/PaymentsTab";
import ServicesTab from "@/components/view-details/ServicesTab";
import StayAndPricing from "@/components/view-details/StayAndPricing";
import SupportContent from "@/components/view-details/SupportContent";
import SupportTab from "@/components/view-details/SupportTab";
import type { BookingData, ViewDetailsComponentProps } from "@/components/view-details/types";
import { useUser } from "@/hooks/useUser";
import { proxyFetch } from "@/utils/proxyFetch";
import { useEffect, useState } from "react";

// ─── Component ────────────────────────────────────────────────────────────────

const ViewDetailsComponent = ({ bookingId }: ViewDetailsComponentProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [viewDetailsData, setViewDetailsData] = useState<BookingData | null>(null);


  const { user } = useUser()

  // const fetchData = async () => {
  //   const apiResponse = await proxyFetch(`/aps-api/v1/reservations/details/${bookingId}`);
  //   setViewDetailsData(apiResponse.data);
  // };

  const fetchData = async () => {
    const response = await fetch(`/booking-details/main-booking.json`);
    const json = await response.json();
    setViewDetailsData(json.data);
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
    all_additional_guests = [],
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
    pms_forms_responses,
    available_pms_forms = [],
  } = viewDetailsData;

  const currency = user?.admin_details?.selected_currency === 'GBP' ? '£' : user?.admin_details?.selected_currency;
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
              {/* {console.log("stay and pricing --- ", stay_and_pricing)} */}
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
                totalNights ={Number(cost_break_down.totalNights) || 0}
                ratePerNight ={Number(cost_break_down.ratePerNight) || 0}
                taxInclusive ={Number(cost_break_down.inclusive_tax_amount) || 0}
                securityDepositAmount ={Number(cost_break_down.security_deposit_amount) || 0}
                commissionPercentage ={Number(cost_break_down.commission_percentage) || 0}
                commissionAmount ={Number(cost_break_down.commission_amount) || 0}
                exclusiveTaxAmount ={Number(cost_break_down.exclusive_tax_amount) || 0}
                totalTaxAmount ={Number(cost_break_down.total_taxAmount) || 0}
                extraServicesAmount={Number(cost_break_down.extra_services_amount) || 0}
                taxAmount={Number(cost_break_down.taxAmount) || 0}
                discount={Number(cost_break_down.discount_amount) || 0}
                totalAmount={Number(cost_break_down.totalAmount) || 0}
                amountPaid={Number(cost_break_down.total_paid_amount) || 0}
                balancedAmount={Number(cost_break_down.balanced_amount) || 0}
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
            applicableTaxes={(viewDetailsData.all_applicable_taxes?.applicable_taxes ?? viewDetailsData.applicable_taxes ?? []) as Record<string, unknown>[]}
            currency={currency}
          />
        )}

        {/* ══════════════════ GUEST ══════════════════ */}
        {activeTab === "guest" && (
          <GuestTab
            guestDetails={guest_details}
            additionalGuests={all_additional_guests.length > 0 ? all_additional_guests : additional_guests}
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
            pmsFormsAndEmails={{
              ...pms_forms_and_emails,
              available_pms_forms: available_pms_forms.length > 0 ? available_pms_forms : pms_forms_and_emails.available_pms_forms,
              pms_form_responses: pms_forms_responses?.pms_forms ?? pms_forms_and_emails.pms_form_responses,
            }}
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
