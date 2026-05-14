"use client";

import { fetchUtils } from "@/utils/fetchUtils";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

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
  sectionKey?: string;
  bookingDetails: BookingDetailsData;
  bookingId: number | null;
  onSave?: (section: string, data: Partial<BookingDetailsData>) => void;
}

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


const ToggleField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="min-w-0">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${value ? "bg-rose-500" : "bg-slate-200"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-1"}`}
      />
    </button>
  </div>
);

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

const BookingDetailsCard = ({
  sectionKey = "booking_details",
  bookingDetails,
  bookingId,
  onSave,
}: BookingDetailsCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [accounts, setAccounts] = useState<{ id: string | number; name: string }[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const [apartments, setApartments] = useState<{ id: string; name: string }[]>([]);
  const [apartmentsLoading, setApartmentsLoading] = useState(false);
  const [apartmentsError, setApartmentsError] = useState<string | null>(null);

  const [forceOverbook, setForceOverbook] = useState(
    bookingDetails.force_overbook === "true" || bookingDetails.force_overbook === "1"
  );
  const [doNotMove, setDoNotMove] = useState(bookingDetails.do_not_move);
  const [boolSnap, setBoolSnap] = useState({ forceOverbook: false, doNotMove: false });

  const [form, setForm] = useState({
    channel_ota_name: bookingDetails.channel_ota_name,
    sales_channel: bookingDetails.sales_channel,
    enquiry_manager: bookingDetails.enquiry_manager,
    sales_person: bookingDetails.sales_person,
    account: bookingDetails.account,
    account_id: "",
    apartment_id: bookingDetails.apartment?.id ? String(bookingDetails.apartment.id) : "",
    apartment_name: bookingDetails.apartment?.name ?? "",
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
    setBoolSnap({ forceOverbook, doNotMove });
    setIsEditing(true);
    setAccountsLoading(true);
    setAccountsError(null);
    setApartmentsLoading(true);
    setApartmentsError(null);
    try {
      const [accountsRes, apartmentsRes] = await Promise.all([
        fetchUtils.get("https://aperfectstay.ai/aps-api/v1/case-accounts/?response_version=1"),
        fetchUtils.get("https://aperfectstay.ai/aps-api/v1/apartments/?response_version=v1"),
      ]);
      const accountList: Record<string, unknown>[] = accountsRes?.data?.data?.account_list ?? [];
      setAccounts(accountList.map((a) => ({
        id: String(a.account_id ?? ""),
        name: String(a["data-string"] ?? a.account_id ?? ""),
      })));
      const apartmentList: Record<string, unknown>[] = apartmentsRes?.data?.data?.apartment_list ?? [];
      setApartments(apartmentList.map((a) => ({
        id: String(a.apartment_id ?? ""),
        name: String(a["data-string"] ?? a.apartment_id ?? ""),
      })));
    } catch (err) {
      console.error("Failed to load dropdown data:", err);
      setAccountsError("Could not load accounts");
      setApartmentsError("Could not load apartments");
    } finally {
      setAccountsLoading(false);
      setApartmentsLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(snapshot);
    setForceOverbook(boolSnap.forceOverbook);
    setDoNotMove(boolSnap.doNotMove);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    const payload = {
      [sectionKey]: {
        booking_type: form.booking_status,
        account_name: form.account_id ? Number(form.account_id) : form.account,
        cancellation_type: form.cancellation_policy,
        apartment_input: form.apartment_id ? Number(form.apartment_id) : (bookingDetails.apartment?.id ?? null),
        forceoverbook_input: forceOverbook,
        do_not_move: doNotMove,
      },
    };
    console.log("API Payload -->", payload);
    onSave?.(sectionKey, form);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Booking Details</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors cursor-pointer"
          >
            {showAll ? "Hide extra fields ←" : "Show all fields →"}
          </button>
          {isEditing ? (
            <div className="flex gap-1.5">
              <button onClick={handleCancel} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer">
                <X className="w-3 h-3" />Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer">
                <Check className="w-3 h-3" />Save
              </button>
            </div>
          ) : (
            <button onClick={handleEdit} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors cursor-pointer">
              <Pencil className="w-3 h-3" />Edit
            </button>
          )}
        </div>
      </div>

      {/* Main fields — 3 col grid */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-5">

        {/* Row 1: Status (editable) | Channel (disabled) | Sales Channel (disabled) */}
        <LabelField label="Status">
          {isEditing ? (
            <select
              value={form.booking_status}
              onChange={(e) => set("booking_status")(e.target.value)}
              className="w-full text-sm font-semibold rounded-lg px-2.5 py-1 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
            >
              <option value="">— Select Status —</option>
              {["Confirmed", "Pending", "Checked In", "Checked Out", "Cancelled", "No Show", "Provisional"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(form.booking_status)}`}>
              {form.booking_status || "—"}
            </span>
          )}
        </LabelField>
        <LabelField label="Channel">{form.channel_ota_name || "—"}</LabelField>
        <LabelField label="Sales Channel">{form.sales_channel || "—"}</LabelField>

        {/* Row 2: Enquiry Manager (disabled) | Sales Person (disabled) | Account (editable) */}
        <LabelField label="Enquiry Manager">{form.enquiry_manager || "—"}</LabelField>
        <LabelField label="Sales Person">{form.sales_person || "—"}</LabelField>
        {isEditing ? (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account</p>
            {accountsLoading ? (
              <div className="text-xs text-slate-400 py-2">Loading accounts…</div>
            ) : accountsError ? (
              <div className="text-xs text-red-500 py-2">{accountsError} — type manually below
                <input
                  type="text"
                  value={form.account}
                  onChange={(e) => set("account")(e.target.value)}
                  className="mt-1 w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-red-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
                />
              </div>
            ) : accounts.length > 0 ? (
              <select
                value={form.account_id}
                onChange={(e) => {
                  const selected = accounts.find((a) => a.id === e.target.value);
                  setForm((p) => ({ ...p, account_id: e.target.value, account: selected?.name ?? e.target.value }));
                }}
                className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
              >
                <option value="">— Select Account —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
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

        {/* Row 3: Booker Name (disabled) | Booker Email (disabled) | Lead Source (disabled) */}
        <LabelField label="Booker Name">{form.booker_name || "—"}</LabelField>
        <LabelField label="Booker Email">{form.booker_email || "—"}</LabelField>
        <LabelField label="Lead Source">{form.lead_source || "—"}</LabelField>

        {/* Row 4: Apartment Name (editable) | Apartment ID (display) | empty */}
        {isEditing ? (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Apartment Name</p>
            {apartmentsLoading ? (
              <div className="text-xs text-slate-400 py-2">Loading apartments…</div>
            ) : apartmentsError ? (
              <div className="text-xs text-red-500 py-2">{apartmentsError} — type manually below
                <input
                  type="text"
                  value={form.apartment_name}
                  onChange={(e) => setForm((p) => ({ ...p, apartment_name: e.target.value }))}
                  className="mt-1 w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-red-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
                />
              </div>
            ) : apartments.length > 0 ? (
              <select
                value={form.apartment_id}
                onChange={(e) => {
                  const selected = apartments.find((a) => a.id === e.target.value);
                  setForm((p) => ({ ...p, apartment_id: e.target.value, apartment_name: selected?.name ?? e.target.value }));
                }}
                className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
              >
                <option value="">— Select Apartment —</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.apartment_name}
                onChange={(e) => setForm((p) => ({ ...p, apartment_name: e.target.value }))}
                className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
              />
            )}
          </div>
        ) : (
          <LabelField label="Apartment Name">{form.apartment_name || "—"}</LabelField>
        )}
        <LabelField label="Apartment ID">{form.apartment_id || "—"}</LabelField>
        <div />

        {/* Row 5: Cancellation Policy (editable) | Do Not Move (editable toggle) | Force Overbook (editable toggle) */}
        {isEditing ? (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cancellation Policy</p>
            <select
              value={form.cancellation_policy}
              onChange={(e) => set("cancellation_policy")(e.target.value)}
              className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
            >
              <option value="">— Select —</option>
              {["Flexible", "Moderate", "Strict", "Non-refundable", "Free Cancellation", "24 Hours", "48 Hours", "72 Hours"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        ) : (
          <LabelField label="Cancellation Policy">{form.cancellation_policy || <span className="text-slate-300">— Select —</span>}</LabelField>
        )}
        {isEditing
          ? <ToggleField label="Do Not Move" value={doNotMove} onChange={setDoNotMove} />
          : <LabelField label="Do Not Move">{doNotMove ? "Yes" : "No"}</LabelField>}
        {isEditing
          ? <ToggleField label="Force Overbook" value={forceOverbook} onChange={setForceOverbook} />
          : <LabelField label="Force Overbook">{forceOverbook ? "Yes" : "No"}</LabelField>}
      </div>

      {/* Extended fields — shown when "Show all fields" is toggled */}
      {showAll && (
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-3 gap-x-6 gap-y-5">
          <LabelField label="Booking ID">{String(bookingId ?? "—")}</LabelField>
          <LabelField label="Created">{bookingDetails.booking_created_at || "—"}</LabelField>
          <LabelField label="Enquiry App ID">{bookingDetails.enquiry_app_id || "—"}</LabelField>
          <LabelField label="Booking Reference">{bookingDetails.booking_reference || "—"}</LabelField>
          <LabelField label="Salesforce ID">{bookingDetails.salesforce_id || "—"}</LabelField>
          <LabelField label="Salesforce Log No">{bookingDetails.salesforce_log_no || "—"}</LabelField>
          <LabelField label="Room Index">{bookingDetails.booking_room_index || "—"}</LabelField>
          <LabelField label="Channel Manager ID">{bookingDetails.channel_manager_id || "—"}</LabelField>
          <LabelField label="Channel Mgr System ID">{bookingDetails.channel_manager_system_id || "—"}</LabelField>
          <LabelField label="Channel Mgr Unique ID">{bookingDetails.channel_manager_unique_id || "—"}</LabelField>
          <LabelField label="OTA Reservation Code">{bookingDetails.channel_manager_ota_reservation_code || "—"}</LabelField>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsCard;
