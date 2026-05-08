"use client";

import { Invoice } from "@/components/view-details/InvoicesSection";
import { proxyFetch } from "@/utils/proxyFetch";
import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ApiPaymentHistoryEntry {
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

interface RevenueRealizationRow {
  [key: string]: unknown;
}

interface RevenueSplit {
  background_color?: string;
  booked_revenue?: string;
  date_of_realization?: string;
  nights?: number;
  revenue_realized?: string;
}

interface PaymentsTabProps {
  bookingId: string | number;
  currency: string | number
  paymentDetails: {
    additional_services_amount: number;
    balance?: number;
    cancellation_charges?: number;
    canellation_commission?: number;
    commission_amount: number;
    commission_percentage: number;
    currency?: string;
    discount_amount: number;
    exclusive_tax_amount?: number;
    inclusive_tax_amount?: number;
    is_booking_cancelled_with_charges?: boolean;
    other_charges?: number;
    other_discount?: number;
    ratePerNight: number;
    revenue_against_cancellation?: number;
    room_tariff?: number;
    security_deposit_amount: number;
    taxAmount: number;
    totalAmount: number;
    totalNights: number;
    total_paid_amount: number;
  };
  paymentHistory: ApiPaymentHistoryEntry[];
  invoices?: Invoice[];
  applicableTaxes?: Record<string, unknown>[];
  revenueRealization?: {
    rows: RevenueRealizationRow[];
    totals: {
      count_realized: number;
      total_booked: number;
      total_nights: number;
      total_realized: number;
    };
  };
}

const fmt = (n: number | undefined | null, cur = "£") =>
  `${cur}${(Number(n) || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-slate-800">{value}</p>
  </div>
);

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left text-xs font-semibold text-rose-400 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">
    {children}
  </th>
);

const TD = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`py-3 pr-4 text-sm text-slate-700 ${className}`}>{children}</td>
);

const getInvStatusStyle = (s?: string) => {
  const v = (s || "").toUpperCase();
  if (v === "PAID") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (v === "AUTHORISED" || v === "AUTHORIZED") return "bg-blue-100 text-blue-700 border-blue-200";
  if (v.includes("PEND")) return "bg-amber-100 text-amber-700 border-amber-200";
  if (v.includes("VOID") || v.includes("CANCEL")) return "bg-slate-100 text-slate-500 border-slate-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const PaymentsTab = ({
  bookingId,
  paymentDetails,
  paymentHistory,
  invoices = [],
  applicableTaxes = [],
  currency
}: PaymentsTabProps) => {
  const [rvRows, setRvRows] = useState<RevenueSplit[]>([]);
  const [rvMeta, setRvMeta] = useState<{ full_rev: string; realized_rev: string; rel_split_count: number; split_count: number } | null>(null);
  const [rvLoading, setRvLoading] = useState(true);

  // useEffect(() => {
  //   const fetchRevenue = async () => {
  //     try {
  //       const res = await proxyFetch(`/aps-api/v1/booked-revenue-splits/?b_id=${bookingId}`);
  //       const raw = res?.data ?? {};
  //       const rows: RevenueSplit[] = Object.values(raw) as RevenueSplit[];
  //       setRvRows(rows);
  //       setRvMeta({
  //         full_rev: res?.full_rev ?? "0",
  //         realized_rev: res?.realized_rev ?? "0",
  //         rel_split_count: Number(res?.rel_split_count ?? 0),
  //         split_count: Number(res?.split_count ?? 0),
  //       });
  //     } catch {
  //       setRvRows([]);
  //     } finally {
  //       setRvLoading(false);
  //     }
  //   };
  //   fetchRevenue();
  // }, [bookingId]);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch(`/booking-details/revenue-realization.json`);
        const json = await res.json();
        const raw = json?.data?.data ?? {};
        const rows: RevenueSplit[] = Object.values(raw) as RevenueSplit[];
        setRvRows(rows);
        setRvMeta({
          full_rev: json?.data?.full_rev ?? "0",
          realized_rev: json?.data?.realized_rev ?? "0",
          rel_split_count: Number(json?.data?.rel_split_count ?? 0),
          split_count: Number(json?.data?.split_count ?? 0),
        });
      } catch {
        setRvRows([]);
      } finally {
        setRvLoading(false);
      }
    };
    fetchRevenue();
  }, []);


  const roomTariff =
    (Number(paymentDetails.room_tariff) || 0) > 0
      ? Number(paymentDetails.room_tariff)
      : Number(paymentDetails.ratePerNight) * Number(paymentDetails.totalNights);

  const balance =
    Number(paymentDetails.balance) !== 0
      ? Number(paymentDetails.balance)
      : Number(paymentDetails.totalAmount) - Number(paymentDetails.total_paid_amount);

  return (
    <div className="space-y-6">

      {/* ── Row 1: Payment Details + Applicable Taxes ── */}
      <div className="grid grid-cols-3 gap-6">

        {/* Payment Details */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Payment Details (GBP)
            </h2>
            <div className="flex items-center gap-2">
              <button className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                ⇄ Currency Converter
              </button>
              <button className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
                + Add Payment
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-3 gap-x-8 gap-y-4 mb-5">
            <Field label="Rent / Night" value={fmt(paymentDetails.ratePerNight, currency)} />
            <Field label="Duration" value={`${Number(paymentDetails.totalNights) || 0} Nights`} />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Room Tariff</p>
              <p className="text-sm font-bold text-slate-900">{fmt(roomTariff, currency)}</p>
            </div>

            <Field label="Add-Ons" value={fmt(paymentDetails.additional_services_amount, currency)} />
            <Field label="Other Charges" value={fmt(paymentDetails.other_charges, currency)} />
            <Field label="Total Tax(es)" value={fmt(paymentDetails.taxAmount, currency)} />

            <Field label="Commission %" value={`${Number(paymentDetails.commission_percentage) || 0}%`} />
            <Field label="Commission Payable" value={fmt(paymentDetails.commission_amount, currency)} />
            <Field label="Security Deposit" value={fmt(paymentDetails.security_deposit_amount, currency)} />

            <Field label="Revenue vs Cancellation" value={fmt(paymentDetails.revenue_against_cancellation, currency)} />
            <Field label="Discount" value={fmt(paymentDetails.discount_amount, currency)} />
            <Field label="Other Discount" value={fmt(paymentDetails.other_discount, currency)} />
          </div>

          <div className="border-t border-slate-200 mb-4" />

          <div className="grid grid-cols-3 gap-x-8 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total</p>
              <p className="text-xl font-bold text-slate-900">{fmt(paymentDetails.totalAmount, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Amount Paid</p>
              <p className="text-xl font-bold text-emerald-600">{fmt(paymentDetails.total_paid_amount, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Balance</p>
              <p className="text-xl font-bold text-rose-600">{fmt(balance, currency)}</p>
            </div>
          </div>

          <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Tax breakdown by line (Exclusive / Inclusive)
          </button>
        </div>

        {/* Applicable Taxes */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Applicable Taxes</h2>
            <button className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors">
              Add / Change
            </button>
          </div>
          {applicableTaxes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No taxes applied</p>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Tax</p>
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Type</p>
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider text-right">Amount</p>
              </div>
              {applicableTaxes.map((t, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 py-2.5 border-b border-slate-50 last:border-0">
                  <p className="text-sm font-medium text-slate-800">{String(t.tax_name ?? t.name ?? "—")}</p>
                  <p className="text-sm text-slate-600">{String(t.type ?? t.tax_type ?? "VAT")}</p>
                  <p className="text-sm font-semibold text-slate-800 text-right">
                    {currency}{(Number(t.amount) || 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Booking Payment History ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Booking Payment History</h2>
          <button className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
            + Add Payment
          </button>
        </div>
        {paymentHistory.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No payment history available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <TH>Payment Mode</TH>
                  <TH>Created At</TH>
                  <TH>Amount</TH>
                  <TH>Reference ID</TH>
                  <TH>Accepted By</TH>
                  <TH>Notes</TH>
                  <TH>Invoice</TH>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((e, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <TD className="font-medium text-slate-800">{e.mode || "—"}</TD>
                    <TD>{e.created_at || "—"}</TD>
                    <TD className="font-semibold text-slate-800">{currency}{(Number(e.amount) || 0).toFixed(2)}</TD>
                    <TD>{e.ref_num ? `${String(e.ref_num).slice(0, 10)}…` : "—"}</TD>
                    <TD>{e.accepted_per || "—"}</TD>
                    <TD className="text-slate-500">{e.notes || "—"}</TD>
                    <td className="py-3 text-sm">
                      {e.receipt_pdf || e.receipt_img ? (
                        <a
                          href={e.receipt_pdf || e.receipt_img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-500 hover:text-rose-700 font-semibold text-xs"
                        >
                          INV-{e.reservation_history_id}
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Revenue Realization ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Revenue Realization</h2>
          {rvMeta && (
            <span className="text-xs text-slate-500">
              {rvMeta.rel_split_count} / {rvMeta.split_count} realized &middot;&nbsp;
              {currency}{rvMeta.realized_rev} of {currency}{rvMeta.full_rev}
            </span>
          )}
        </div>
        {rvLoading ? (
          <p className="text-sm text-slate-400 text-center py-6">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...
          </p>
        ) : rvRows.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No revenue realization data</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <TH>#</TH>
                  <TH>Date of Realization</TH>
                  <TH>Nights</TH>
                  <TH>Booked Revenue</TH>
                  <TH>Realized</TH>
                </tr>
              </thead>
              <tbody>
                {rvRows.map((row, i) => {
                  const isRealized = (row.revenue_realized ?? "").toLowerCase() === "yes";
                  return (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <TD className="text-slate-500">{i + 1}</TD>
                      <TD className="text-slate-800 whitespace-nowrap">{row.date_of_realization ?? "—"}</TD>
                      <TD>{row.nights ?? 0} nights</TD>
                      <TD className="font-medium text-slate-800">{currency}{row.booked_revenue ?? "0"}</TD>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${isRealized
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                          }`}>
                          {row.revenue_realized ?? "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {rvMeta && (
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="py-3 pr-4 text-sm font-semibold text-slate-700" colSpan={3}>Total</td>
                    <TD className="font-semibold text-slate-700">{currency}{rvMeta.full_rev}</TD>
                    <TD className="font-semibold text-emerald-700">{currency}{rvMeta.realized_rev}</TD>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Xero Invoices ── */}
      {invoices.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Xero Invoices</h2>
            <button className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors">
              + Generate New Invoice
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <TH>INV No.</TH>
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => {
                  const invNo = inv.INV_no ?? inv.id ?? "—";
                  const amount =
                    Number.parseFloat((inv.Amount ?? "").toString().replace(/,/g, "")) || 0;
                  const cur = currency
                  return (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <TD className="font-semibold text-slate-800">{invNo}</TD>
                      <TD className="font-semibold text-slate-800">
                        {cur}{amount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </TD>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getInvStatusStyle(inv.Status)}`}>
                          {inv.Status || "Unknown"}
                        </span>
                      </td>
                      <td className="py-3 flex items-center gap-3 text-xs">
                        {inv.Edit && (
                          <>
                            <a href={inv.Edit} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-rose-500 hover:text-rose-700 font-medium transition-colors">
                              View in Xero <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                            {/* <a href={inv.Edit} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-700 font-medium transition-colors">
                              Edit ↗
                            </a> */}
                          </>
                        )}
                        {inv.Publiclink && (
                          <a href={inv.Publiclink} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-700 font-medium transition-colors">
                            Public link
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
