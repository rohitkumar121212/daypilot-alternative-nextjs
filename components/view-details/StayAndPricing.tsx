"use client";

import { useUser } from '@/hooks/useUser';
import { Check, Pencil, X } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useState } from "react";
interface StayAndPricingProps {
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalNights: number;
  ratePerNight: number;
  totalAmount: number;
  adults?: number;
  children?: number;
  mealPlan?: string;
  forceOverbook?: string;
  currency?: string;
  onSave?: (data: {
    checkIn: string;
    checkOut: string;
    checkInTime: string;
    checkOutTime: string;
    ratePerNight: number;
  }) => void;
}

dayjs.extend(customParseFormat);

// ── Date helpers ──────────────────────────────────────────────────────────────

const toISO = (display: string): string => {
  // API returns DD-MM-YYYY; parse explicitly to avoid JS treating it as MM-DD-YYYY
  const d = dayjs(display, "DD-MM-YYYY", true);
  if (d.isValid()) return d.format("YYYY-MM-DD");
  const fallback = dayjs(display);
  return fallback.isValid() ? fallback.format("YYYY-MM-DD") : "";
};

const toDDMMYYYY = (iso: string): string => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const toDisplayShort = (iso: string): string => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const nightsBetween = (from: string, to: string): number => {
  const diff = dayjs(to).diff(dayjs(from), "day");
  return diff > 0 ? diff : 0;
};

// ── Label/Value field ─────────────────────────────────────────────────────────

const Field = ({
  label,
  value,
  faded,
}: {
  label: string;
  value: string | number;
  faded?: boolean;
}) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-sm font-semibold ${faded ? "text-slate-300" : "text-slate-800"}`}>
      {value === "" || value === null || value === undefined ? "—" : String(value)}
    </p>
  </div>
);

const EditableField = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-50 bg-white text-slate-800 transition-all"
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const StayAndPricing = ({
  checkIn,
  checkOut,
  checkInTime = "",
  checkOutTime = "",
  totalNights,
  ratePerNight,
  adults,
  children,
  mealPlan = "",
  forceOverbook = "",
  currency = "£",
  onSave,
}: StayAndPricingProps) => {
  const initCheckIn = toISO(checkIn) || checkIn;
  const initCheckOut = toISO(checkOut) || checkOut;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    checkIn: initCheckIn,
    checkOut: initCheckOut,
    checkInTime,
    checkOutTime,
    ratePerNight: String(ratePerNight),
  });
  const [snapshot, setSnapshot] = useState(form);

  const nights = nightsBetween(form.checkIn, form.checkOut) || Number(totalNights) || 0;
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleEdit = () => { setSnapshot(form); setIsEditing(true); };
  const handleCancel = () => { setForm(snapshot); setIsEditing(false); };
  const handleSave = () => {
    setIsEditing(false);
    onSave?.({
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime,
      ratePerNight: parseFloat(form.ratePerNight) || 0,
    });
  };

  const displayCheckIn = `${toDDMMYYYY(form.checkIn)}${form.checkInTime ? " " + form.checkInTime : ""}`;
  const displayCheckOut = `${toDDMMYYYY(form.checkOut)}${form.checkOutTime ? " " + form.checkOutTime : ""}`;
  const summaryFrom = toDisplayShort(form.checkIn);
  const summaryTo = toDisplayShort(form.checkOut);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Stay & Pricing</h2>
        <div className="flex items-center gap-3">
          {(summaryFrom || summaryTo) && (
            <span className="text-xs text-slate-400">
              {nights} nights &middot; {summaryFrom} &rarr; {summaryTo}
            </span>
          )}
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

      {/* Row 1: Check-in / Check-out / Nights / Rate */}
      <div className="grid grid-cols-4 gap-x-6 gap-y-5 mb-5">
        {isEditing ? (
          <>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-In</p>
              <input type="date" value={form.checkIn} onChange={(e) => {
                set("checkIn")(e.target.value);
                if (e.target.value >= form.checkOut) {
                  const next = new Date(e.target.value + "T00:00:00");
                  next.setDate(next.getDate() + 1);
                  set("checkOut")(next.toISOString().split("T")[0]);
                }
              }} className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 bg-white text-slate-800" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-Out</p>
              <input type="date" value={form.checkOut} min={form.checkIn} onChange={(e) => set("checkOut")(e.target.value)} className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 bg-white text-slate-800" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Nights</p>
              <p className="text-sm font-semibold text-slate-400 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">{nights} <span className="text-xs">(auto)</span></p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Rate / Night</p>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">{`${currency} `}</span>
                <input type="number" value={form.ratePerNight} onChange={(e) => set("ratePerNight")(e.target.value)} className="w-full text-sm font-semibold rounded-lg pl-6 pr-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 bg-white text-slate-800" />
              </div>
            </div>
          </>
        ) : (
          <>
            <Field label="Check-In" value={displayCheckIn} />
            <Field label="Check-Out" value={displayCheckOut} />
            <Field label="Total Nights" value={nights} />
            <Field label="Rate / Night" value={`${currency} ${(Number(form.ratePerNight) || 0).toFixed(2)}`} />
          </>
        )}
      </div>

      {/* Row 2: Adults / Children / Meal Plan / Force Overbook */}
      <div className="grid grid-cols-4 gap-x-6 gap-y-5 mb-5">
        {isEditing ? (
          <>
            <EditableField label="Adults" value={String(adults ?? "")} onChange={() => { }} type="number" />
            <EditableField label="Children" value={String(children ?? "")} onChange={() => { }} type="number" />
            <EditableField label="Meal Plan" value={mealPlan} onChange={() => { }} />
            {/* <EditableField label="Force Overbook" value={forceOverbook} onChange={() => { }} /> */}
          </>
        ) : (
          <>
            <Field label="Adults" value={adults ?? "—"} />
            <Field label="Children" value={children ?? "—"} />
            <Field label="Meal Plan" value={mealPlan || "NA"} faded={!mealPlan} />
            {/* <Field label="Force Overbook" value={forceOverbook || "—"} faded={!forceOverbook} /> */}
          </>
        )}
      </div>

      {/* Time row */}
      {(form.checkInTime || form.checkOutTime || isEditing) && (
        <div className="grid grid-cols-4 gap-x-6 mb-5">
          {isEditing ? (
            <>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-In Time</p>
                <input type="time" value={form.checkInTime} onChange={(e) => set("checkInTime")(e.target.value)} className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 bg-white text-slate-800" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-Out Time</p>
                <input type="time" value={form.checkOutTime} onChange={(e) => set("checkOutTime")(e.target.value)} className="w-full text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none focus:border-rose-400 bg-white text-slate-800" />
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Footer link */}
      {/* <button className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors">
        View rate calculation &rarr;
      </button> */}
    </div>
  );
};

export default StayAndPricing;
