"use client";

import { ClipboardList } from "lucide-react";

export interface GuestDetails {
  address?: string;
  created_at: string;
  email: string;
  full_name: string;
  goki_code: string;
  guest_id: string;
  guest_keys: number;
  occupancy: { adults: string; children: string };
  old_checkin_date: string;
  old_checkout_date: string;
  phone: string;
  prearrival_form_completed: boolean;
  representative_name: string;
}

interface GuestInformationProps {
  guestDetails: GuestDetails;
  checkInDisplay?: string;
  checkOutDisplay?: string;
  onSave?: (data: Partial<GuestDetails>) => void;
}

const F = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-800 break-words">
      {value === "" || value === null || value === undefined || value === "None"
        ? "—"
        : String(value)}
    </p>
  </div>
);

const GuestInformation = ({
  guestDetails: g,
  checkInDisplay,
  checkOutDisplay,
  onSave: _onSave,
}: GuestInformationProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Primary Guest</h2>
        <div className="flex items-center gap-2">
          <button className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
            View Profile →
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
            <ClipboardList className="w-3.5 h-3.5" />
            Registration Card
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
            <ClipboardList className="w-3.5 h-3.5" />
            Booking Voucher
          </button>
        </div>
      </div>

      {/* 3-col field grid */}
      <div className="grid grid-cols-3 gap-x-8 gap-y-5 mb-5">
        <F label="Full Name" value={g.full_name} />
        <F label="Email" value={g.email} />
        <F label="Phone" value={g.phone} />

        <F label="Check-In Time" value={checkInDisplay || "—"} />
        <F label="Check-Out Time" value={checkOutDisplay || "—"} />
        <F label="Guest Keys" value={g.guest_keys} />

        <F label="Representative" value={g.representative_name} />
        <F label="Goki Code" value={g.goki_code} />
        <F label="Old Check-In" value={g.old_checkin_date} />

        <F label="Old Check-Out" value={g.old_checkout_date} />
        <F label="Adults" value={g.occupancy?.adults} />
        <F label="Children" value={g.occupancy?.children} />
      </div>

      <div className="border-t border-slate-200 mb-5" />

      {/* Bottom: system IDs */}
      <div className="grid grid-cols-3 gap-x-8">
        <F label="Guest ID" value={g.guest_id} />
        <F label="Created At" value={g.created_at} />
      </div>
    </div>
  );
};

export default GuestInformation;
