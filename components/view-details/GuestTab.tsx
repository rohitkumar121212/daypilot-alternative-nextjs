"use client";

import { useState } from "react";
import GuestInformation, { GuestDetails } from "@/components/view-details/GuestInformation";

interface AdditionalGuest {
  [key: string]: unknown;
}

interface GuestTabProps {
  guestDetails: GuestDetails;
  additionalGuests: AdditionalGuest[];
  checkIn?: string;
  checkInTime?: string;
  checkOut?: string;
  checkOutTime?: string;
  recentInspections?: Record<string, unknown>[];
  rewards?: { value_field_1?: string; value_field_2?: string };
  onGuestSave?: (data: Partial<GuestDetails>) => void;
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left text-xs font-semibold text-slate-400 pb-3 pr-4 whitespace-nowrap">
    {children}
  </th>
);

const formatDisplay = (date?: string, time?: string) => {
  if (!date) return "—";
  return time && time !== "00:00" ? `${date} · ${time}` : date;
};

const GuestTab = ({
  guestDetails,
  additionalGuests,
  checkIn,
  checkInTime,
  checkOut,
  checkOutTime,
  recentInspections = [],
  rewards,
  onGuestSave,
}: GuestTabProps) => {
  const [rewardProgram, setRewardProgram] = useState(rewards?.value_field_1 ?? "");
  const [rewardNotes, setRewardNotes] = useState(rewards?.value_field_2 ?? "");

  const checkInDisplay = formatDisplay(checkIn, checkInTime);
  const checkOutDisplay = formatDisplay(checkOut, checkOutTime);

  return (
    <div className="grid grid-cols-3 gap-6">

      {/* ── LEFT (col-span-2) ── */}
      <div className="col-span-2 space-y-5">

        {/* Primary Guest */}
        <GuestInformation
          guestDetails={guestDetails}
          checkInDisplay={checkInDisplay}
          checkOutDisplay={checkOutDisplay}
          onSave={onGuestSave}
        />

        {/* Additional Guests */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Additional Guests</h2>
            <button className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors">
              + Add Guest
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <TH>Name</TH>
                  <TH>Type</TH>
                  <TH>Contact</TH>
                  <TH>Email</TH>
                  <TH>Nationality</TH>
                </tr>
              </thead>
              <tbody>
                {additionalGuests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                      No additional guests
                    </td>
                  </tr>
                ) : (
                  additionalGuests.map((g, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                      <td className="py-3 pr-4 text-sm font-medium text-slate-800">
                        {String(g.full_name ?? g.name ?? "—")}
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-600">
                        {String(g.type ?? g.guest_type ?? "—")}
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-600">
                        {String(g.phone ?? g.contact ?? "—")}
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-600">
                        {String(g.email ?? "—")}
                      </td>
                      <td className="py-3 text-sm text-slate-600">
                        {String(g.nationality ?? "—")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── RIGHT (col-span-1) ── */}
      <div className="col-span-1 space-y-5">

        {/* Pre-Arrival & Inspections */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Pre-Arrival &amp; Inspections</h2>

          {/* Pre-Arrival Form */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Pre-Arrival Form
            </p>
            <div className="flex items-center gap-2">
              {guestDetails.prearrival_form_completed ? (
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Form Filled
                </span>
              ) : (
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  Form Not Yet Filled
                </span>
              )}
              <button className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                Fill Details →
              </button>
            </div>
          </div>

          {/* Latest Inspection */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Latest Inspection
            </p>
            {recentInspections.length === 0 ? (
              <p className="text-sm text-slate-400">No inspections recorded</p>
            ) : (
              <>
                <select className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-300 mb-2">
                  {recentInspections.map((insp, i) => {
                    const label = String(
                      insp.label ?? insp.title ?? insp.name ??
                      `${insp.property ?? ""} — ${insp.date ?? ""}`
                    );
                    return <option key={i} value={i}>{label}</option>;
                  })}
                </select>
                <button className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                  Show all inspections
                </button>
              </>
            )}
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Rewards</h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Program / ID
              </p>
              <input
                type="text"
                value={rewardProgram}
                onChange={(e) => setRewardProgram(e.target.value)}
                placeholder="Enter Value"
                className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-300 placeholder:text-slate-300 transition-colors"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Notes
              </p>
              <input
                type="text"
                value={rewardNotes}
                onChange={(e) => setRewardNotes(e.target.value)}
                placeholder="Enter Value"
                className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-300 placeholder:text-slate-300 transition-colors"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuestTab;
