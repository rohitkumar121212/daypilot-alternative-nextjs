"use client";

import { Check, ClipboardList, Pencil, X } from "lucide-react";
import { useState } from "react";

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
  sectionKey?: string;
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

const inputCls = "w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 bg-white text-slate-800 transition-all";

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{children}</p>
);

const GuestInformation = ({
  sectionKey = "guest_information",
  guestDetails: g,
  checkInDisplay,
  checkOutDisplay,
  onSave: _onSave,
}: GuestInformationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    guest_keys: String(g.guest_keys ?? "0"),
    representative_name: g.representative_name || "",
    old_checkin_date: g.old_checkin_date || "",
    old_checkout_date: g.old_checkout_date || "",
    checkin_time: checkInDisplay || "",
    checkout_time: checkOutDisplay || "",
    adult_count: g.occupancy?.adults || "",
    children_count: g.occupancy?.children || "",
    goki_code: g.goki_code || "",
  });
  const [snapshot, setSnapshot] = useState(form);

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));
  const handleEdit = () => { setSnapshot(form); setIsEditing(true); };
  const handleCancel = () => { setForm(snapshot); setIsEditing(false); };
  const handleSave = () => {
    setIsEditing(false);
    const payload = {
      [sectionKey]: {
        guest_keys: parseInt(form.guest_keys) || 0,
        representative_name: form.representative_name,
        old_checkin_date: form.old_checkin_date,
        old_checkout_date: form.old_checkout_date,
        checkin_time: form.checkin_time,
        checkout_time: form.checkout_time,
        adult_count: parseInt(form.adult_count) || 0,
        children_count: parseInt(form.children_count) || 0,
        goki_code: form.goki_code,
      },
    };
    console.log("Guest Information API Payload -->", payload);
  };

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
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer">
                <X className="w-3 h-3" />Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer">
                <Check className="w-3 h-3" />Save
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors cursor-pointer">
              <Pencil className="w-3 h-3" />Edit
            </button>
          )}
        </div>
      </div>

      {/* 3-col field grid */}
      <div className="grid grid-cols-3 gap-x-8 gap-y-5 mb-5">

        {/* Row 1: non-editable */}
        <F label="Full Name" value={g.full_name} />
        <F label="Email" value={g.email} />
        <F label="Phone" value={g.phone} />

        {/* Row 2: Check-In Time / Check-Out Time / Guest Keys */}
        {isEditing ? (
          <>
            <div>
              <Label>Check-In Time</Label>
              <input type="time" value={form.checkin_time} onChange={e => set("checkin_time")(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Check-Out Time</Label>
              <input type="time" value={form.checkout_time} onChange={e => set("checkout_time")(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Guest Keys</Label>
              <input type="number" value={form.guest_keys} onChange={e => set("guest_keys")(e.target.value)} min="0" className={inputCls} />
            </div>
          </>
        ) : (
          <>
            <F label="Check-In Time" value={form.checkin_time || "—"} />
            <F label="Check-Out Time" value={form.checkout_time || "—"} />
            <F label="Guest Keys" value={form.guest_keys} />
          </>
        )}

        {/* Row 3: Representative / Goki Code / Old Check-In */}
        {isEditing ? (
          <>
            <div>
              <Label>Representative</Label>
              <input type="text" value={form.representative_name} onChange={e => set("representative_name")(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Goki Code</Label>
              <input type="text" value={form.goki_code} onChange={e => set("goki_code")(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Old Check-In</Label>
              <input type="date" value={form.old_checkin_date} onChange={e => set("old_checkin_date")(e.target.value)} className={inputCls} />
            </div>
          </>
        ) : (
          <>
            <F label="Representative" value={form.representative_name} />
            <F label="Goki Code" value={form.goki_code} />
            <F label="Old Check-In" value={form.old_checkin_date} />
          </>
        )}

        {/* Row 4: Old Check-Out / Adults / Children */}
        {isEditing ? (
          <>
            <div>
              <Label>Old Check-Out</Label>
              <input type="date" value={form.old_checkout_date} onChange={e => set("old_checkout_date")(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Adults</Label>
              <input type="number" value={form.adult_count} onChange={e => set("adult_count")(e.target.value)} min="1" className={inputCls} />
            </div>
            <div>
              <Label>Children</Label>
              <input type="number" value={form.children_count} onChange={e => set("children_count")(e.target.value)} min="0" className={inputCls} />
            </div>
          </>
        ) : (
          <>
            <F label="Old Check-Out" value={form.old_checkout_date} />
            <F label="Adults" value={form.adult_count} />
            <F label="Children" value={form.children_count} />
          </>
        )}
      </div>

      <div className="border-t border-slate-200 mb-5" />

      {/* Bottom: system IDs (non-editable) */}
      <div className="grid grid-cols-3 gap-x-8">
        <F label="Guest ID" value={g.guest_id} />
        <F label="Created At" value={g.created_at} />
      </div>
    </div>
  );
};

export default GuestInformation;
