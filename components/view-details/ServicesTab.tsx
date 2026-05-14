"use client";

import { proxyFetch } from "@/utils/proxyFetch";
import { Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import ExtraServicesSection from "./ExtraServicesSection";
import ServiceRecoverySection from "./ServiceRecoverySection";

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

const ServicesTab = ({
  bookingId,
  extraServices,
  currency = "£",
}: ServicesTabProps) => {
  const [guestParking, setGuestParking] = useState<Record<string, unknown>[]>([]);
  const [guestAppOrders, setGuestAppOrders] = useState<Record<string, unknown>[]>([]);
  const [serviceRecovery, setServiceRecovery] = useState<Record<string, unknown>[]>([]);
  const [electricityReadings, setElectricityReadings] = useState<{ date: string; data: number }[]>([]);
  const [meterConnected, setMeterConnected] = useState(false);
  const [parkingLoading, setParkingLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [serviceRecoveryLoading, setServiceRecoveryLoading] = useState(true);
  const [electricityLoading, setElectricityLoading] = useState(true);
  
  useEffect(() => {
    // const booking_ID_Test='4551761769529344'
    
    // const fetchParking = async () => {
    //   try {
    //     const res = await proxyFetch(`/aps-api/v1/reserved-parking/?b_id=${bookingId}`);
    //     const data = res?.response_list ?? res?.data ?? res;
    //     const list = Array.isArray(data) ? data.filter((p: Record<string, unknown>) => Object.keys(p).length > 0) : [];
    //     setGuestParking(list);
    //   } catch {
    //     setGuestParking([]);
    //   } finally {
    //     setParkingLoading(false);
    //   }
    // };

    // const fetchOrders = async () => {
    //   try {
    //     const res = await proxyFetch(`/aps-api/v1/guestapp-service-response/?b_id=${bookingId}&response_version=v1`);
    //     const list = res?.response_list ?? res?.data ?? res;
    //     if (Array.isArray(list)) {
    //       const flat = list.flatMap((item: Record<string, unknown>) => {
    //         // Direct object: { created_at, id, type }
    //         if ("created_at" in item || "type" in item) return [item];
    //         // Wrapped object: { "1": { created_at, id, type } }
    //         return Object.values(item) as Record<string, unknown>[];
    //       });
    //       setGuestAppOrders(flat);
    //     } else {
    //       setGuestAppOrders([]);
    //     }
    //   } catch {
    //     setGuestAppOrders([]);
    //   } finally {
    //     setOrdersLoading(false);
    //   }
    // };

    // fetchOrders();
  }, [bookingId]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/booking-details/guest-app-service.json`);
        const json = await res.json();
        const list = json?.data?.response_list ?? [];
        setGuestAppOrders(list);
      } catch {
        setGuestAppOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const res = await fetch(`/booking-details/reserved-parking.json`);
        const json = await res.json();
        const list = json?.data?.response_list ?? [];
        setGuestParking(list);
      } catch {
        setGuestParking([]);
      } finally {
        setParkingLoading(false);
      }
    };
    fetchParking();
  }, []);

  useEffect(() => {
    const fetchServiceRecovery = async () => {
      try {
        const res = await fetch(`/booking-details/service-request.json`);
        const json = await res.json();
        const rawList: Record<string, unknown>[] = json?.data?.response_list ?? [];
        const flat = rawList.flatMap((item) => Object.values(item) as Record<string, unknown>[]);
        setServiceRecovery(flat);
      } catch {
        setServiceRecovery([]);
      } finally {
        setServiceRecoveryLoading(false);
      }
    };
    fetchServiceRecovery();
  }, []);

  useEffect(() => {
    const fetchElectricity = async () => {
      try {
        const res = await fetch(`/booking-details/electricity-usage.json`);
        const json = await res.json();
        const rawList: Record<string, unknown>[] = json?.data?.data ?? [];
        const flat = rawList.flatMap((item) => Object.values(item) as { date: string; data: number }[]);
        setElectricityReadings(flat);
        setMeterConnected(!!json?.data?.message);
      } catch {
        setElectricityReadings([]);
      } finally {
        setElectricityLoading(false);
      }
    };
    fetchElectricity();
  }, []);

  return (
    <div className="space-y-5">
      {/* ── Extra Services / Add Ons ── */}
      <ExtraServicesSection
        bookingId={bookingId}
        extraServices={extraServices}
        currency={currency}
      />

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
        <ServiceRecoverySection
          bookingId={bookingId}
          currency={currency}
          serviceRecovery={serviceRecovery}
          loading={serviceRecoveryLoading}
        />

        {/* Electricity Usage */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Electricity Usage</h2>
            {meterConnected && (
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Meter Connected
              </span>
            )}
          </div>
          {electricityLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400 mr-2" />
              <span className="text-sm text-slate-400">Loading...</span>
            </div>
          ) : !meterConnected ? (
            <div className="flex items-center gap-2 py-2">
              <TriangleAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm font-medium text-amber-600">Meter data not present!</p>
            </div>
          ) : electricityReadings.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No readings available</p>
          ) : (
            (() => {
              const maxVal = Math.max(...electricityReadings.map(r => r.data), 1);
              const chartH = 40;
              const colW = 20;
              const barW = 10;
              const padL = 20;
              const totalW = padL + electricityReadings.length * colW + 20;
              return (
                <div className="overflow-x-auto">
                  <svg viewBox={`0 0 ${totalW} ${chartH + 32}`} className="w-full" style={{ minWidth: `${totalW}px` }}>
                    {[0, 0.5, 1].map((t) => {
                      const y = chartH - t * chartH;
                      const label = (t * maxVal).toFixed(0);
                      return (
                        <g key={t}>
                          <line x1={padL} y1={y} x2={totalW - 4} y2={y} stroke="#f1f5f9" strokeWidth={1} />
                          <text x={padL - 3} y={y + 3} textAnchor="end" fontSize={3} fill="#94a3b8">{label}</text>
                        </g>
                      );
                    })}
                    <line x1={padL} y1={chartH} x2={totalW - 4} y2={chartH} stroke="#e2e8f0" strokeWidth={1} />
                    {electricityReadings.map((r, i) => {
                      const barH = maxVal === 0 ? 2 : Math.max(2, (r.data / maxVal) * chartH);
                      const x = padL + i * colW + (colW - barW) / 2;
                      const y = chartH - barH;
                      return (
                        <g key={i}>
                          <rect x={x} y={y} width={barW} height={barH} rx={3} fill="#3b82f6" opacity={0.75} />
                          <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize={3} fill="#475569" fontWeight={600}>
                            {r.data}
                          </text>
                          <text x={x + barW / 2} y={chartH + 12} textAnchor="middle" fontSize={3} fill="#94a3b8">
                            {r.date}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              );
            })()
          )}
        </div>
      </div>

    </div>
  );
};

export default ServicesTab;
