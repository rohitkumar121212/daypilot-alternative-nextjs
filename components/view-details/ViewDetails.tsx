"use client";

import BookingDetailsSidebar from "@/components/view-details/BookingDetailsSidebar";
import BookingHeader from "@/components/view-details/BookingHeader";
import BookingTabs, { TabKey } from "@/components/view-details/BookingTabs";
import CostBreakdown from "@/components/view-details/CostBreakdown";
import GuestTab from "@/components/view-details/GuestTab";
import InvoicesSection, { Invoice } from "@/components/view-details/InvoicesSection";
import PaymentsTab from "@/components/view-details/PaymentsTab";
import StayAndPricing from "@/components/view-details/StayAndPricing";
import SupportTab from "@/components/view-details/SupportTab";
import { useEffect, useState } from "react";
import { proxyFetch } from "@/utils/proxyFetch";
// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingData {
  booking_header: {
    bookingId: number;
    enquiry_app_id: string;
    propertyAddress: string;
    propertyName: string;
    status: string;
  };
  cost_break_down: {
    ratePerNight: number;
    taxAmount: number;
    totalAmount: number;
    totalNights: number;
  };
  guest_details: {
    email: string;
    full_name: string;
    occupancy: { adults: string; children: string };
    phone: string;
  };
  invoices: Invoice[];
  stay_and_pricing: {
    checkIn: string;
    checkOut: string;
    currency: string;
    ratePerNight: number;
    taxAmount: number;
    totalAmount: number;
    totalNights: number;
  };
  support: {
    enquiry_manager: string;
  };
}

interface ViewDetailsComponentProps {
  bookingId: string | number;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ViewDetailsComponent = ({ bookingId }: ViewDetailsComponentProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [viewDetailsData, setViewDetailsData] = useState<BookingData | null>(null);

  const fetchData = async () => {
    const apiResponse = await proxyFetch(`/aps-api/v1/reservations/details/${bookingId}`)
    setViewDetailsData(apiResponse.data)
  };

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  // Guard: render nothing (or a loader) until data is ready
  if (!viewDetailsData) return null;

  const { booking_header, stay_and_pricing, cost_break_down, invoices } = viewDetailsData;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header: Back button, title, status badge, actions */}
        <BookingHeader
          bookingId={booking_header.enquiry_app_id}
          propertyName={booking_header.propertyName}
          propertyAddress={booking_header.propertyAddress}
          status={booking_header.status}
          // onBack={() => window.history.back()}
          // onPrint={() => window.print()}
          // onEdit={() => console.log("Edit booking")}
        />

        {/* Tabs: Overview / Payments / Guest / Support */}
        <BookingTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column (2/3) */}
            <div className="col-span-2 space-y-4">
              {/* Stay & Pricing */}
              <StayAndPricing
                checkIn={stay_and_pricing.checkIn}
                checkOut={stay_and_pricing.checkOut}
                totalNights={stay_and_pricing.totalNights}
                ratePerNight={stay_and_pricing.ratePerNight}
                totalAmount={stay_and_pricing.totalAmount}
              />

              {/* Invoices */}
              <InvoicesSection invoices={invoices} />

              {/* Cost Breakdown */}
              <CostBreakdown
                accommodation={cost_break_down.totalAmount}
                extraServices={cost_break_down.taxAmount}
              />
            </div>

            {/* Right Column (1/3) */}
            <div className="col-span-1">
              <BookingDetailsSidebar
                phase=""
                createdDate=""
                channel=""
                extensionPending={undefined}
              />
            </div>
          </div>
        )}

        {activeTab === "payments" && <PaymentsTab />}

        {activeTab === "guest" && <GuestTab guestDetails={viewDetailsData.guest_details} />}

        {activeTab === "support" && (
          <div className="bg-white border border-slate-100 rounded-xl p-10 shadow-sm text-center">
            <p className="text-slate-400 text-sm">Support tab content goes here.</p>
          </div>
        )}

        {activeTab === "additional-info" && <SupportTab />}

      </div>
    </div>
  );
};

export default ViewDetailsComponent;