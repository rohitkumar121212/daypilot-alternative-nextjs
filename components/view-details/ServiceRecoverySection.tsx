"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import CreateServiceModal from "./Modals/CreateServiceModal";

interface ServiceRecoverySectionProps {
  bookingId: string | number;
  currency?: string;
  serviceRecovery: Record<string, unknown>[];
  loading: boolean;
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left text-xs font-semibold text-rose-400 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">
    {children}
  </th>
);

const TD = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`py-3 pr-4 text-sm text-slate-700 ${className}`}>{children}</td>
);

const ServiceRecoverySection = ({
  bookingId,
  currency = "£",
  serviceRecovery,
  loading,
}: ServiceRecoverySectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Service Recovery</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
          >
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...
                  </td>
                </tr>
              ) : serviceRecovery.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    No Data Found
                  </td>
                </tr>
              ) : (
                serviceRecovery.map((r, i) => (
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

      <CreateServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bookingId={bookingId}
        currency={currency}
      />
    </>
  );
};

export default ServiceRecoverySection;
