import { BadgePoundSterling, FileText, Inbox } from "lucide-react";

export interface PaymentHistoryEntry {
  id: string;
  paymentMode: string;
  createdAt: string;
  amount: number;
  referenceId: string;
  acceptedBy: string;
  notes: string;
  invoice?: string;
  currency?: string;
}

interface PaymentHistoryProps {
  entries: PaymentHistoryEntry[];
}

const COLUMNS = [
  "Payment Mode",
  "Created At",
  "Amount",
  "Reference ID",
  "Accepted By",
  "Notes",
  "Invoice",
];

const PaymentHistory = ({ entries }: PaymentHistoryProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-full border-2 border-rose-500 flex items-center justify-center">
          <BadgePoundSterling className="w-4 h-4 text-rose-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">Booking Payment History</h2>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-semibold text-slate-700 border border-slate-200 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-8 text-center bg-slate-50 border border-slate-200"
                >
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Inbox className="w-8 h-8 text-slate-300" />
                    <span className="text-sm font-medium">No Data Found!</span>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">
                    {entry.paymentMode}
                  </td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-500 whitespace-nowrap">
                    {entry.createdAt}
                  </td>
                  <td className="px-4 py-3 border border-slate-200 font-semibold text-slate-800">
                    {entry.currency ?? "£"}{entry.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-500 font-mono text-xs">
                    {entry.referenceId || "—"}
                  </td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">
                    {entry.acceptedBy || "—"}
                  </td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-500">
                    {entry.notes || "—"}
                  </td>
                  <td className="px-4 py-3 border border-slate-200">
                    {entry.invoice ? (
                      <button className="flex items-center gap-1 text-rose-500 hover:text-rose-700 transition-colors text-xs font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        {entry.invoice}
                      </button>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;