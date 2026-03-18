"use client";

import { useState } from "react";
import { CalendarDays, Pencil, Check, X } from "lucide-react";

interface StayAndPricingProps {
  checkIn: string;
  checkOut: string;
  totalNights: number;
  ratePerNight: number;
  totalAmount: number;
  currency?: string;
  onSave?: (data: {
    checkIn: string;
    checkOut: string;
    totalNights: number;
    ratePerNight: number;
  }) => void;
}

/** Convert "09 Jan 2026" → "2026-01-09" for <input type="date"> */
const toDateInput = (display: string): string => {
  const d = new Date(display);
  if (isNaN(d.getTime())) return display;
  return d.toISOString().split("T")[0];
};

/** Convert "2026-01-09" → "09 Jan 2026" for display */
const toDisplayDate = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/** Difference in days between two ISO date strings */
const nightsBetween = (from: string, to: string): number => {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
};

interface DateFieldProps {
  label: string;
  value: string; // ISO "YYYY-MM-DD"
  onChange: (val: string) => void;
  disabled: boolean;
  min?: string;
  max?: string;
}

const DateField = ({ label, value, onChange, disabled, min, max }: DateFieldProps) => (
  <div>
    <p className="text-xs text-slate-400 mb-1">{label}</p>
    {disabled ? (
      <p className="text-sm font-semibold text-slate-800">
        {toDisplayDate(value)}
      </p>
    ) : (
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm font-semibold rounded-lg px-3 py-2 border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 shadow-sm bg-white text-slate-800 transition-all duration-200 cursor-pointer"
      />
    )}
  </div>
);

const StayAndPricing = ({
  checkIn,
  checkOut,
  totalNights,
  ratePerNight,
  currency = "£",
  onSave,
}: StayAndPricingProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    checkIn: toDateInput(checkIn),
    checkOut: toDateInput(checkOut),
    totalNights: String(totalNights),
    ratePerNight: ratePerNight.toFixed(2),
  });

  const [snapshot, setSnapshot] = useState(form);

  // Auto-derive nights from date pickers
  const derivedNights = nightsBetween(form.checkIn, form.checkOut);
  const computedTotal = derivedNights * (parseFloat(form.ratePerNight) || 0);

  const handleEdit = () => {
    setSnapshot(form);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave?.({
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      totalNights: derivedNights,
      ratePerNight: parseFloat(form.ratePerNight) || 0,
    });
  };

  const handleCancel = () => {
    setForm(snapshot);
    setIsEditing(false);
  };

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-50 rounded-lg">
            <CalendarDays className="w-4 h-4 text-rose-500" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Stay & Pricing</h2>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <DateField
          label="Check-in"
          value={form.checkIn}
          onChange={(val) => {
            set("checkIn")(val);
            // if new check-in is after check-out, push check-out forward by 1 day
            if (val >= form.checkOut) {
              const next = new Date(val + "T00:00:00");
              next.setDate(next.getDate() + 1);
              set("checkOut")(next.toISOString().split("T")[0]);
            }
          }}
          disabled={!isEditing}
        />
        <DateField
          label="Check-out"
          value={form.checkOut}
          onChange={set("checkOut")}
          disabled={!isEditing}
          min={form.checkIn}
        />
      </div>

      <div className="border-t border-slate-50 my-4" />

      {/* Nights + Rate Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Total Nights — always derived, never manually editable */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Total Nights</p>
          <div className={`rounded-lg text-sm font-semibold transition-colors ${
            isEditing ? "bg-slate-50 border border-slate-200 text-slate-500 px-3 py-2" : "text-slate-800"
          }`}>
            {derivedNights}
            {isEditing && (
              <span className="text-xs font-normal text-slate-400 ml-1">(auto-calculated)</span>
            )}
          </div>
        </div>

        {/* Rate / Night */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Rate / Night</p>
          {!isEditing ? (
            <p className="text-sm font-semibold text-slate-800">
              {currency}{parseFloat(form.ratePerNight).toFixed(2)}
            </p>
          ) : (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 pointer-events-none">
                {currency}
              </span>
              <input
                type="number"
                value={form.ratePerNight}
                onChange={(e) => set("ratePerNight")(e.target.value)}
                className="w-full text-sm font-semibold rounded-lg pl-6 pr-3 py-2 border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 shadow-sm bg-white text-slate-800 transition-all duration-200"
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-50 my-4" />

      {/* Rate Calculation */}
      <div>
        <p className="text-xs text-slate-400 mb-2">Rate Calculation</p>
        <div className={`rounded-lg px-4 py-3 transition-colors ${
          isEditing ? "bg-rose-50 border border-rose-100" : "bg-slate-50"
        }`}>
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{derivedNights} nights</span>
            {" × "}
            <span className="font-medium text-slate-800">
              {currency}{parseFloat(form.ratePerNight || "0").toFixed(2)}
            </span>
            {" = "}
            <span className={`font-bold ${isEditing ? "text-rose-600" : "text-slate-900"}`}>
              {currency}{computedTotal.toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StayAndPricing;