"use client";

import { proxyFetch } from "@/utils/proxyFetch";
import { Copy, Loader2, Mail, Search } from "lucide-react";
import { useEffect, useState } from "react";

type Row = Record<string, unknown>;

interface SupportContentProps {
  bookingId: string | number;
  cases: {
    apartment_related: Row[];
    guest_related: Row[];
  };
  electricityUsage?: {
    meter_data_present: boolean;
    readings: unknown[];
  };
  enquiryManager?: string;
  guestAppOrders?: Row[];
  guestParking?: Row[];
  maintenanceTasks?: Row[];
  serviceRecoveryRequests?: Row[];
  propertyContext?: {
    cases_logs: unknown[];
    maintenance_logs: unknown[];
    property_name: string;
    recent_inspections: Row[];
  };
  pmsFormsAndEmails: {
    available_email_templates: Row[];
    available_pms_forms: Row[];
    pms_form_responses: Row[];
  };
}

// ── helpers ───────────────────────────────────────────────────────────────────

const str = (v: unknown) => (v == null || v === "" ? "—" : String(v));

const caseStatusStyle = (s: string) => {
  const v = s.toLowerCase();
  if (v === "closed" || v === "resolved")
    return "bg-slate-100 text-slate-500 border-slate-200";
  if (v === "open" || v === "active")
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (v === "pending")
    return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
};

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left text-xs font-semibold text-slate-400 pb-3 pr-4 whitespace-nowrap">
    {children}
  </th>
);

const TD = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`py-3 pr-4 text-sm text-slate-700 ${className}`}>{children}</td>
);

// ── Associated Cases ──────────────────────────────────────────────────────────

const CasesCard = ({
  cases,
  loading,
}: {
  cases?: SupportContentProps["cases"];
  loading?: boolean;
}) => {
  const guestRelated = cases?.guest_related ?? [];
  const apartmentRelated = cases?.apartment_related ?? [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Associated Cases</h2>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors">
          🔥 Create New Case
        </button>
      </div>

      {/* Guest-related */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-500 mb-3">Guest-related cases</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <TH>Case ID</TH><TH>Title</TH><TH>Apartment</TH>
                <TH>Owner</TH><TH>Updated</TH><TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-6 text-center text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...
                </td></tr>
              ) : guestRelated.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-sm text-slate-400">No Cases</td></tr>
              ) : (
                guestRelated.map((c, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                    <TD className="font-mono text-xs">{str(c.case_id ?? c.id)}</TD>
                    <TD className="font-medium text-slate-800">{str(c.title ?? c.subject)}</TD>
                    <TD>{str(c.apartment ?? c.apartment_name)}</TD>
                    <TD>{str(c.owner ?? c.assigned_to)}</TD>
                    <TD className="whitespace-nowrap">{str(c.updated_at ?? c.updated)}</TD>
                    <td className="py-3 pr-4">
                      {c.status ? (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${caseStatusStyle(str(c.status))}`}>
                          {str(c.status)}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apartment-related */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-3">Apartment-related cases</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <TH>Case ID</TH><TH>Title</TH><TH>Property</TH>
                <TH>Owner</TH><TH>Updated</TH><TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-6 text-center text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...
                </td></tr>
              ) : apartmentRelated.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-sm text-slate-400">No Cases</td></tr>
              ) : (
                apartmentRelated.map((c, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                    <TD className="font-mono text-xs">{str(c.case_id ?? c.id)}</TD>
                    <TD className="font-medium text-slate-800 max-w-xs">{str(c.title ?? c.subject)}</TD>
                    <TD>{str(c.property ?? c.apartment ?? c.apartment_name)}</TD>
                    <TD>{str(c.owner ?? c.assigned_to)}</TD>
                    <TD className="whitespace-nowrap">{str(c.updated_at ?? c.updated)}</TD>
                    <td className="py-3 pr-4">
                      {c.status ? (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${caseStatusStyle(str(c.status))}`}>
                          {str(c.status)}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Maintenance Tasks ─────────────────────────────────────────────────────────

const MaintenanceCard = ({ tasks = [] }: { tasks?: Row[] }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-base font-bold text-slate-900">Associated Maintenance Tasks</h2>
      <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors">
        🔧 Create New Task
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <TH>Task ID</TH>
            <TH>Title</TH>
            <TH>Owner</TH>
            <TH>Updated</TH>
            <TH>Due</TH>
            <TH>Status</TH>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-center text-sm text-slate-400">No Task Found</td>
            </tr>
          ) : (
            tasks.map((t, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                <TD className="font-mono text-xs">{str(t.task_id ?? t.id)}</TD>
                <TD className="font-medium text-slate-800">{str(t.title ?? t.name)}</TD>
                <TD>{str(t.owner ?? t.assigned_to)}</TD>
                <TD className="whitespace-nowrap">{str(t.updated_at ?? t.updated)}</TD>
                <TD className="whitespace-nowrap">{str(t.due_date ?? t.due)}</TD>
                <td className="py-3 pr-4">
                  {t.status ? (
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${caseStatusStyle(str(t.status))}`}>
                      {str(t.status)}
                    </span>
                  ) : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ── PMS Forms & Emails ────────────────────────────────────────────────────────

const PmsFormsCard = ({
  pmsFormsAndEmails,
  emailTemplatesOverride,
}: {
  pmsFormsAndEmails: SupportContentProps["pmsFormsAndEmails"];
  emailTemplatesOverride?: Row[];
}) => {
  const [search, setSearch] = useState("");

  const templates = emailTemplatesOverride ?? pmsFormsAndEmails.available_email_templates;
  const forms = pmsFormsAndEmails.available_pms_forms;
  const responses = pmsFormsAndEmails.pms_form_responses;

  const filtered = templates.filter((t) => {
    const name = str(t.name ?? t.title ?? "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const visibleTemplates = search ? filtered : templates.slice(0, 5);
  const remaining = templates.length - visibleTemplates.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">PMS Forms &amp; Emails</h2>
        <span className="text-xs text-slate-400">
          ~{templates.length || 160} email templates &middot; {forms.length || 12} PMS forms
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Left: Available PMS Forms */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3">Available PMS Forms</p>
          {forms.length === 0 ? (
            <p className="text-sm text-slate-400 mb-4">No forms available</p>
          ) : (
            <div className="space-y-2 mb-5">
              {forms.map((form, i) => {
                const name = str(form.name ?? form.title ?? form.form_name);
                const emailUrl = str(form.email_url ?? "");
                const copyLink = str(form.copy_link_id ?? form.copy_link ?? "");
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-800">{name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={emailUrl !== "—" ? emailUrl : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                      >
                        <Mail className="w-3 h-3" /> Email
                      </a>
                      <button
                        onClick={() => copyLink !== "—" && navigator.clipboard.writeText(copyLink)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                      >
                        <Copy className="w-3 h-3" /> Copy link
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs font-semibold text-slate-500 mb-2">PMS Form Responses</p>
          {responses.length === 0 ? (
            <p className="text-sm text-slate-400">No responses yet</p>
          ) : (
            <div className="space-y-2">
              {responses.map((r, i) => {
                const name = str(r.form_name ?? r.name);
                const date = str(r.created_at ?? r.submitted_at ?? r.date);
                const url = str(r.view_new_tab_url ?? r.url ?? "");
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm text-slate-800">{name}</p>
                      {date !== "—" && (
                        <p className="text-xs text-slate-400 mt-0.5">{date}</p>
                      )}
                    </div>
                    {url !== "—" && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap ml-3"
                      >
                        View →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Email Templates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500">Email Templates</p>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${templates.length || 160}+ templates...`}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-300 bg-white text-slate-700"
            />
          </div>

          {templates.length === 0 ? (
            <p className="text-sm text-slate-400">No templates available</p>
          ) : (
            <>
              <div className="space-y-0">
                {visibleTemplates.map((t, i) => {
                  const name = str(t.name ?? t.title ?? t.template_name);
                  const subtitle = str(t.subtitle ?? t.type ?? t.category ?? t.recipient ?? "");
                  const isShared = t.shared === true || t.is_shared === true || String(t.status ?? "").includes("green");
                  const sharedDate = str(t.shared_date ?? t.shared_at ?? "");
                  return (
                    <div key={i} className="flex items-start justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{name}</p>
                        {subtitle && subtitle !== "—" && (
                          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {isShared ? (
                          <>
                            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                              Shared{sharedDate !== "—" ? ` · ${sharedDate}` : ""}
                            </span>
                            <a
                              href={str(t.url ?? "#")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap"
                            >
                              Share again →
                            </a>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                              Not Shared
                            </span>
                            <a
                              href={str(t.url ?? "#")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap"
                            >
                              Share →
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!search && remaining > 0 && (
                <p className="text-xs text-slate-400 text-center pt-3">
                  ...{remaining} more templates
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const SupportContent = ({
  bookingId,
  cases: fallbackCases,
  maintenanceTasks,
  pmsFormsAndEmails,
}: SupportContentProps) => {
  const [cases, setCases] = useState<SupportContentProps["cases"] | null>(null);
  const [casesLoading, setCasesLoading] = useState(true);
  const [emailTemplates, setEmailTemplates] = useState<Row[]>([]);

  // useEffect(() => {
  //   const fetchCases = async () => {
  //     try {
  //       const res = await proxyFetch(
  //         `/api/aperfect10/pms/fetch-cases/${bookingId}`,
  //         { method: "POST" }
  //       );
  //       if (res?.isSuccess && res?.data) {
  //         // console.log("res---- ", res.data?.apartment_wise_cases?.guest_related)
  //         setCases({
  //           guest_related: res.data.guest_and_booking_wise_cases ?? [],
  //           apartment_related: res.data.apartment_wise_cases ?? [],
  //         });
  //       } else {
  //         setCases(fallbackCases);
  //       }
  //     } catch {
  //       setCases(fallbackCases);
  //     } finally {
  //       setCasesLoading(false);
  //     }
  //   };
  //   fetchCases();
  // }, [bookingId]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch(`/booking-details/fetch-cases.json`);
        const json = await res.json();
        setCases({
          guest_related: json?.data?.data?.guest_and_booking_wise_cases ?? [],
          apartment_related: json?.data?.data?.apartment_wise_cases ?? [],
        });
      } catch {
        setCases(fallbackCases);
      } finally {
        setCasesLoading(false);
      }
    };
    fetchCases();
  }, []);

  // useEffect(() => {
  //   const fetchEmailTemplates = async () => {
  //     try {
  //       const res = await proxyFetch(
  //         `/api/aperfect10/pms/email-templates/${bookingId}`,
  //         { method: "GET" }
  //       );
  //       if (res?.isSuccess && res?.data) {
  //         setEmailTemplates(Object.values(res.data) as Row[]);
  //       }
  //     } catch {
  //       // fallback to prop
  //     }
  //   };
  //   fetchEmailTemplates();
  // }, [bookingId]);

  useEffect(() => {
    const fetchEmailTemplates = async () => {
      try {
        const res = await fetch(`/booking-details/pms-email-templates.json`);
        const json = await res.json();
        if (json?.data) {
          setEmailTemplates(Object.values(json.data) as Row[]);
        }
      } catch {
        // fallback to prop
      }
    };
    fetchEmailTemplates();
  }, []);



  return (
    <div className="space-y-5">
      {/* {console.log("cases---- ", cases)} */}
      <CasesCard cases={cases ?? fallbackCases} loading={casesLoading} />
      <MaintenanceCard tasks={maintenanceTasks} />
      <PmsFormsCard
        pmsFormsAndEmails={pmsFormsAndEmails}
        emailTemplatesOverride={emailTemplates.length > 0 ? emailTemplates : undefined}
      />
    </div>
  );
};

export default SupportContent;
