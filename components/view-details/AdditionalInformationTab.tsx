"use client";

import { useState } from "react";
import {
  FileText, Tag, Globe, Building2, Car, Wifi, Coffee,
  PawPrint, Baby, Accessibility, Clock, AlertTriangle,
  StickyNote, CalendarClock, Clipboard
} from "lucide-react";

interface InfoFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
}

const InfoField = ({ label, value, placeholder, icon, multiline }: InfoFieldProps) => (
  <div className="mb-4">
    <div className="flex items-center gap-1.5 mb-1.5">
      {icon && <span className="text-slate-400">{icon}</span>}
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    </div>
    {multiline ? (
      <textarea
        defaultValue={value}
        placeholder={placeholder ?? "Not specified"}
        rows={3}
        className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-50 resize-none transition-colors placeholder:text-slate-300"
      />
    ) : (
      <input
        type="text"
        defaultValue={value}
        placeholder={placeholder ?? "Not specified"}
        className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-50 transition-colors placeholder:text-slate-300"
      />
    )}
  </div>
);

interface TagBadgeProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const TagBadge = ({ label, active, onClick }: TagBadgeProps) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active
        ? "bg-rose-50 text-rose-600 border-rose-200"
        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
    }`}
  >
    {label}
  </button>
);

// ─── Mock Data ────────────────────────────────────────────────────────────────
const AMENITIES = ["WiFi", "Parking", "Pet Friendly", "Baby Cot", "Wheelchair Access", "Coffee Machine", "Early Check-in", "Late Check-out"];
const SOURCE_TAGS = ["Direct", "OTA", "Corporate", "Sublet", "Agency"];
// ─────────────────────────────────────────────────────────────────────────────

const AdditionalInformationTab = () => {
  const [activeAmenities, setActiveAmenities] = useState<string[]>(["WiFi"]);
  const [activeSource, setActiveSource] = useState<string>("Sublet");

  const toggleAmenity = (a: string) =>
    setActiveAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );

  return (
    <div className="grid grid-cols-3 gap-6">

      {/* ── Col 1: Booking Reference & Source ── */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <FileText className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Booking Reference</h3>
          </div>
          <InfoField label="External Reference ID" placeholder="e.g. BK-2026-00123" icon={<Tag className="w-3.5 h-3.5" />} />
          <InfoField label="PMS Reference" placeholder="e.g. PMS-998877" icon={<Clipboard className="w-3.5 h-3.5" />} />
          <InfoField label="Channel Reference" placeholder="e.g. OTA-55432" icon={<Globe className="w-3.5 h-3.5" />} />
          <InfoField label="Company / Corporate Account" placeholder="e.g. GSK Corporate" icon={<Building2 className="w-3.5 h-3.5" />} />
        </div>

        {/* Booking Source Tags */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <Tag className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Booking Source</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {SOURCE_TAGS.map((s) => (
              <TagBadge key={s} label={s} active={activeSource === s} onClick={() => setActiveSource(s)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Col 2: Arrival & Departure Details ── */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <CalendarClock className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Arrival & Departure</h3>
          </div>
          <InfoField label="Estimated Arrival Time" placeholder="e.g. 15:00" icon={<Clock className="w-3.5 h-3.5" />} />
          <InfoField label="Estimated Departure Time" placeholder="e.g. 10:00" icon={<Clock className="w-3.5 h-3.5" />} />
          <InfoField label="Flight / Train Number" placeholder="e.g. BA 0274" icon={<Globe className="w-3.5 h-3.5" />} />
          <InfoField label="Parking Required" placeholder="Yes / No" icon={<Car className="w-3.5 h-3.5" />} />
          <InfoField label="Access Code / Key Instructions" placeholder="Key safe code..." icon={<StickyNote className="w-3.5 h-3.5" />} multiline />
        </div>
      </div>

      {/* ── Col 3: Amenities & Special Requests ── */}
      <div className="space-y-4">
        {/* Amenities */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <Wifi className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Requested Amenities</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <TagBadge key={a} label={a} active={activeAmenities.includes(a)} onClick={() => toggleAmenity(a)} />
            ))}
          </div>
        </div>

        {/* Special Requests */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Special Requests</h3>
          </div>
          <InfoField
            label="Guest Special Request"
            placeholder="e.g. High floor, hypoallergenic bedding..."
            icon={<Baby className="w-3.5 h-3.5" />}
            multiline
          />
          <InfoField
            label="Accessibility Requirements"
            placeholder="e.g. Wheelchair accessible room..."
            icon={<Accessibility className="w-3.5 h-3.5" />}
            multiline
          />
          <InfoField
            label="Pet Details"
            placeholder="e.g. 1 small dog, 5kg..."
            icon={<PawPrint className="w-3.5 h-3.5" />}
          />
          <InfoField
            label="Internal Staff Notes"
            placeholder="Notes visible to staff only..."
            icon={<StickyNote className="w-3.5 h-3.5" />}
            multiline
          />
        </div>
      </div>

    </div>
  );
};

export default AdditionalInformationTab;