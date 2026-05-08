"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { proxyFetch } from "@/utils/proxyFetch";

export interface BookingDetailsData {
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
  lead_source: string;
  name: string;
  phone: string | null;
  sales_channel: string;
  sales_person: string;
  salesforce_id: string;
  salesforce_log_no: string;
}

interface BookingDetailsCardProps {
  bookingDetails: BookingDetailsData;
  bookingId: number | null;
  onSave?: (data: Partial<BookingDetailsData>) => void;
}

// ── Label/value cell ──────────────────────────────────────────────────────────

const LabelField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="min-w-0">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <div className="text-sm font-semibold text-slate-800 break-words">{children}</div>
  </div>
);

const EditField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="min-w-0">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
    />
  </div>
);

// Status badge colour map
const statusBadge = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("check") && s.includes("in"))
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (s.includes("check") && s.includes("out"))
    return "bg-slate-100 text-slate-600 border border-slate-200";
  if (s.includes("cancel"))
    return "bg-red-100 text-red-600 border border-red-200";
  if (s.includes("pending") || s.includes("confirm"))
    return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-blue-100 text-blue-700 border border-blue-200";
};

// ─────────────────────────────────────────────────────────────────────────────

const BookingDetailsCard = ({
  bookingDetails,
  bookingId,
  onSave,
}: BookingDetailsCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [accounts, setAccounts] = useState<{ id: string | number; name: string }[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [form, setForm] = useState({
    channel_ota_name: bookingDetails.channel_ota_name,
    sales_channel: bookingDetails.sales_channel,
    enquiry_manager: bookingDetails.enquiry_manager,
    sales_person: bookingDetails.sales_person,
    account: bookingDetails.account,
    booker_name: bookingDetails.booker_name,
    booker_email: bookingDetails.booker_email,
    lead_source: bookingDetails.lead_source,
    cancellation_policy: bookingDetails.cancellation_policy,
    booking_status: bookingDetails.booking_status,
  });
  const [snapshot, setSnapshot] = useState(form);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleEdit = async () => {
    setSnapshot(form);
    setIsEditing(true);
    setAccountsLoading(true);
    try {
      const res = await proxyFetch(`/aps-api/v1/case-accounts/?response_version=1`);
      console.log(res,"response ----------------")
      const list: Record<string, unknown>[] = res?.data?.account_list ?? [];
      const normalised = list.map((a) => ({
        id: String(a.account_id ?? ""),
        name: String(a["data-string"] ?? a.account_id ?? ""),
      }));
      setAccounts(normalised);
    } catch {
      // keep empty — field stays as free-text fallback
    } finally {
      setAccountsLoading(false);
    }
  };
  const handleCancel = () => { setForm(snapshot); setIsEditing(false); };
  const handleSave = () => { setIsEditing(false); onSave?.(form); };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Booking Details</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors"
          >
            {showAll ? "Hide extra fields ←" : "Show all fields →"}
          </button>
          {isEditing ? (
            <div className="flex gap-1.5">
              <button onClick={handleCancel} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors">
                <X className="w-3 h-3" />Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors">
                <Check className="w-3 h-3" />Save
              </button>
            </div>
          ) : (
            <button onClick={handleEdit} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors">
              <Pencil className="w-3 h-3" />Edit
            </button>
          )}
        </div>
      </div>

      {/* Main fields — 3 col grid */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-5">

        {/* Row 1: Status / Channel / Sales Channel */}
        <LabelField label="Status">
          {isEditing ? (
            <input type="text" value={form.booking_status} onChange={(e) => set("booking_status")(e.target.value)} className="w-full text-sm font-semibold rounded-lg px-2.5 py-1 border border-slate-200 outline-none focus:border-rose-400 bg-white text-slate-800" />
          ) : (
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(form.booking_status)}`}>
              {form.booking_status || "—"}
            </span>
          )}
        </LabelField>
        {isEditing
          ? <EditField label="Channel" value={form.channel_ota_name} onChange={set("channel_ota_name")} />
          : <LabelField label="Channel">{form.channel_ota_name || "—"}</LabelField>}
        {isEditing
          ? <EditField label="Sales Channel" value={form.sales_channel} onChange={set("sales_channel")} />
          : <LabelField label="Sales Channel">{form.sales_channel || "—"}</LabelField>}

        {/* Row 2: Enquiry Manager / Sales Person / Account */}
        {isEditing
          ? <EditField label="Enquiry Manager" value={form.enquiry_manager} onChange={set("enquiry_manager")} />
          : <LabelField label="Enquiry Manager">{form.enquiry_manager || "—"}</LabelField>}
        {isEditing
          ? <EditField label="Sales Person" value={form.sales_person} onChange={set("sales_person")} />
          : <LabelField label="Sales Person">{form.sales_person || "—"}</LabelField>}
        {isEditing ? (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account</p>
            {accountsLoading ? (
              <div className="text-xs text-slate-400 py-2">Loading accounts…</div>
            ) : accounts.length > 0 ? (
              <select
                value={form.account}
                onChange={(e) => set("account")(e.target.value)}
                className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
              >
                <option value="">— Select Account —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.account}
                onChange={(e) => set("account")(e.target.value)}
                className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
              />
            )}
          </div>
        ) : (
          <LabelField label="Account">{form.account || "—"}</LabelField>
        )}

        {/* Row 3: Booker Name / Booker Email / Lead Source */}
        {isEditing
          ? <EditField label="Booker Name" value={form.booker_name} onChange={set("booker_name")} />
          : <LabelField label="Booker Name">{form.booker_name || "—"}</LabelField>}
        {isEditing
          ? <EditField label="Booker Email" value={form.booker_email} onChange={set("booker_email")} />
          : <LabelField label="Booker Email">{form.booker_email || "—"}</LabelField>}
        {isEditing
          ? <EditField label="Lead Source" value={form.lead_source} onChange={set("lead_source")} />
          : <LabelField label="Lead Source">{form.lead_source || "—"}</LabelField>}

        {/* Row: Apartment Name / Apartment ID */}
        <LabelField label="Apartment Name">
          {bookingDetails.apartment?.name || "—"}
        </LabelField>
        <LabelField label="Apartment ID">
          {bookingDetails.apartment?.id ? String(bookingDetails.apartment.id) : "—"}
        </LabelField>
        <div />

        {/* Row 4: Cancellation Policy / Do Not Move / Created */}
        {isEditing
          ? <EditField label="Cancellation Policy" value={form.cancellation_policy} onChange={set("cancellation_policy")} />
          : <LabelField label="Cancellation Policy">{form.cancellation_policy || <span className="text-slate-300">— Select —</span>}</LabelField>}
        <LabelField label="Do Not Move">
          {bookingDetails.do_not_move ? "Yes" : "No"}
        </LabelField>
        <LabelField label="Created">
          {bookingDetails.booking_created_at || "—"}
        </LabelField>
      </div>

      {/* Extended fields — shown when "Show all fields" is toggled */}
      {showAll && (
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-3 gap-x-6 gap-y-5">
          <LabelField label="Booking ID">{String(bookingId ?? "—")}</LabelField>
          <LabelField label="Enquiry App ID">{bookingDetails.enquiry_app_id || "—"}</LabelField>
          <LabelField label="Booking Reference">{bookingDetails.booking_reference || "—"}</LabelField>
          <LabelField label="Salesforce ID">{bookingDetails.salesforce_id || "—"}</LabelField>
          <LabelField label="Salesforce Log No">{bookingDetails.salesforce_log_no || "—"}</LabelField>
          <LabelField label="Room Index">{bookingDetails.booking_room_index || "—"}</LabelField>
          <LabelField label="Channel Manager ID">{bookingDetails.channel_manager_id || "—"}</LabelField>
          <LabelField label="Channel Mgr System ID">{bookingDetails.channel_manager_system_id || "—"}</LabelField>
          <LabelField label="Channel Mgr Unique ID">{bookingDetails.channel_manager_unique_id || "—"}</LabelField>
          <LabelField label="OTA Reservation Code">{bookingDetails.channel_manager_ota_reservation_code || "—"}</LabelField>
          {/* <LabelField label="Duration">{bookingDetails.duration ? `${bookingDetails.duration} nights` : "—"}</LabelField> */}
          <LabelField label="Force Overbook">{bookingDetails.force_overbook || "—"}</LabelField>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsCard;
