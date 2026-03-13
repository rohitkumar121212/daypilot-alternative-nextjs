import { DollarSign } from "lucide-react";

interface CostBreakdownProps {
  accommodation: number;
  extraServices: number;
  currency?: string;
}

const CostBreakdown = ({
  accommodation,
  extraServices,
  currency = "£",
}: CostBreakdownProps) => {
  const total = accommodation + extraServices;

  const lineItems = [
    { label: "Accommodation", amount: accommodation },
    { label: "Extra Services", amount: extraServices },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm mt-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 bg-rose-50 rounded-lg">
          <DollarSign className="w-4 h-4 text-rose-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">Cost Breakdown</h2>
      </div>

      {/* Line Items */}
      <div className="space-y-3 mb-4">
        {lineItems.map(({ label, amount }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm font-semibold text-slate-800">
              {currency}{amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 my-3" />

      {/* Total */}
      <div className="flex items-center justify-between bg-rose-50 rounded-xl px-4 py-3">
        <span className="text-sm font-bold text-slate-800">Total Amount</span>
        <span className="text-base font-extrabold text-rose-600">
          {currency}{total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CostBreakdown;