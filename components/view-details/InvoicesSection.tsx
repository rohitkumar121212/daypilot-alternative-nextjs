import { FileText, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Invoice {
  id: string;
  description: string;
  date: string;
  Amount: string;
  Status?: string; // 🔥 don't trust API
  currency?: string;
  INV_no?: string;
}

interface InvoicesSectionProps {
  invoices: Invoice[];
}

const statusConfig = {
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-600 border-amber-100",
    icon: <Clock className="w-3 h-3" />,
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-50 text-red-600 border-red-100",
    icon: <Clock className="w-3 h-3" />,
  },
  default: {
    label: "Unknown",
    className: "bg-slate-50 text-slate-500 border-slate-100",
    icon: <Clock className="w-3 h-3" />,
  },
};

// 🔥 Robust status resolver (no crashes ever)
const getStatusConfig = (rawStatus?: string) => {
  const status = rawStatus?.toLowerCase() || "";

  if (status.includes("paid")) return statusConfig.paid;
  if (status.includes("pend")) return statusConfig.pending;
  if (status.includes("over") || status.includes("late"))
    return statusConfig.overdue;

  return {
    ...statusConfig.default,
    label: rawStatus || "Unknown", // show actual value if unknown
  };
};

const InvoiceRow = ({ invoice }: { invoice: Invoice }) => {
  const currency = invoice.currency ?? "£";

  // 🔥 Safe status
  const status = getStatusConfig(invoice.Status);

  // 🔥 Safe amount parsing (handles commas, null, undefined)
  const amount =
    Number.parseFloat(
      (invoice?.Amount ?? "").toString().replace(/,/g, "")
    ) || 0;

  const formattedAmount = amount.toFixed(2);

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
      <div>
        <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors">
          {invoice.INV_no ?? invoice.id}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {invoice.description}
        </p>
        <p className="text-xs text-slate-400">{invoice.date}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-900">
          {currency}
          {formattedAmount}
        </span>

        <Badge
          variant="outline"
          className={`flex items-center gap-1 text-xs px-2 py-0.5 border rounded-full font-medium ${status.className}`}
        >
          {status.icon}
          {status.label}
        </Badge>
      </div>
    </div>
  );
};

const InvoicesSection = ({ invoices }: InvoicesSectionProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-rose-50 rounded-lg">
          <FileText className="w-4 h-4 text-rose-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">
          Invoices
        </h2>
      </div>

      {/* List */}
      <div>
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            No invoices found.
          </p>
        ) : (
          invoices.map((inv) => (
            <InvoiceRow key={inv.INV_no ?? inv.id} invoice={inv} />
          ))
        )}
      </div>
    </div>
  );
};

export default InvoicesSection;

// import { FileText, CheckCircle, Clock } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// export interface Invoice {
//   id: string;
//   description: string;
//   date: string;
//   Amount: string;
//   Status: "paid" | "pending" | "overdue";
//   currency?: string;
//   INV_no?: string; // Original invoice number from API
// }

// interface InvoicesSectionProps {
//   invoices: Invoice[];
// }

// const statusConfig = {
//   paid: {
//     label: "Paid",
//     className: "bg-emerald-50 text-emerald-700 border-emerald-100",
//     icon: <CheckCircle className="w-3 h-3" />,
//   },
//   pending: {
//     label: "Pending",
//     className: "bg-amber-50 text-amber-600 border-amber-100",
//     icon: <Clock className="w-3 h-3" />,
//   },
//   overdue: {
//     label: "Overdue",
//     className: "bg-red-50 text-red-600 border-red-100",
//     icon: <Clock className="w-3 h-3" />,
//   },
//   default: {
//     label: "Unknown",
//     className: "bg-slate-50 text-slate-500 border-slate-100",
//     icon: <Clock className="w-3 h-3" />,
//   },
// };

// const InvoiceRow = ({ invoice }: { invoice: Invoice }) => {
//   const currency = invoice.currency ?? "£";
//   const status = statusConfig[invoice.Status];
//   const amount = Number.parseFloat(invoice?.Amount ?? '') || 0;

//   return (
//     <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
//       <div>
//         <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors">
//           {invoice.INV_no}
//         </p>
//         <p className="text-xs text-slate-400 mt-0.5">{invoice.description}</p>
//         <p className="text-xs text-slate-400">{invoice.date}</p>
//       </div>
//       <div className="flex items-center gap-3">
//         <span className="text-sm font-bold text-slate-900">
//           {currency}{amount}
//         </span>
//         <Badge
//           variant="outline"
//           className={`flex items-center gap-1 text-xs px-2 py-0.5 border rounded-full font-medium ${status.className}`}
//         >
//           {status.icon}
//           {status.label}
//         </Badge>
//       </div>
//     </div>
//   );
// };

// const InvoicesSection = ({ invoices }: InvoicesSectionProps) => {
//   return (
//     <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm mt-4">
//       {/* Section Header */}
//       <div className="flex items-center gap-2 mb-4">
//         <div className="p-1.5 bg-rose-50 rounded-lg">
//           <FileText className="w-4 h-4 text-rose-500" />
//         </div>
//         <h2 className="text-base font-semibold text-slate-800">Invoices</h2>
//       </div>

//       {/* Invoice List */}
//       <div>
//         {invoices.length === 0 ? (
//           <p className="text-sm text-slate-400 py-4 text-center">No invoices found.</p>
//         ) : (
//           invoices.map((inv) => <InvoiceRow key={inv.INV_no} invoice={inv} />)
//         )}
//       </div>
//     </div>
//   );
// };

// export default InvoicesSection;