"use client";

import { useState } from "react";
import {
  BookOpen,
  Database,
  RefreshCw,
  Bell,
  Pencil,
  Check,
  X,
} from "lucide-react";

export interface BookingDetailsData {
  account: string;
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

export interface BookingHeaderData {
  apartment_address: string;
  apartment_name: string;
  booking_id: number | null;
  booking_reference: string;
  enquiry_app_id: string;
}

export interface SyncStatusData {
  enquiry_app_sync_state: string;
  salesforce_sync_state: string;
  staah_sync_state: string;
}

export interface AlertsData {
  apartment_lease_end_date: string | null;
  custom_alerts: string[];
}

interface BookingDetailsSidebarProps {
  bookingDetails: BookingDetailsData;
  bookingHeader: BookingHeaderData;
  syncStatus: SyncStatusData;
  alerts: AlertsData;
  onSave?: (data: BookingDetailsData) => void;
}

// ── Helper components ─────────────────────────────────────────────────────────

const Field = ({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) => (
  <div>
    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-slate-800 break-words">
      {value === null || value === undefined || value === ""
        ? "—"
        : typeof value === "boolean"
        ? value ? "Yes" : "No"
        : String(value)}
    </p>
  </div>
);

const EditField = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) => (
  <div>
    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
    {disabled ? (
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
      />
    )}
  </div>
);

const Divider = () => <div className="border-t border-slate-50" />;

const SyncBadge = ({ state }: { state: string }) => {
  const lower = (state ?? "").toLowerCase();
  const cls =
    lower === "" || lower.includes("sync") || lower.includes("success")
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : lower.includes("pend") || lower.includes("progress")
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {state || "—"}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const BookingDetailsSidebar = ({
  bookingDetails,
  bookingHeader,
  syncStatus,
  alerts,
  onSave,
}: BookingDetailsSidebarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    booking_status: bookingDetails.booking_status,
    channel_ota_name: bookingDetails.channel_ota_name,
    sales_channel: bookingDetails.sales_channel,
    sales_person: bookingDetails.sales_person,
    enquiry_manager: bookingDetails.enquiry_manager,
    account: bookingDetails.account,
    name: bookingDetails.name,
    email: bookingDetails.email,
    phone: bookingDetails.phone ?? "",
    booker_name: bookingDetails.booker_name,
    booker_email: bookingDetails.booker_email,
    lead_source: bookingDetails.lead_source,
    cancellation_policy: bookingDetails.cancellation_policy,
  });
  const [snapshot, setSnapshot] = useState(form);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleEdit = () => {
    setSnapshot(form);
    setIsEditing(true);
  };
  const handleCancel = () => {
    setForm(snapshot);
    setIsEditing(false);
  };
  const handleSave = () => {
    setIsEditing(false);
    onSave?.({ ...bookingDetails, ...form });
  };

  return (
    <div className="space-y-4">

      {/* Alerts */}
      {alerts.apartment_lease_end_date && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700">Lease End Alert</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Apartment lease ends on {alerts.apartment_lease_end_date}
              </p>
            </div>
          </div>
        </div>
      )}

      {alerts.custom_alerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-1.5">
          {alerts.custom_alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <Bell className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700">{a}</p>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details (editable) */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <BookOpen className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Booking Details</h3>
          </div>
          {isEditing ? (
            <div className="flex gap-1.5">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              >
                <X className="w-3 h-3" />Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
              >
                <Check className="w-3 h-3" />Save
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors"
            >
              <Pencil className="w-3 h-3" />Edit
            </button>
          )}
        </div>

        <div className="space-y-3.5">
          <EditField label="Status" value={form.booking_status} onChange={set("booking_status")} disabled={!isEditing} />
          <Divider />
          <EditField label="Channel (OTA)" value={form.channel_ota_name} onChange={set("channel_ota_name")} disabled={!isEditing} />
          <Divider />
          <EditField label="Sales Channel" value={form.sales_channel} onChange={set("sales_channel")} disabled={!isEditing} />
          <Divider />
          <EditField label="Enquiry Manager" value={form.enquiry_manager} onChange={set("enquiry_manager")} disabled={!isEditing} />
          <Divider />
          <EditField label="Sales Person" value={form.sales_person} onChange={set("sales_person")} disabled={!isEditing} />
          <Divider />
          <EditField label="Account" value={form.account} onChange={set("account")} disabled={!isEditing} />
          <Divider />
          <EditField label="Lead Source" value={form.lead_source} onChange={set("lead_source")} disabled={!isEditing} />
          <Divider />
          <EditField label="Cancellation Policy" value={form.cancellation_policy} onChange={set("cancellation_policy")} disabled={!isEditing} />
          <Divider />
          <EditField label="Booker Name" value={form.booker_name} onChange={set("booker_name")} disabled={!isEditing} />
          <Divider />
          <EditField label="Booker Email" value={form.booker_email} onChange={set("booker_email")} disabled={!isEditing} />
          <Divider />
          <EditField label="Guest Name" value={form.name} onChange={set("name")} disabled={!isEditing} />
          <Divider />
          <EditField label="Guest Email" value={form.email} onChange={set("email")} disabled={!isEditing} />
          <Divider />
          <EditField label="Guest Phone" value={form.phone} onChange={set("phone")} disabled={!isEditing} />
          <Divider />
          <Field label="Created At" value={bookingDetails.booking_created_at} />
          <Divider />
          <Field label="Duration" value={`${bookingDetails.duration} nights`} />
          <Divider />
          <Field label="Do Not Move" value={bookingDetails.do_not_move} />
        </div>
      </div>

      {/* System Identifiers (read-only) */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <Database className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">System Identifiers</h3>
        </div>
        <div className="space-y-3.5">
          <Field label="Booking ID" value={bookingHeader.booking_id} />
          <Divider />
          <Field label="Booking Reference" value={bookingHeader.booking_reference} />
          <Divider />
          <Field label="Enquiry App ID" value={bookingHeader.enquiry_app_id} />
          <Divider />
          <Field label="Salesforce ID" value={bookingDetails.salesforce_id} />
          <Divider />
          <Field label="Salesforce Log No" value={bookingDetails.salesforce_log_no} />
          <Divider />
          <Field label="Channel Manager ID" value={bookingDetails.channel_manager_id} />
          <Divider />
          <Field label="Channel Manager System ID" value={bookingDetails.channel_manager_system_id} />
          <Divider />
          <Field label="Channel Manager Unique ID" value={bookingDetails.channel_manager_unique_id} />
          <Divider />
          <Field label="OTA Reservation Code" value={bookingDetails.channel_manager_ota_reservation_code} />
          <Divider />
          <Field label="Room Index" value={bookingDetails.booking_room_index} />
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Sync Status</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">Salesforce</p>
            <SyncBadge state={syncStatus.salesforce_sync_state} />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">Enquiry App</p>
            <SyncBadge state={syncStatus.enquiry_app_sync_state} />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">Staah</p>
            <SyncBadge state={syncStatus.staah_sync_state} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsSidebar;
