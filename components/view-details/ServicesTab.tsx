"use client";

import { proxyFetch } from "@/utils/proxyFetch";
import { Loader2, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

interface ExtraService {
  id?: string;
  service_name?: string;
  amount?: string | number;
  notes?: string;
  payment_status?: string;
  payment_method?: string;
  booked_by?: string;
  created_at?: string;
  reference_number?: string;
  service_type?: string;
  [key: string]: unknown;
}

interface ServicesTabProps {
  bookingId: string | number;
  preArrivalFormCompleted?: boolean;
  recentInspections?: Record<string, unknown>[];
  extraServices: ExtraService[];
  serviceRecoveryRequests: Record<string, unknown>[];
  electricityUsage?: {
    meter_data_present: boolean;
    readings: unknown[];
  };
  currency?: string;
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left text-xs font-semibold text-rose-400 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">
    {children}
  </th>
);

const TD = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`py-3 pr-4 text-sm text-slate-700 ${className}`}>{children}</td>
);

const EmptyRow = ({ cols }: { cols: number }) => (
  <tr>
    <td colSpan={cols} className="py-6 text-center text-sm text-slate-400">
      No Data Found
    </td>
  </tr>
);

const SERVICE_LIBRARY = [
  "Airport Drop Off", "Airport Pick-Up", "Baby Cot", "Chromecast", "Cleaning Fee",
  "Damaged Linen/Towels", "Deep Cleaning Fee", "Desk & Chair", "Early Check-in",
  "Extra Bed", "Extra Duvet", "Extra Linen", "Extra Towel", "Grocery", "High Chair",
  "Key Collection", "Late Check-Out", "Late Check-In", "Laundry", "London Tour",
  "Lost Keys Penalty", "Meet and Greet", "Parking", "Pet Fee", "Portable AC",
  "Rice Cooker", "Safe Box", "Smoking Penalty", "Spa & Beauty", "Welcome Pack",
  "Damage/Loss Retention", "Others",
];

const ServicesTab = ({
  bookingId,
  extraServices,
  serviceRecoveryRequests,
  electricityUsage,
  currency = "£",
}: ServicesTabProps) => {
  const [guestParking, setGuestParking] = useState<Record<string, unknown>[]>([]);
  const [guestAppOrders, setGuestAppOrders] = useState<Record<string, unknown>[]>([]);
  const [parkingLoading, setParkingLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    // const booking_ID_Test='4551761769529344'
    const fetchParking = async () => {
      try {
        const res = await proxyFetch(`/aps-api/v1/reserved-parking/?b_id=${bookingId}`);
        const data = res?.response_list ?? res?.data ?? res;
        const list = Array.isArray(data) ? data.filter((p: Record<string, unknown>) => Object.keys(p).length > 0) : [];
        setGuestParking(list);
      } catch {
        setGuestParking([]);
      } finally {
        setParkingLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await proxyFetch(`/aps-api/v1/guestapp-service-response/?b_id=${bookingId}&response_version=v1`);
        const list = res?.response_list ?? res?.data ?? res;
        if (Array.isArray(list)) {
          const flat = list.flatMap((item: Record<string, unknown>) => {
            // Direct object: { created_at, id, type }
            if ("created_at" in item || "type" in item) return [item];
            // Wrapped object: { "1": { created_at, id, type } }
            return Object.values(item) as Record<string, unknown>[];
          });
          setGuestAppOrders(flat);
        } else {
          setGuestAppOrders([]);
        }
      } catch {
        setGuestAppOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchParking();
    fetchOrders();
  }, [bookingId]);

  return (
    <div className="space-y-5">
      {/* ── Extra Services / Add Ons ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900">Extra Services / Add Ons</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Recalculate
            </button>
            <button className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              + Add New Service
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <TH>Service</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
                <TH>Payment Method</TH>
                <TH>Booked By</TH>
                <TH>Created At</TH>
                <TH>Ref No.</TH>
                <TH>Notes</TH>
                <th className="pb-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {extraServices.length === 0 ? (
                <EmptyRow cols={9} />
              ) : (
                extraServices.map((svc, i) => {
                  const amount = Number.parseFloat(
                    (svc.amount ?? "0").toString().replace(/,/g, "")
                  ) || 0;
                  const status = (svc.payment_status || "").toLowerCase();
                  const statusStyle =
                    status === "paid"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : status === "pending"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-500 border-slate-200";
                  return (
                    <tr key={`${svc.id ?? ""}-${i}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors">
                      <TD className="font-medium text-slate-800 whitespace-nowrap">{svc.service_name || "—"}</TD>
                      <TD className="font-semibold text-slate-800 whitespace-nowrap">{currency}{amount.toFixed(2)}</TD>
                      <td className="py-3 pr-4">
                        {svc.payment_status ? (
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${statusStyle}`}>
                            {svc.payment_status}
                          </span>
                        ) : "—"}
                      </td>
                      <TD className="capitalize whitespace-nowrap">
                        {svc.payment_method && svc.payment_method !== "NA" ? svc.payment_method : "—"}
                      </TD>
                      <TD className="whitespace-nowrap">{svc.booked_by || "—"}</TD>
                      <TD className="whitespace-nowrap">{svc.created_at || "—"}</TD>
                      <TD>
                        {svc.reference_number && svc.reference_number !== "NA" ? svc.reference_number : "—"}
                      </TD>
                      <TD className="text-slate-500 max-w-50 truncate">
                        {svc.notes && svc.notes !== "NA" ? svc.notes : "—"}
                      </TD>
                      <td className="py-3">
                        <button className="text-slate-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Service Library */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Library includes {SERVICE_LIBRARY.length} services:{" "}
            {SERVICE_LIBRARY.map((s, i) => (
              <span key={s}>
                <button className="text-blue-500 hover:text-blue-700 transition-colors">{s}</button>
                {i < SERVICE_LIBRARY.length - 1 && ", "}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* ── Guest Parking + Guest App Orders ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Guest Parking */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Guest Parking</h2>
            <button className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
              + Add New Parking
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <TH>S No.</TH>
                  <TH>Name</TH>
                  <TH>Reserved By</TH>
                  <TH>Start</TH>
                  <TH>End</TH>
                  <TH>Notes</TH>
                </tr>
              </thead>
              <tbody>
                {parkingLoading ? (
                  <tr><td colSpan={6} className="py-6 text-center text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...
                  </td></tr>
                ) : guestParking.length === 0 ? (
                  <EmptyRow cols={6} />
                ) : (
                  guestParking.map((p: Record<string, unknown>, i: number) => (
                    <tr key={String(p.parking_id ?? i)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                      <TD className="text-slate-500">{i + 1}</TD>
                      <TD className="font-medium text-slate-800">{String(p.name ?? "—")}</TD>
                      <TD>{String(p.reserved_by || "—")}</TD>
                      <TD className="whitespace-nowrap">{String(p.start_date ?? "—")}</TD>
                      <TD className="whitespace-nowrap">{String(p.end_date ?? "—")}</TD>
                      <TD className="text-slate-500">{String(p.notes || "—")}</TD>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guest App Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Guest App Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <TH>S No.</TH>
                  <TH>Created At</TH>
                  <TH>Type</TH>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr><td colSpan={3} className="py-6 text-center text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...
                  </td></tr>
                ) : guestAppOrders.length === 0 ? (
                  <EmptyRow cols={3} />
                ) : (
                  guestAppOrders.map((o: Record<string, unknown>, i: number) => (
                    <tr key={String(o.id ?? i)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                      <TD className="text-slate-500">{i + 1}</TD>
                      <TD className="whitespace-nowrap">{String(o.created_at ?? "—")}</TD>
                      <TD>{String(o.type ?? o.order_type ?? "—")}</TD>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Service Recovery + Electricity Usage ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Service Recovery */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Service Recovery</h2>
            <button className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              + Create Service
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <TH>S No.</TH>
                  <TH>Name</TH>
                  <TH>Date</TH>
                  <TH>Cost</TH>
                  <TH>Notes</TH>
                </tr>
              </thead>
              <tbody>
                {serviceRecoveryRequests && serviceRecoveryRequests.length === 0 ? (
                  <EmptyRow cols={5} />
                ) : (
                  serviceRecoveryRequests?.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                      <TD className="text-slate-500">{i + 1}</TD>
                      <TD className="font-medium text-slate-800">{String(r.name ?? r.title ?? "—")}</TD>
                      <TD>{String(r.date ?? r.created_at ?? "—")}</TD>
                      <TD>{currency}{(Number(r.cost ?? r.amount ?? 0)).toFixed(2)}</TD>
                      <TD className="text-slate-500">{String(r.notes ?? "—")}</TD>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Electricity Usage */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Electricity Usage</h2>
          </div>
          {!electricityUsage?.meter_data_present ? (
            <div className="flex items-center gap-2 py-2">
              <TriangleAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm font-medium text-amber-600">Meter data not present!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(electricityUsage.readings as Record<string, unknown>[]).map((r, i) => (
                <div key={i} className="flex flex-wrap gap-4 py-2 border-b border-slate-50 last:border-0">
                  {Object.entries(r).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-slate-400 capitalize">{k.replace(/_/g, " ")}</p>
                      <p className="text-sm font-medium text-slate-800">{String(v ?? "—")}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ServicesTab;
