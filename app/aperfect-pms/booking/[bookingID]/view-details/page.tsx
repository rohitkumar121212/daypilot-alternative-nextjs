"use client";

import { useState } from "react";
import BookingHeader from "@/components/view-details/BookingHeader";
import BookingStatCards from "@/components/view-details/BookingStatCards";
import BookingTabs, { TabKey } from "@/components/view-details/BookingTabs";
import StayAndPricing from "@/components/view-details/StayAndPricing";
import InvoicesSection, { Invoice } from "@/components/view-details/InvoicesSection";
import CostBreakdown from "@/components/view-details/CostBreakdown";
import BookingDetailsSidebar from "@/components/view-details/BookingDetailsSidebar";
import PaymentsTab from "@/components/view-details/PaymentsTab";
import GuestTab from "@/components/view-details/GuestTab";
import AdditionalInformationTab from "@/components/view-details/AdditionalInformationTab";
import AdditionalNotes from "@/components/view-details/AdditionalNotes"
import SupportTab from "@/components/view-details/SupportTab"

// ─── Mock Data ────────────────────────────────────────────────────────────────
const BOOKING = {
  id: "0318702",
  propertyName: "A Perfect 10 — 33 TT",
  propertyAddress: "33 Tottenham Court Road, London, W1T 1BJ",
  status: "checked-in" as const,
  checkIn: "09 Jan 2026",
  checkInTime: "15:00",
  checkOut: "27 Feb 2026",
  checkOutTime: "10:00",
  totalNights: 49,
  ratePerNight: 79.33,
  phase: "Phase 2",
  createdDate: "11 Dec 2025",
  channel: "Sublet",
  accommodation: 3887.17,
  extraServices: 0.0,
};

const INVOICES: Invoice[] = [
  {
    id: "INV-107156",
    description: "Booking & Extra Services Invoice",
    date: "09 Jan 2026",
    amount: 4774.9,
    status: "paid",
  },
  {
    id: "INV-107201",
    description: "Accommodation - February 2026",
    date: "01 Feb 2026",
    amount: 3887.17,
    status: "pending",
  },
];

const ViewDetailsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header: Back button, title, status badge, actions */}
        <BookingHeader
          bookingId={BOOKING.id}
          propertyName={BOOKING.propertyName}
          propertyAddress={BOOKING.propertyAddress}
          status={BOOKING.status}
        // onBack={() => window.history.back()}
        // onPrint={() => window.print()}
        // onEdit={() => console.log("Edit booking")}
        />


        {/* Stat Cards: Check-in / Check-out / Nights / Rate */}
        <BookingStatCards
          checkIn={BOOKING.checkIn}
          checkInTime={BOOKING.checkInTime}
          checkOut={BOOKING.checkOut}
          checkOutTime={BOOKING.checkOutTime}
          totalNights={BOOKING.totalNights}
          ratePerNight={BOOKING.ratePerNight}
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
                checkIn={BOOKING.checkIn}
                checkOut={BOOKING.checkOut}
                totalNights={BOOKING.totalNights}
                ratePerNight={BOOKING.ratePerNight}
                totalAmount={BOOKING.accommodation}
              />

              {/* Invoices */}
              <InvoicesSection invoices={INVOICES} />

              {/* Cost Breakdown */}
              <CostBreakdown
                accommodation={BOOKING.accommodation}
                extraServices={BOOKING.extraServices}
              />
            </div>

            {/* Right Column (1/3) */}
            <div className="col-span-1">
              <BookingDetailsSidebar
                phase={BOOKING.phase}
                createdDate={BOOKING.createdDate}
                channel={BOOKING.channel}
                extensionPending={{
                  reason: "Apartment lease ending - alert raised for extension review",
                  additionalCost: 792.51,
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "payments" && <PaymentsTab />}

        {activeTab === "guest" && <GuestTab />}

       

        {activeTab === "support" && (
          <div className="bg-white border border-slate-100 rounded-xl p-10 shadow-sm text-center">
            <p className="text-slate-400 text-sm">Support tab content goes here.</p>
          </div>
        )}
        {/* {activeTab === "additional-info" && <AdditionalNotes />} */}
        {activeTab === "additional-info" && <SupportTab />}


      </div>
    </div>
  )
}

export default ViewDetailsPage


