"use client";

import { useState } from "react";
import { AlertCircle, Bold, Italic, List, AlignLeft, Table, Type, ChevronDown, History } from "lucide-react";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const RichTextEditor = ({ label, value, onChange, disabled }: RichTextEditorProps) => {
  const toolbarItems = ["File", "Edit", "View", "Insert", "Format", "Table"];

  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
      <div className={`border border-slate-200 rounded-lg overflow-hidden ${disabled ? "opacity-60" : ""}`}>
        {/* Menu bar */}
        <div className="flex items-center gap-4 px-3 py-2 border-b border-slate-100 bg-slate-50">
          {toolbarItems.map((item) => (
            <button
              key={item}
              disabled={disabled}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors disabled:cursor-not-allowed"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Icon toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
          <button disabled={disabled} className="p-1.5 rounded hover:bg-slate-200 transition-colors disabled:cursor-not-allowed">
            <Table className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <ChevronDown className="w-3 h-3 text-slate-300" />
        </div>

        {/* Editor area */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder=""
          className="w-full h-36 px-3 py-3 text-sm text-slate-700 resize-none outline-none bg-white placeholder:text-slate-300 disabled:cursor-not-allowed"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-300 font-mono">p</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border border-rose-400 flex items-center justify-center">
              <span className="text-[8px] text-rose-400 font-bold">t</span>
            </div>
            <span className="text-xs text-slate-300">tiny</span>
            <span className="text-slate-300 text-xs">↗</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AdditionalNotesProps {
  otaNotes?: string;
  bookingNotes?: string;
  onOtaNotesChange?: (val: string) => void;
  onBookingNotesChange?: (val: string) => void;
  onViewHistory?: () => void;
}

const AdditionalNotes = ({
  otaNotes = "",
  bookingNotes = "",
  onOtaNotesChange,
  onBookingNotesChange,
  onViewHistory,
}: AdditionalNotesProps) => {
  const [editing, setEditing] = useState(false);
  const [ota, setOta] = useState(otaNotes);
  const [booking, setBooking] = useState(bookingNotes);

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Additional Notes</h3>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <p className="text-xs text-slate-500">
              <span className="text-rose-500 font-semibold">Please Note *</span>
              {" – Enable editing before adding new data."}
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
            editing
              ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          {editing ? "Lock Editing" : "Enable Editing"}
        </button>
      </div>

      <RichTextEditor
        label="OTA Notes"
        value={ota}
        onChange={(v) => { setOta(v); onOtaNotesChange?.(v); }}
        disabled={!editing}
      />

      <RichTextEditor
        label="Booking Notes"
        value={booking}
        onChange={(v) => { setBooking(v); onBookingNotesChange?.(v); }}
        disabled={!editing}
      />

      {/* View History */}
      <button
        onClick={onViewHistory}
        className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors mt-2"
      >
        <History className="w-3.5 h-3.5" />
        View Notes Update History
      </button>
    </div>
  );
};

export default AdditionalNotes;