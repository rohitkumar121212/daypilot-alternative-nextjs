"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((m) => m.Editor),
  { ssr: false }
);

interface TaskItem {
  [key: string]: unknown;
}

interface AdditionalInformation {
  booking_notes: string;
  meal_plan: Record<string, unknown> | unknown[];
  messages: { messages: unknown[]; total: number } | unknown[];
  ota_notes: string;
  policies: string | unknown[];
  preferences: { preferences: unknown[]; total: number } | unknown[];
  smoking_preference: string;
  tasks: { tasks: TaskItem[]; total: number } | TaskItem[];
  guest_preferences: { guest_preferences: unknown[]; total: number } | unknown[];
}

interface SupportTabProps {
  additionalInformation: AdditionalInformation;
}


const getMealPlanName = (mp: Record<string, unknown> | unknown[]): string => {
  if (Array.isArray(mp)) return mp.length ? String(mp[0]) : "NA";
  if (mp && typeof mp === "object") {
    const name = (mp as Record<string, unknown>).name;
    return name ? String(name) : "NA";
  }
  return "NA";
};

const getArray = <T,>(
  val: { [key: string]: T[] | unknown } | T[] | unknown
): T[] => {
  if (Array.isArray(val)) return val as T[];
  if (val && typeof val === "object") {
    const inner = Object.values(val as Record<string, unknown>).find(Array.isArray);
    return (inner as T[]) ?? [];
  }
  return [];
};

const TINYMCE_INIT_BASE = {
  menubar: true,
  statusbar: true,
  branding: false,
  plugins: "lists link autolink",
  content_style:
    "body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 13px; color: #475569; margin: 8px; }",
};

const SupportTab = ({ additionalInformation: info }: SupportTabProps) => {
  const [editing, setEditing] = useState(false);
  const [bookingNotes, setBookingNotes] = useState(info.booking_notes || "");
  const [otaNotes] = useState(info.ota_notes || "");

  const tasks = getArray<TaskItem>(info.tasks);
  const messages = getArray<unknown>(info.messages);
  const preferences = getArray<unknown>(info.preferences);
  const guestPrefs = getArray<unknown>(info.guest_preferences);

  const policies = typeof info.policies === "string"
    ? info.policies
    : Array.isArray(info.policies) ? (info.policies as string[]).join(", ") : "";

  const mealPlan = getMealPlanName(info.meal_plan as Record<string, unknown> | unknown[]);

  return (
    <div className="space-y-5">

      {/* ── Additional Notes ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Additional Notes</h2>
          <div className="flex items-center gap-3">
            <button className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
              View Update History →
            </button>
            <button
              onClick={() => setEditing((v) => !v)}
              className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              {editing ? "Done" : "Enable Editing"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              OTA Notes
            </p>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={otaNotes || "<p>None</p>"}
                disabled
                init={{
                  ...TINYMCE_INIT_BASE,
                  toolbar: false,
                  height: 300,
                }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Booking Notes
            </p>
            <div className={`border rounded-lg overflow-hidden ${editing ? "border-blue-300" : "border-slate-200"}`}>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={bookingNotes}
                disabled={!editing}
                onEditorChange={(content) => setBookingNotes(content)}
                init={{
                  ...TINYMCE_INIT_BASE,
                  toolbar: editing
                    ? "bold italic underline | bullist numlist | link"
                    : false,
                  height: 300,
                }}
              />
            </div>

          </div>
        </div>
      </div>

      {/* ── Stay Rules | Preferences | Guest Preferences ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Stay Rules */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Stay Rules</h2>
          <div className="space-y-3">
            {[
              { label: "Policies", value: policies || "NA" },
              { label: "Meal Plan", value: mealPlan },
              { label: "Smoking Preference", value: info.smoking_preference || "NA" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-600">{label}</span>
                <span className="text-sm font-medium text-slate-400">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Preferences</h2>
            <button className="text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors">
              + Add
            </button>
          </div>
          {preferences.length === 0 ? (
            <p className="text-sm text-slate-400">No Preferences Added</p>
          ) : (
            <ul className="space-y-2">
              {preferences.map((p, i) => (
                <li key={i} className="text-sm text-slate-700">
                  {typeof p === "string" ? p : JSON.stringify(p)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Guest Preferences */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Guest Preferences</h2>
            <button className="text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors">
              + Add
            </button>
          </div>
          {guestPrefs.length === 0 ? (
            <p className="text-sm text-slate-400">No Guest Preferences Added</p>
          ) : (
            <ul className="space-y-2">
              {guestPrefs.map((p, i) => (
                <li key={i} className="text-sm text-slate-700">
                  {typeof p === "string" ? p : JSON.stringify(p)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Tasks | Messages ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Tasks */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Tasks</h2>
            <button className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              + Add Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400">No Tasks Added</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task, i) => {
                const tag = String(task.tag ?? task.tag_raw ?? task.importance ?? task.priority ?? "");
                const title = String(task.text ?? task.title ?? task.name ?? task.task_name ?? "—");
                const date = String(task.date ?? task.due_date ?? task.created_at ?? "");
                const assignee = String(task.assigned_to ?? task.assignee ?? "");
                const iconUrl = task.icon_url ? String(task.icon_url) : null;
                const tagLower = tag.toLowerCase();
                const tagStyle =
                  tagLower === "important" || tagLower === "high"
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : tagLower === "urgent" || tagLower === "critical"
                    ? "bg-red-100 text-red-600 border-red-200"
                    : tagLower === "low"
                    ? "bg-slate-100 text-slate-500 border-slate-200"
                    : "bg-blue-100 text-blue-700 border-blue-200";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0"
                  >
                    {iconUrl && (
                      <img src={iconUrl} alt="" className="w-3 h-3 shrink-0" />
                    )}
                    {tag && (
                      <span className={`text-xs font-bold border px-2 py-0.5 rounded shrink-0 ${tagStyle}`}>
                        {tag}
                      </span>
                    )}
                    <span className="text-sm text-slate-800 flex-1">
                      {title}{date ? ` — ${date}` : ""}
                    </span>
                    {assignee && (
                      <span className="text-xs text-slate-500 shrink-0">{assignee}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Messages</h2>
            <button className="text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-colors">
              + Add Message
            </button>
          </div>
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">No Message Added</p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className="text-sm text-slate-700 py-2 border-b border-slate-50 last:border-0">
                  {typeof msg === "string" ? msg : JSON.stringify(msg)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default SupportTab;
