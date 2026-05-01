import { ChevronRight, Plus } from "lucide-react";

export interface Invoice {
  id?: string;
  description?: string;
  date?: string;
  Amount: string;
  Status?: string;
  currency?: string;
  INV_no?: string;
  Edit?: string;
  Publiclink?: string;
}

interface InvoicesSectionProps {
  invoices: Invoice[];
}

const getStatusStyle = (rawStatus?: string) => {
  const s = (rawStatus || "").toLowerCase();
  if (s.includes("paid")) return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (s.includes("authoris") || s.includes("authoriz")) return "bg-blue-100 text-blue-700 border border-blue-200";
  if (s.includes("pend")) return "bg-amber-100 text-amber-700 border border-amber-200";
  if (s.includes("over") || s.includes("late")) return "bg-red-100 text-red-600 border border-red-200";
  if (s.includes("void") || s.includes("cancel")) return "bg-slate-100 text-slate-500 border border-slate-200";
  return "bg-slate-100 text-slate-600 border border-slate-200";
};

const InvoicesSection = ({ invoices }: InvoicesSectionProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">Invoices</h2>
        <button className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Generate New
        </button>
      </div>

      {/* List */}
      <div className="space-y-0">
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No invoices found.</p>
        ) : (
          invoices.map((inv) => {
            const amount = Number.parseFloat(
              (inv?.Amount ?? "").toString().replace(/,/g, "")
            ) || 0;
            const currency = inv.currency ?? "£";
            const invNo = inv.INV_no ?? inv.id;

            return (
              <div
                key={invNo}
                className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 group cursor-pointer hover:bg-slate-50/60 rounded-lg px-2 -mx-2 transition-colors"
              >
                {/* Left: INV number + amount */}
                <div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors">
                    {invNo}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {currency}{amount.toFixed(2)}
                  </p>
                </div>

                {/* Right: status badge + arrow */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusStyle(inv.Status)}`}>
                    {inv.Status || "Unknown"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link */}
      {invoices.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors">
            View full invoice log in Payments &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoicesSection;
