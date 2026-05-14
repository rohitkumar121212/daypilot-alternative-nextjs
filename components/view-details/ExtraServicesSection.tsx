"use client";

import { useState } from "react";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import AddServiceModal, { ExtraService } from "./Modals/AddServiceModal";
import { fetchUtils } from "@/utils/fetchUtils";

interface ExtraServicesSectionProps {
  bookingId: string | number;
  extraServices: ExtraService[];
  currency?: string;
  onRefresh?: () => void;
}

const SERVICE_LIBRARY = [
  "Airport Drop Off", "Airport Pick-Up", "Baby Cot", "Chromecast", "Cleaning Fee",
  "Damaged Linen/Towels", "Deep Cleaning Fee", "Desk & Chair", "Early Check-in",
  "Extra Bed", "Extra Duvet", "Extra Linen", "Extra Towel", "Grocery", "High Chair",
  "Key Collection", "Late Check-Out", "Late Check-In", "Laundry", "London Tour",
  "Lost Keys Penalty", "Meet and Greet", "Parking", "Pet Fee", "Portable AC",
  "Rice Cooker", "Safe Box", "Smoking Penalty", "Spa & Beauty", "Welcome Pack",
  "Damage/Loss Retention", "Others",
];

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left text-xs font-semibold text-rose-400 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">
    {children}
  </th>
);

const TD = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <td className={`py-3 pr-4 text-sm text-slate-700 ${className}`}>{children}</td>;

const BASE_URL = "https://aperfectstay.ai/aps-api/v1";

const ExtraServicesSection = ({
  bookingId,
  extraServices,
  currency = "£",
  onRefresh,
}: ExtraServicesSectionProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ExtraService | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const openEditModal = (svc: ExtraService) => {
    setEditingService(svc);
    setModalOpen(true);
  };

  const handleDelete = async (svc: ExtraService) => {
    if (!svc.id) return;
    const reason = window.prompt(`Cancellation reason for "${svc.service_name}" (required):`);
    if (reason === null) return;
    if (reason.trim().length < 3) {
      alert("Cancellation reason must be at least 3 characters.");
      return;
    }
    setDeletingId(String(svc.id));
    try {
      await fetchUtils.post(
        `${BASE_URL}/bookings/${bookingId}/addons/${svc.id}/cancel`,
        { cancellation_reason: reason.trim() }
      );
      onRefresh?.();
    } catch (err) {
      console.error("Failed to cancel addon:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900">Extra Services / Add Ons</h2>
          <div className="flex items-center gap-2">
            {/* Recalculate always visible */}
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recalculate
            </button>

            {/* Edit toggle */}
            <button
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border ${
                isEditMode
                  ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-700"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              {isEditMode ? "Done" : "Edit"}
            </button>

            {/* Add New Service — only visible in edit mode */}
            {isEditMode && (
              <button
                onClick={openAddModal}
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add New Service
              </button>
            )}
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
                {/* Action column header only in edit mode */}
                {isEditMode && <th className="pb-3 w-20" />}
              </tr>
            </thead>
            <tbody>
              {extraServices.length === 0 ? (
                <tr>
                  <td
                    colSpan={isEditMode ? 9 : 8}
                    className="py-6 text-center text-sm text-slate-400"
                  >
                    No Data Found
                  </td>
                </tr>
              ) : (
                extraServices.map((svc, i) => {
                  const amount =
                    Number.parseFloat(
                      (svc.amount ?? "0").toString().replace(/,/g, "")
                    ) || 0;
                  const status = (svc.payment_status || "").toLowerCase();
                  const statusStyle =
                    status === "paid"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : status === "pending"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-500 border-slate-200";
                  const isDeleting = deletingId === String(svc.id ?? "");

                  return (
                    <tr
                      key={`${svc.id ?? ""}-${i}`}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors"
                    >
                      <TD className="font-medium text-slate-800 whitespace-nowrap">
                        {svc.service_name || "—"}
                      </TD>
                      <TD className="font-semibold text-slate-800 whitespace-nowrap">
                        {currency}{amount.toFixed(2)}
                      </TD>
                      <td className="py-3 pr-4">
                        {svc.payment_status ? (
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${statusStyle}`}
                          >
                            {svc.payment_status}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <TD className="capitalize whitespace-nowrap">
                        {svc.payment_method && svc.payment_method !== "NA"
                          ? svc.payment_method
                          : "—"}
                      </TD>
                      <TD className="whitespace-nowrap">{svc.booked_by || "—"}</TD>
                      <TD className="whitespace-nowrap">{svc.created_at || "—"}</TD>
                      <TD>
                        {svc.reference_number && svc.reference_number !== "NA"
                          ? svc.reference_number
                          : "—"}
                      </TD>
                      <TD className="text-slate-500 max-w-50 truncate">
                        {svc.notes && svc.notes !== "NA" ? svc.notes : "—"}
                      </TD>

                      {/* Row actions — only in edit mode */}
                      {isEditMode && (
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(svc)}
                              title="Edit"
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(svc)}
                              disabled={isDeleting}
                              title="Delete"
                              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
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
                <button className="text-blue-500 hover:text-blue-700 transition-colors">
                  {s}
                </button>
                {i < SERVICE_LIBRARY.length - 1 && ", "}
              </span>
            ))}
          </span>
        </div>
      </div>

      <AddServiceModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingService(null); }}
        bookingId={bookingId}
        currency={currency}
        editingService={editingService}
        onSuccess={onRefresh}
      />
    </>
  );
};

export default ExtraServicesSection;
